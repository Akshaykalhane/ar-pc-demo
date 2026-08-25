import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

let poseLandmarker = null;

export async function initializePose() {
  if (poseLandmarker) {
    return poseLandmarker;
  }

  console.log("Loading MediaPipe...");

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
  );

  console.log("MediaPipe WASM loaded");

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/pose_landmarker_full.task",
    },

    runningMode: "VIDEO",

    numPoses: 1,

    minPoseDetectionConfidence: 0.5,

    minPosePresenceConfidence: 0.5,

    minTrackingConfidence: 0.5,
  });

  console.log("Pose Landmarker ready");

  return poseLandmarker;
}

export function detectPose(video, timestamp) {
  if (!poseLandmarker) {
    return null;
  }

  return poseLandmarker.detectForVideo(video, timestamp);
}
