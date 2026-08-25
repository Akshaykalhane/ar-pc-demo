import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const toastOptions = {
  position: "top-center",
  autoClose: 4000,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

export default function App() {
  const camRef = useRef(null);
  const canvasRef = useRef(null);

  const [capturedImg, setCapturedImg] = useState("");
  const [isCaptured, setIsCaptured] = useState(false);

  const [countdown, setCountdown] = useState(3);
  const [isCounting, setIsCounting] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // --------------------------------------------------
  // CAMERA READY
  // --------------------------------------------------
  const handleCameraReady = useCallback(() => {
    const video = camRef.current?.video;

    if (!video) {
      console.warn("Camera video element not found.");
      return;
    }

    console.log(
      "Actual camera resolution:",
      video.videoWidth,
      "x",
      video.videoHeight,
    );

    setIsCameraReady(true);
  }, []);

  // --------------------------------------------------
  // CAMERA ERROR
  // --------------------------------------------------
  const handleCameraError = useCallback((error) => {
    console.error("Camera error:", error);

    setIsCameraReady(false);

    toast.error(
      "Unable to access camera. Please allow camera permission.",
      toastOptions,
    );
  }, []);

  // --------------------------------------------------
  // CAPTURE IMAGE
  //
  // Uses the camera's actual videoWidth/videoHeight.
  // No crop.
  // No forced ratio.
  // No resize.
  // --------------------------------------------------
  const captureImage = useCallback(() => {
    const video = camRef.current?.video;

    if (!video) {
      console.error("Video element not available.");
      return null;
    }

    if (video.readyState < 2) {
      console.error("Video is not ready.");
      return null;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      console.error("Invalid camera dimensions.");
      return null;
    }

    console.log("Capturing:", width, "x", height);

    let canvas = canvasRef.current;

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvasRef.current = canvas;
    }

    // EXACT camera resolution
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", {
      alpha: false,
    });

    if (!ctx) {
      console.error("Unable to create canvas context.");
      return null;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Mirror captured image to match live camera
    ctx.save();

    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, width, height);

    ctx.restore();

    // PNG keeps the captured pixels lossless
    const imageData = canvas.toDataURL("image/png");

    console.log("Captured PNG:", width, "x", height);

    return imageData;
  }, []);

  // --------------------------------------------------
  // COUNTDOWN
  // --------------------------------------------------
  useEffect(() => {
    if (!isCounting) {
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (countdown === 0) {
      const imageData = captureImage();

      if (imageData) {
        setCapturedImg(imageData);
        setIsCaptured(true);
      } else {
        toast.error("Failed to capture image. Please try again.", toastOptions);
      }

      setIsCounting(false);
    }
  }, [isCounting, countdown, captureImage]);

  // --------------------------------------------------
  // CAPTURE
  // --------------------------------------------------
  const handleCapture = () => {
    if (!isCameraReady) {
      toast.error("Camera is not ready yet.", toastOptions);
      return;
    }

    if (isCounting) {
      return;
    }

    setCountdown(3);
    setIsCounting(true);
  };

  // --------------------------------------------------
  // RETAKE
  // --------------------------------------------------
  const handleRetake = () => {
    setCapturedImg("");
    setIsCaptured(false);
    setCountdown(3);
    setIsCounting(false);
  };

  // --------------------------------------------------
  // DOWNLOAD IMAGE
  // --------------------------------------------------
  const handleDownload = () => {
    if (!capturedImg) {
      toast.warning("Please capture an image first.", toastOptions);
      return;
    }

    const link = document.createElement("a");

    link.href = capturedImg;

    link.download = `ai_photobooth_${Date.now()}.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // --------------------------------------------------
  // CAMERA CONSTRAINTS
  //
  // No aspect ratio.
  // Camera chooses the best supported resolution.
  // --------------------------------------------------
  const videoConstraints = {
    width: {
      ideal: 3840,
    },
    height: {
      ideal: 2160,
    },
    facingMode: {
      ideal: "user",
    },
  };

  return (
    <div className="app">
      <ToastContainer />

      {/* HEADING */}
      <h1 className="heading">
        {isCaptured ? "DO YOU LIKE IT?" : "CAPTURE YOUR PHOTO"}
      </h1>

      {/* CAMERA */}
      <div className="cameraWrapper">
        {!isCaptured ? (
          <Webcam
            ref={camRef}
            className="webcam"
            audio={false}
            mirrored={true}
            videoConstraints={videoConstraints}
            onUserMedia={handleCameraReady}
            onUserMediaError={handleCameraError}
          />
        ) : (
          <img className="capturedImage" src={capturedImg} alt="Captured" />
        )}

        {/* CAMERA STATUS */}
        {!isCaptured && !isCameraReady && (
          <div className="cameraStatus">Starting camera...</div>
        )}

        {/* COUNTDOWN */}
        {!isCaptured && isCounting && (
          <div className="countdown">{countdown}</div>
        )}
      </div>

      {/* BUTTONS */}
      <div className="buttons">
        {!isCaptured ? (
          <button
            className="btn"
            onClick={handleCapture}
            disabled={!isCameraReady || isCounting}
          >
            {isCounting ? "GET READY..." : "CAPTURE"}
          </button>
        ) : (
          <>
            <button className="btn" onClick={handleRetake}>
              RETAKE
            </button>

            <button className="btn" onClick={handleDownload}>
              DOWNLOAD IMAGE
            </button>
          </>
        )}
      </div>

      {/* HIDDEN CANVAS USED FOR CAPTURE */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
