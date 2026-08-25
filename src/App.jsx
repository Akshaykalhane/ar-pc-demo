import { useEffect, useRef, useState } from "react";

import { initializePose, detectPose } from "./pose";

import "./App.css";

const LEFT_ANKLE = 27;
const RIGHT_ANKLE = 28;

const LEFT_HEEL = 29;
const RIGHT_HEEL = 30;

const LEFT_FOOT = 31;
const RIGHT_FOOT = 32;

/*
 * Controls the PNG size relative
 * to the detected person's height.
 *
 * 1.0  = approximately same height
 * 1.35 = larger
 * 1.5  = much larger
 */
const CHARACTER_SCALE = 1.35;

function App() {
  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const captureCanvasRef = useRef(null);

  const characterRef = useRef(null);

  const animationRef = useRef(null);

  const lastPoseTimeRef = useRef(0);

  const characterPositionRef = useRef(null);

  const [cameraStarted, setCameraStarted] = useState(false);

  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("Ready");

  const [error, setError] = useState("");

  const [personDetected, setPersonDetected] = useState(false);

  const [floorDetected, setFloorDetected] = useState(false);

  const [capturedImage, setCapturedImage] = useState(null);

  /*
   * Load character PNG.
   */
  useEffect(() => {
    const image = new Image();

    image.onload = () => {
      console.log("Character PNG loaded:", image.width, image.height);

      characterRef.current = image;
    };

    image.onerror = () => {
      console.error("Failed to load /character.png");

      setError("character.png could not be loaded.");
    };

    image.src = "/character.png";
  }, []);

  /*
   * Reset AR.
   */
  const resetAR = () => {
    characterPositionRef.current = null;

    setFloorDetected(false);

    console.log("AR position reset");
  };

  /*
   * Start camera.
   */
  const startCamera = async () => {
    try {
      setLoading(true);
      setError("");
      setStatus("Opening camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",

          width: {
            ideal: 1280,
          },

          height: {
            ideal: 720,
          },

          frameRate: {
            ideal: 30,
          },
        },

        audio: false,
      });

      const video = videoRef.current;

      if (!video) {
        throw new Error("Video element not found.");
      }

      video.srcObject = stream;

      await video.play();

      setCameraStarted(true);

      setStatus("Loading pose detection...");

      await initializePose();

      setLoading(false);

      setStatus("Ready");

      animationRef.current = requestAnimationFrame(processFrame);
    } catch (err) {
      console.error("START ERROR:", err);

      setLoading(false);

      setError(
        `${err.name || "Error"}: ${err.message || "Unable to start camera."}`,
      );

      setStatus("Error");
    }
  };

  /*
   * Stop camera.
   */
  const stopCamera = () => {
    cancelAnimationFrame(animationRef.current);

    const video = videoRef.current;

    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());

      video.srcObject = null;
    }

    setCameraStarted(false);

    setPersonDetected(false);

    setFloorDetected(false);

    setStatus("Camera stopped");

    characterPositionRef.current = null;
  };

  /*
   * Get visible feet.
   */
  const getFeet = (landmarks) => {
    const points = [];

    const indexes = [
      LEFT_ANKLE,
      RIGHT_ANKLE,
      LEFT_HEEL,
      RIGHT_HEEL,
      LEFT_FOOT,
      RIGHT_FOOT,
    ];

    indexes.forEach((index) => {
      const point = landmarks[index];

      if (point && point.visibility > 0.35) {
        points.push(point);
      }
    });

    if (!points.length) {
      return null;
    }

    /*
     * Average X.
     */
    const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;

    /*
     * Lowest point = approximate floor.
     */
    const y = Math.max(...points.map((point) => point.y));

    return {
      x,
      y,
    };
  };

  /*
   * Get approximate person height.
   */
  const getPersonHeight = (landmarks) => {
    const nose = landmarks[0];

    const feet = getFeet(landmarks);

    if (!nose || !feet) {
      return null;
    }

    return feet.y - nose.y;
  };

  /*
   * Draw webcam.
   */
  const drawCamera = (ctx, video, width, height) => {
    ctx.clearRect(0, 0, width, height);

    /*
     * Mirror front webcam.
     */
    ctx.save();

    ctx.translate(width, 0);

    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, width, height);

    ctx.restore();
  };

  /*
   * Calculate character position.
   */
  const calculateCharacter = (landmarks, width, height) => {
    const image = characterRef.current;

    if (!image) {
      return null;
    }

    const feet = getFeet(landmarks);

    const personHeight = getPersonHeight(landmarks);

    /*
     * Need feet to establish
     * the character's floor.
     */
    if (!feet) {
      return null;
    }

    /*
     * Convert normalized
     * coordinates into pixels.
     *
     * Camera is mirrored,
     * therefore X is reversed.
     */
    const footX = (1 - feet.x) * width;

    const footY = feet.y * height;

    setFloorDetected(true);

    /*
     * ------------------------------------------
     * CHARACTER SIZE
     * ------------------------------------------
     *
     * The PNG is now deliberately
     * larger than the person.
     */
    let characterHeight;

    if (personHeight && personHeight > 0.15) {
      characterHeight = personHeight * height * CHARACTER_SCALE;
    } else {
      /*
       * Fallback when person height
       * cannot be calculated.
       */
      characterHeight = height * 0.75;
    }

    /*
     * Prevent absurdly small/large PNG.
     */
    characterHeight = Math.max(
      height * 0.5,
      Math.min(height * 0.95, characterHeight),
    );

    /*
     * Preserve PNG aspect ratio.
     */
    const ratio = image.width / image.height;

    const characterWidth = characterHeight * ratio;

    /*
     * ------------------------------------------
     * CHARACTER POSITION
     * ------------------------------------------
     *
     * Put the character beside
     * the person's feet.
     */
    const targetX = footX + width * 0.15;

    const targetY = footY;

    /*
     * Smooth movement.
     */
    if (!characterPositionRef.current) {
      characterPositionRef.current = {
        x: targetX,
        y: targetY,

        width: characterWidth,

        height: characterHeight,
      };
    } else {
      const current = characterPositionRef.current;

      const smooth = 0.15;

      current.x += (targetX - current.x) * smooth;

      current.y += (targetY - current.y) * smooth;

      current.width += (characterWidth - current.width) * smooth;

      current.height += (characterHeight - current.height) * smooth;
    }

    return {
      ...characterPositionRef.current,
    };
  };

  /*
   * Draw PNG character.
   */
  const drawCharacter = (ctx, character) => {
    const image = characterRef.current;

    if (!image || !character) {
      return;
    }

    ctx.drawImage(
      image,

      character.x - character.width / 2,

      character.y - character.height,

      character.width,

      character.height,
    );
  };

  /*
   * Draw floor line.
   */
  const drawFloor = (ctx, width, floorY) => {
    if (floorY === null || floorY === undefined) {
      return;
    }

    ctx.save();

    ctx.strokeStyle = "rgba(255, 220, 0, 0.7)";

    ctx.lineWidth = 2;

    ctx.setLineDash([10, 10]);

    ctx.beginPath();

    ctx.moveTo(0, floorY);

    ctx.lineTo(width, floorY);

    ctx.stroke();

    ctx.restore();
  };

  /*
   * Main rendering loop.
   */
  const processFrame = (timestamp) => {
    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas) {
      animationRef.current = requestAnimationFrame(processFrame);

      return;
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      animationRef.current = requestAnimationFrame(processFrame);

      return;
    }

    const width = video.videoWidth;

    const height = video.videoHeight;

    if (!width || !height) {
      animationRef.current = requestAnimationFrame(processFrame);

      return;
    }

    /*
     * Canvas resolution.
     */
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;

      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");

    /*
     * Draw webcam.
     */
    drawCamera(ctx, video, width, height);

    /*
     * Run Pose Landmarker
     * approximately 20 FPS.
     */
    if (timestamp - lastPoseTimeRef.current >= 50) {
      lastPoseTimeRef.current = timestamp;

      try {
        const result = detectPose(video, timestamp);

        if (result && result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];

          setPersonDetected(true);

          const character = calculateCharacter(landmarks, width, height);

          if (character) {
            drawCharacter(ctx, character);

            drawFloor(ctx, width, character.y);
          }
        } else {
          setPersonDetected(false);

          /*
           * Keep existing PNG
           * if person temporarily
           * disappears.
           */
          if (characterPositionRef.current) {
            drawCharacter(ctx, characterPositionRef.current);

            drawFloor(ctx, width, characterPositionRef.current.y);
          }
        }
      } catch (err) {
        console.error("POSE ERROR:", err);
      }
    } else {
      /*
       * Keep PNG visible between
       * Pose frames.
       */
      if (characterPositionRef.current) {
        drawCharacter(ctx, characterPositionRef.current);

        drawFloor(ctx, width, characterPositionRef.current.y);
      }
    }

    animationRef.current = requestAnimationFrame(processFrame);
  };

  /*
   * Capture photo.
   */
  const capturePhoto = () => {
    const canvas = canvasRef.current;

    const output = captureCanvasRef.current;

    if (!canvas || !output) {
      return;
    }

    output.width = canvas.width;

    output.height = canvas.height;

    const ctx = output.getContext("2d");

    ctx.drawImage(canvas, 0, 0);

    setCapturedImage(output.toDataURL("image/png"));
  };

  /*
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);

      const video = videoRef.current;

      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="app">
      <h1>AR Photobooth</h1>

      <p className="subtitle">Real Person + PNG Character</p>

      {!cameraStarted && (
        <div className="start">
          <button onClick={startCamera} disabled={loading}>
            {loading ? status : "Start Camera"}
          </button>

          {error && <div className="error">{error}</div>}
        </div>
      )}

      <div
        className="booth"
        style={{
          display: cameraStarted ? "block" : "none",
        }}
      >
        <video ref={videoRef} autoPlay muted playsInline className="video" />

        <canvas ref={canvasRef} className="canvas" />

        <canvas ref={captureCanvasRef} className="capture-canvas" />

        <div className="status">
          <div>
            {personDetected ? "🟢 Person detected" : "🔴 Person not detected"}
          </div>

          <div>
            {floorDetected
              ? "🟢 Floor position estimated"
              : "🟡 Waiting for feet"}
          </div>
        </div>

        <div className="controls">
          <button onClick={resetAR}>Reset AR</button>

          <button onClick={capturePhoto}>📸 Capture</button>

          <button onClick={stopCamera}>Stop</button>
        </div>
      </div>

      {capturedImage && (
        <div className="result">
          <h2>Captured Photo</h2>

          <img src={capturedImage} alt="AR result" />

          <a href={capturedImage} download="ar-photo.png">
            Download
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
