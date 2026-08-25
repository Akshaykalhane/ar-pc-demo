// import { useEffect, useRef, useState, useCallback } from "react";

// import "./App.scss";
// import Webcam from "react-webcam";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const toastOptions = {
//   position: "top-center",
//   autoClose: 4000,
//   pauseOnHover: true,
//   draggable: true,
//   theme: "light",
// };

// export default function App() {
//   const camRef = useRef(null);
//   const canvasRef = useRef(null);

//   const [capturedImg, setCapturedImg] = useState("");
//   const [isCaptured, setIsCaptured] = useState(false);

//   const [countdown, setCountdown] = useState(3);
//   const [isCounting, setIsCounting] = useState(false);
//   const [isCameraReady, setIsCameraReady] = useState(false);

//   // --------------------------------------------------
//   // CAMERA READY
//   // --------------------------------------------------
//   const handleCameraReady = useCallback(() => {
//     const video = camRef.current?.video;

//     if (!video) {
//       console.warn("Camera video element not found.");
//       return;
//     }

//     console.log(
//       "Actual camera resolution:",
//       video.videoWidth,
//       "x",
//       video.videoHeight,
//     );

//     setIsCameraReady(true);
//   }, []);

//   // --------------------------------------------------
//   // CAMERA ERROR
//   // --------------------------------------------------
//   const handleCameraError = useCallback((error) => {
//     console.error("Camera error:", error);

//     setIsCameraReady(false);

//     toast.error(
//       "Unable to access camera. Please allow camera permission.",
//       toastOptions,
//     );
//   }, []);

//   // --------------------------------------------------
//   // HIGH QUALITY CAPTURE
//   //
//   // NO RATIO
//   // NO CROP
//   // NO RESIZE
//   // --------------------------------------------------
//   const captureImage = useCallback(() => {
//     const video = camRef.current?.video;

//     if (!video) {
//       console.error("Video element not available.");
//       return null;
//     }

//     if (video.readyState < 2) {
//       console.error("Video is not ready.");
//       return null;
//     }

//     const width = video.videoWidth;
//     const height = video.videoHeight;

//     if (!width || !height) {
//       console.error("Invalid camera dimensions.");
//       return null;
//     }

//     console.log("Capturing camera frame:", width, "x", height);

//     let canvas = canvasRef.current;

//     if (!canvas) {
//       canvas = document.createElement("canvas");
//       canvasRef.current = canvas;
//     }

//     canvas.width = width;
//     canvas.height = height;

//     const ctx = canvas.getContext("2d", {
//       alpha: false,
//     });

//     if (!ctx) {
//       console.error("Unable to create canvas context.");
//       return null;
//     }

//     ctx.imageSmoothingEnabled = true;
//     ctx.imageSmoothingQuality = "high";

//     // Mirror captured image
//     ctx.save();

//     ctx.translate(width, 0);
//     ctx.scale(-1, 1);

//     ctx.drawImage(video, 0, 0, width, height);

//     ctx.restore();

//     // PNG
//     const imageData = canvas.toDataURL("image/png");

//     console.log("Captured PNG resolution:", width, "x", height);

//     return imageData;
//   }, []);

//   // --------------------------------------------------
//   // COUNTDOWN
//   // --------------------------------------------------
//   useEffect(() => {
//     if (!isCounting) {
//       return;
//     }

//     if (countdown > 0) {
//       const timer = setTimeout(() => {
//         setCountdown((prev) => prev - 1);
//       }, 1000);

//       return () => clearTimeout(timer);
//     }

//     if (countdown === 0) {
//       const imageData = captureImage();

//       if (imageData) {
//         setCapturedImg(imageData);
//         setIsCaptured(true);
//       } else {
//         toast.error("Failed to capture image. Please try again.", toastOptions);
//       }

//       setIsCounting(false);
//     }
//   }, [isCounting, countdown, captureImage]);

//   // --------------------------------------------------
//   // CAPTURE
//   // --------------------------------------------------
//   const handleCapture = () => {
//     if (!isCameraReady) {
//       toast.error("Camera is not ready yet.", toastOptions);
//       return;
//     }

//     if (isCounting) {
//       return;
//     }

//     setCountdown(3);
//     setIsCounting(true);
//   };

//   // --------------------------------------------------
//   // RETAKE
//   // --------------------------------------------------
//   const handleRetake = () => {
//     setIsCaptured(false);
//     setCapturedImg("");
//     setCountdown(3);
//     setIsCounting(false);
//   };

//   // --------------------------------------------------
//   // DOWNLOAD
//   // --------------------------------------------------
//   const handleDownload = () => {
//     if (!capturedImg) {
//       toast.warning("Please capture image first!", toastOptions);
//       return;
//     }

//     const link = document.createElement("a");

//     link.href = capturedImg;
//     link.download = `ai_photobooth_${Date.now()}.png`;

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // --------------------------------------------------
//   // NEXT
//   // --------------------------------------------------
//   const handleNext = () => {
//     if (!capturedImg) {
//       toast.warning("Please capture image first!", toastOptions);
//       return;
//     }

//     console.log("Next clicked");
//     console.log("Captured image:", capturedImg);

//     // Add your next-page/application logic here.
//   };

//   // --------------------------------------------------
//   // CAMERA CONSTRAINTS
//   //
//   // NO ASPECT RATIO
//   // --------------------------------------------------
//   const videoConstraints = {
//     width: {
//       ideal: 3840,
//     },

//     height: {
//       ideal: 2160,
//     },

//     facingMode: {
//       ideal: "user",
//     },
//   };

//   return (
//     <div className="flex-col-center CameraPage">
//       {/* HEADING */}
//       {!isCaptured ? (
//         <h1 className="heading">CAPTURE YOUR PHOTO</h1>
//       ) : (
//         <h1 className="heading">DO YOU LIKE IT ?</h1>
//       )}

//       {/* CAMERA */}
//       <div className="flex-row-center mainCameraWrapper">
//         <div className="flex-row-center webcamParent">
//           {isCaptured ? (
//             <img className="capturedImage" src={capturedImg} alt="Captured" />
//           ) : (
//             <Webcam
//               ref={camRef}
//               id="webcam"
//               audio={false}
//               mirrored={true}
//               videoConstraints={videoConstraints}
//               onUserMedia={handleCameraReady}
//               onUserMediaError={handleCameraError}
//             />
//           )}

//           {/* COUNTDOWN */}
//           {!isCaptured && isCounting && (
//             <span className="countdown">{countdown}</span>
//           )}
//         </div>
//       </div>

//       {/* BUTTONS */}
//       <div className="flex-row-center bottomButton">
//         {!isCaptured ? (
//           <div onClick={handleCapture}>
//             <button type="button" disabled={!isCameraReady || isCounting}>
//               {isCounting ? "GET READY..." : "CAPTURE"}
//             </button>
//           </div>
//         ) : (
//           <>
//             <div onClick={handleRetake}>
//               <button type="button">RETAKE</button>
//             </div>

//             <div onClick={handleDownload}>
//               <button type="button">DOWNLOAD</button>
//             </div>

//             <div onClick={handleNext}>
//               <button type="button">NEXT</button>
//             </div>
//           </>
//         )}
//       </div>

//       {/* HIDDEN CANVAS */}
//       <canvas ref={canvasRef} style={{ display: "none" }} />

//       <ToastContainer />
//     </div>
//   );
// }

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

const TARGET_RATIO = 2 / 3;

export default function App() {
  const camRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [capturedImg, setCapturedImg] = useState("");
  const [isCaptured, setIsCaptured] = useState(false);

  const [countdown, setCountdown] = useState(3);
  const [isCounting, setIsCounting] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [cameraFacingMode, setCameraFacingMode] = useState("user");

  // --------------------------------------------------
  // GET 2:3 CROP
  // --------------------------------------------------
  const getCrop = useCallback((videoWidth, videoHeight) => {
    const videoRatio = videoWidth / videoHeight;

    let srcX = 0;
    let srcY = 0;
    let srcWidth = videoWidth;
    let srcHeight = videoHeight;

    if (videoRatio > TARGET_RATIO) {
      // Camera is wider than 2:3.
      // Crop left and right.
      srcHeight = videoHeight;
      srcWidth = videoHeight * TARGET_RATIO;
      srcX = (videoWidth - srcWidth) / 2;
    } else if (videoRatio < TARGET_RATIO) {
      // Camera is taller than 2:3.
      // Crop top and bottom.
      srcWidth = videoWidth;
      srcHeight = videoWidth / TARGET_RATIO;
      srcY = (videoHeight - srcHeight) / 2;
    }

    return {
      srcX,
      srcY,
      srcWidth,
      srcHeight,
    };
  }, []);

  // --------------------------------------------------
  // CAMERA READY
  // --------------------------------------------------
  const handleCameraReady = useCallback(() => {
    const video = camRef.current?.video;

    if (!video) {
      console.error("Camera video element not found.");
      return;
    }

    console.log(
      "Actual camera resolution:",
      video.videoWidth,
      "x",
      video.videoHeight,
    );

    console.log("Actual camera ratio:", video.videoWidth / video.videoHeight);

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
  // DRAW LIVE 2:3 CAMERA FEED
  // --------------------------------------------------
  const drawLivePreview = useCallback(() => {
    const video = camRef.current?.video;
    const canvas = previewCanvasRef.current;

    if (!video || !canvas) {
      animationFrameRef.current = requestAnimationFrame(drawLivePreview);

      return;
    }

    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      animationFrameRef.current = requestAnimationFrame(drawLivePreview);

      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const { srcX, srcY, srcWidth, srcHeight } = getCrop(
      videoWidth,
      videoHeight,
    );

    // Display canvas resolution.
    // This only controls the preview.
    // It does NOT reduce capture resolution.
    const displayHeight = 900;
    const displayWidth = Math.round(displayHeight * TARGET_RATIO);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Mirror camera
      ctx.save();

      ctx.translate(displayWidth, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(
        video,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        0,
        0,
        displayWidth,
        displayHeight,
      );

      ctx.restore();
    }

    animationFrameRef.current = requestAnimationFrame(drawLivePreview);
  }, [getCrop]);

  // --------------------------------------------------
  // START LIVE PREVIEW
  // --------------------------------------------------
  useEffect(() => {
    if (isCaptured || !isCameraReady) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);

        animationFrameRef.current = null;
      }

      return;
    }

    animationFrameRef.current = requestAnimationFrame(drawLivePreview);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);

        animationFrameRef.current = null;
      }
    };
  }, [isCaptured, isCameraReady, drawLivePreview]);

  // --------------------------------------------------
  // HIGH-QUALITY CAPTURE
  //
  // Uses ORIGINAL camera resolution.
  // Then performs the 2:3 crop.
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

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (!videoWidth || !videoHeight) {
      console.error("Invalid camera dimensions.");
      return null;
    }

    const { srcX, srcY, srcWidth, srcHeight } = getCrop(
      videoWidth,
      videoHeight,
    );

    const outputWidth = Math.round(srcWidth);
    const outputHeight = Math.round(srcHeight);

    console.log("Camera resolution:", videoWidth, "x", videoHeight);

    console.log("Final 2:3 resolution:", outputWidth, "x", outputHeight);

    let canvas = captureCanvasRef.current;

    if (!canvas) {
      canvas = document.createElement("canvas");
      captureCanvasRef.current = canvas;
    }

    // Full resolution cropped frame
    canvas.width = outputWidth;
    canvas.height = outputHeight;

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

    ctx.translate(outputWidth, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(
      video,
      srcX,
      srcY,
      srcWidth,
      srcHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    ctx.restore();

    const imageData = canvas.toDataURL("image/png");

    return imageData;
  }, [getCrop]);

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

    // Your next application logic goes here.
    console.log("Captured image:", capturedImg);

    toast.success("Image is ready for the next step.", toastOptions);
  };

  // --------------------------------------------------
  // CAMERA CONSTRAINTS
  // --------------------------------------------------
  const videoConstraints = {
    width: {
      ideal: 3840,
    },

    height: {
      ideal: 2160,
    },

    facingMode: {
      ideal: cameraFacingMode,
    },
  };

  const handleSwitchCamera = () => {
    setIsCameraReady(false);

    setCameraFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    console.log(capturedImg);
  }, [capturedImg]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
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
        <div
          className="flex-row-center webcamParent"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "2 / 3",
            overflow: "hidden",
          }}
        >
          {!isCaptured ? (
            <>
              {/* REAL CAMERA SOURCE */}
              <Webcam
                ref={camRef}
                id="webcam"
                audio={false}
                mirrored={true}
                videoConstraints={videoConstraints}
                onUserMedia={handleCameraReady}
                onUserMediaError={handleCameraError}
                style={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />

              {/* VISIBLE 2:3 CAMERA FEED */}
              <canvas
                ref={previewCanvasRef}
                id="cameraPreviewCanvas"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
            </>
          ) : (
            <img
              className="capturedImage"
              src={capturedImg}
              alt="Captured"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          )}

          {/* COUNTDOWN */}
          {!isCaptured && isCounting && (
            <span
              className="countdown"
              style={{
                position: "absolute",
                zIndex: 10,
              }}
            >
              {countdown}
            </span>
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
            <br />
            <button onClick={handleSwitchCamera}>Switch camera</button>
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

      {/* HIDDEN HIGH-QUALITY CAPTURE CANVAS */}
      <canvas
        ref={captureCanvasRef}
        style={{
          display: "none",
        }}
      />

      <ToastContainer />
    </div>
  );
}
