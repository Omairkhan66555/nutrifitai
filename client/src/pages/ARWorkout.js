import React, { useEffect, useRef, useState } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import { motion } from "framer-motion";
import "./ARWorkout.css";

const DEFAULT_USER_WEIGHT_KG = 70;
const demoVideos = {
  pushup: "/pushups.mp4",
  squat: "/squats.mp4",
  biceps: "/biceps.mp4",
};

const EXERCISE_CONFIG = {
  pushup: { downAngle: 70, upAngle: 160, formThreshold: 20, repThreshold: 40 },
  squat: { downAngle: 90, upAngle: 160, formThreshold: 100, repThreshold: 140 },
  biceps: { downAngle: 40, upAngle: 160, formThreshold: 160, repThreshold: 120 },
};

const ARWorkout = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);

  const [exercise, setExercise] = useState("pushup");
  const [count, setCount] = useState(0);
  const [formComment, setFormComment] = useState("Adjust Form ⚠");
  const [running, setRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [calories, setCalories] = useState(0);
  const [intensity, setIntensity] = useState("—");
  const [showPreview, setShowPreview] = useState(false);

  const isDown = useRef(false);
  const downFrames = useRef(0);
  const requiredDownFrames = 3;
  const repsInLastMinute = useRef([]);
  const stableFrames = useRef(0);

  // Fast camera open, kill any old tracks
  const startCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (previewRef.current && previewRef.current.srcObject) {
        previewRef.current.srcObject.getTracks().forEach(track => track.stop());
        previewRef.current.srcObject = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        await previewRef.current.play();
      }
    } catch (err) {
      alert("Camera not accessible. Please allow permissions.");
    }
  };

  // Helper for rep intensity
  const computeIntensity = () => {
    const now = Date.now();
    repsInLastMinute.current = repsInLastMinute.current.filter((t) => now - t < 60_000);
    const perMin = repsInLastMinute.current.length;
    if (perMin >= 20) return "High";
    if (perMin >= 8) return "Medium";
    if (perMin > 0) return "Low";
    return "—";
  };

  // Calories calculation per rep
  const addCaloriesForRep = () => {
    let factor = 0.5;
    if (exercise === "pushup") factor = 0.5;
    if (exercise === "squat") factor = 0.6;
    if (exercise === "biceps") factor = 0.4;
    setCalories((c) => +(c + factor).toFixed(2));
  };

  // Angle utils
  const calculateAngle = (a, b, c) => {
    if (!a || !b || !c) return 0;
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = (radians * 180.0) / Math.PI;
    if (angle < 0) angle += 360;
    return angle;
  };

  // Draw skeleton for visual
  const drawSkeleton = (ctx, keypoints, properForm) => {
    const color = properForm ? "#22c55e" : "#ef4444";
    const connections = [
      ["left_shoulder", "right_shoulder"],
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
      ["left_hip", "right_hip"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_hip", "left_knee"],
      ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"],
      ["right_knee", "right_ankle"],
    ];
    ctx.lineWidth = 3;
    connections.forEach(([a, b]) => {
      if (
        keypoints[a] &&
        keypoints[b] &&
        keypoints[a].score > 0.3 &&
        keypoints[b].score > 0.3
      ) {
        ctx.beginPath();
        ctx.moveTo(keypoints[a].x, keypoints[a].y);
        ctx.lineTo(keypoints[b].x, keypoints[b].y);
        ctx.strokeStyle = color;
        ctx.stroke();
      }
    });
    Object.values(keypoints).forEach((kp) => {
      if (kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }
    });
  };

  // properly reset all reps, timer, calories, everything
  const resetAllStates = () => {
    setCount(0);
    setCalories(0);
    setTimerSec(0);
    setIntensity("—");
    repsInLastMinute.current = [];
    isDown.current = false;
    downFrames.current = 0;
    stableFrames.current = 0;
    setFormComment("Adjust Form ⚠");
  };

  // Exercise selection resets everything
  const handleExerciseChange = (e) => {
    setExercise(e.target.value);
    resetAllStates();
    setRunning(false); // Stop and require user to Start for new exercise
  };

  // Main loop for AR pose
  useEffect(() => {
    let mounted = true;
    let detector;
    let rafId;
    const videoEl = videoRef.current;
    const previewEl = previewRef.current;

    const runPoseDetection = async () => {
      await tf.ready();
      await tf.setBackend("webgl");
      detector = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      await startCamera();
      const ctx = canvasRef.current.getContext("2d");

      const detect = async () => {
        if (!mounted || !videoEl || videoEl.readyState < 2) {
          rafId = requestAnimationFrame(detect);
          return;
        }
        const vw = videoEl.videoWidth;
        const vh = videoEl.videoHeight;
        if (vw && vh) {
          canvasRef.current.width = vw;
          canvasRef.current.height = vh;
        }
        const poses = await detector.estimatePoses(videoEl);

        ctx.save();
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.globalAlpha = 0.85;
        ctx.drawImage(
          videoEl,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        ctx.globalAlpha = 1;
        ctx.restore();

        poses.forEach((pose) => {
          const keypoints = pose.keypoints.reduce((acc, k) => {
            acc[k.name] = k;
            return acc;
          }, {});
          let properForm = false;

          // Robust rep counting for each movement style, prevents accidental triggering
          if (exercise === "pushup") {
            const leftAngle = calculateAngle(
              keypoints.left_elbow,
              keypoints.left_shoulder,
              keypoints.left_hip
            );
            const rightAngle = calculateAngle(
              keypoints.right_elbow,
              keypoints.right_shoulder,
              keypoints.right_hip
            );
            const avgElbowAngle = (leftAngle + rightAngle) / 2;
            properForm = avgElbowAngle > 20 && avgElbowAngle < 180;

            // Movement detection with threshold – accidental rep prevention
            if (properForm) {
              if (!isDown.current && avgElbowAngle < 70) {
                downFrames.current++;
                if (downFrames.current >= requiredDownFrames) {
                  isDown.current = true;
                  downFrames.current = 0;
                }
              } else if (!isDown.current) downFrames.current = 0;

              if (
                isDown.current &&
                avgElbowAngle > 160 &&
                Math.abs(avgElbowAngle - 160) < 25 // threshold for up
              ) {
                stableFrames.current++;
                if (stableFrames.current >= 3) {
                  setCount((prev) => prev + 1);
                  repsInLastMinute.current.push(Date.now());
                  addCaloriesForRep();
                  setIntensity(computeIntensity());
                  isDown.current = false;
                  stableFrames.current = 0;
                }
              }
            }
          }

          if (exercise === "squat") {
            const leftKnee = calculateAngle(
              keypoints.left_hip,
              keypoints.left_knee,
              keypoints.left_ankle
            );
            const rightKnee = calculateAngle(
              keypoints.right_hip,
              keypoints.right_knee,
              keypoints.right_ankle
            );
            const avgKnee = (leftKnee + rightKnee) / 2;
            properForm = avgKnee < 100 || avgKnee > 160;

            if (properForm) {
              if (!isDown.current && avgKnee < 90) {
                downFrames.current++;
                if (downFrames.current >= requiredDownFrames) {
                  isDown.current = true;
                  downFrames.current = 0;
                }
              } else if (!isDown.current) downFrames.current = 0;

              if (
                isDown.current &&
                avgKnee > 160 &&
                Math.abs(avgKnee - 160) < 25
              ) {
                stableFrames.current++;
                if (stableFrames.current >= 3) {
                  setCount((prev) => prev + 1);
                  repsInLastMinute.current.push(Date.now());
                  addCaloriesForRep();
                  setIntensity(computeIntensity());
                  isDown.current = false;
                  stableFrames.current = 0;
                }
              }
            }
          }

          if (exercise === "biceps") {
            const leftArm = calculateAngle(
              keypoints.left_shoulder,
              keypoints.left_elbow,
              keypoints.left_wrist
            );
            const rightArm = calculateAngle(
              keypoints.right_shoulder,
              keypoints.right_elbow,
              keypoints.right_wrist
            );
            const avgArm = (leftArm + rightArm) / 2;
            properForm = avgArm < 160;

            if (properForm) {
              if (!isDown.current && avgArm < 40) {
                downFrames.current++;
                if (downFrames.current >= requiredDownFrames) {
                  isDown.current = true;
                  downFrames.current = 0;
                }
              } else if (!isDown.current) downFrames.current = 0;

              if (
                isDown.current &&
                avgArm > 160 &&
                Math.abs(avgArm - 160) < 25
              ) {
                stableFrames.current++;
                if (stableFrames.current >= 3) {
                  setCount((prev) => prev + 1);
                  repsInLastMinute.current.push(Date.now());
                  addCaloriesForRep();
                  setIntensity(computeIntensity());
                  isDown.current = false;
                  stableFrames.current = 0;
                }
              }
            }
          }
          drawSkeleton(ctx, keypoints, properForm);
          setFormComment(properForm ? "Good Form ✅" : "Adjust Form ⚠");
        });

        rafId = requestAnimationFrame(detect);
      };
      detect();
    };

    if (running) runPoseDetection();

    let timerInterval;
    if (running) {
      timerInterval = setInterval(() => setTimerSec((s) => s + 1), 1000);
    }
    return () => {
      mounted = false;
      if (detector && detector.dispose) detector.dispose();
      if (rafId) cancelAnimationFrame(rafId);
      if (timerInterval) clearInterval(timerInterval);
      if (videoEl && videoEl.srcObject) {
        videoEl.srcObject.getTracks().forEach((t) => t.stop());
        videoEl.srcObject = null;
      }
      if (previewEl && previewEl.srcObject) {
        previewEl.srcObject.getTracks().forEach((t) => t.stop());
        previewEl.srcObject = null;
      }
    };
    // Re-init on running/exercise change
  }, [running, exercise]);

  // Start
  const handleStart = () => {
    resetAllStates();
    setRunning(true);
  };

  const handleStop = () => setRunning(false);
  const togglePreview = () => setShowPreview((s) => !s);

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  return (
    <div className="arwrap">
      <div className="topbar">
        <div className="brand">
          <strong>NutriFit AR</strong> <span>• Live Coach</span>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="label">Timer</div>
            <div className="value neon">{formatTime(timerSec)}</div>
          </div>
          <div className="stat">
            <div className="label">Reps</div>
            <div className="value neon">{count}</div>
          </div>
          <div className="stat">
            <div className="label">Calories</div>
            <div className="value neon">{calories}</div>
          </div>
          <div className="stat">
            <div className="label">Intensity</div>
            <div className="value">{intensity}</div>
          </div>
          <div className="controls">
            <button className="btn primary" onClick={handleStart} disabled={running}>
              ▶ Start
            </button>
            <button className="btn" onClick={handleStop} disabled={!running}>
              ■ Stop
            </button>
            
          </div>
        </div>
      </div>
      <div className="mainArea">
        <motion.div
          className="trainerBox"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="trainerHeader">Trainer Demo</div>
          <video
            className="trainerVideo"
            src={demoVideos[exercise]}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="trainerFooter">
            Follow the demo — then perform in front of camera
          </div>
        </motion.div>
        <div className="canvasArea">
          <div className="canvasContainer">
            <canvas ref={canvasRef} className="arCanvas" />
            {showPreview && (
              <video ref={previewRef} className="previewVideo" autoPlay muted playsInline />
            )}
            <div className="overlayCard">
              <div className="overlay-row">
                <div className="overlay-label">Exercise</div>
                <select
                  value={exercise}
                  onChange={handleExerciseChange}
                  className="selectExercise"
                >
                  <option value="pushup">Push-ups</option>
                  <option value="squat">Squats</option>
                  <option value="biceps">Biceps Curl</option>
                </select>
              </div>
              <div className="overlay-row small">
                <div className="overlay-label">Form</div>
                <div
                  className={`formBadge ${
                    formComment === "Good Form ✅" ? "good" : "bad"
                  }`}
                >
                  {formComment}
                </div>
              </div>
              <div className="overlay-row small">
                <div className="overlay-label">Estimate</div>
                <div>Weight: {DEFAULT_USER_WEIGHT_KG}kg (default)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />
    </div>
  );
};

export default ARWorkout;
