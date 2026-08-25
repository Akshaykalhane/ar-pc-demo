import { useEffect, useRef, useState, useCallback } from "react";

import "./App.scss";
import Webcam from "react-webcam";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  // HIGH QUALITY CAPTURE
  //
  // NO RATIO
  // NO CROP
  // NO RESIZE
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

    console.log("Capturing camera frame:", width, "x", height);

    let canvas = canvasRef.current;

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvasRef.current = canvas;
    }

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

    // Mirror captured image
    ctx.save();

    ctx.translate(width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, width, height);

    ctx.restore();

    // PNG
    const imageData = canvas.toDataURL("image/png");

    console.log("Captured PNG resolution:", width, "x", height);

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
    setIsCaptured(false);
    setCapturedImg("");
    setCountdown(3);
    setIsCounting(false);
  };

  // --------------------------------------------------
  // DOWNLOAD
  // --------------------------------------------------
  const handleDownload = () => {
    if (!capturedImg) {
      toast.warning("Please capture image first!", toastOptions);
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
  // NEXT
  // --------------------------------------------------
  const handleNext = () => {
    if (!capturedImg) {
      toast.warning("Please capture image first!", toastOptions);
      return;
    }

    console.log("Next clicked");
    console.log("Captured image:", capturedImg);

    // Add your next-page/application logic here.
  };

  // --------------------------------------------------
  // CAMERA CONSTRAINTS
  //
  // NO ASPECT RATIO
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
    <div className="flex-col-center CameraPage">
      {/* HEADING */}
      {!isCaptured ? (
        <h1 className="heading">CAPTURE YOUR PHOTO</h1>
      ) : (
        <h1 className="heading">DO YOU LIKE IT ?</h1>
      )}

      {/* CAMERA */}
      <div className="flex-row-center mainCameraWrapper">
        <div className="flex-row-center webcamParent">
          {isCaptured ? (
            <img className="capturedImage" src={capturedImg} alt="Captured" />
          ) : (
            <Webcam
              ref={camRef}
              id="webcam"
              audio={false}
              mirrored={true}
              videoConstraints={videoConstraints}
              onUserMedia={handleCameraReady}
              onUserMediaError={handleCameraError}
            />
          )}

          {/* COUNTDOWN */}
          {!isCaptured && isCounting && (
            <span className="countdown">{countdown}</span>
          )}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex-row-center bottomButton">
        {!isCaptured ? (
          <div onClick={handleCapture}>
            <button type="button" disabled={!isCameraReady || isCounting}>
              {isCounting ? "GET READY..." : "CAPTURE"}
            </button>
          </div>
        ) : (
          <>
            <div onClick={handleRetake}>
              <button type="button">RETAKE</button>
            </div>

            <div onClick={handleDownload}>
              <button type="button">DOWNLOAD</button>
            </div>

            <div onClick={handleNext}>
              <button type="button">NEXT</button>
            </div>
          </>
        )}
      </div>

      {/* HIDDEN CANVAS */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <ToastContainer />
    </div>
  );
}
