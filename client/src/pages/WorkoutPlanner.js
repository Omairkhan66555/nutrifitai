import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./WorkoutPlanner.css";

const WorkoutPlanner = () => {
  const [workouts, setWorkouts] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [exercises, setExercises] = useState([]);

  const token = localStorage.getItem("token");

  const fetchWorkouts = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/workouts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkouts(res.data.data || []);
    } catch (err) {
      console.error("fetchWorkouts error", err);
    }
  }, [token]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const addExercise = () => {
    if (!exerciseName) return;
    setExercises([...exercises, { name: exerciseName.trim(), sets, reps, weight }]);
    setExerciseName("");
    setSets("");
    setReps("");
    setWeight("");
  };

  const saveWorkout = async () => {
    if (!workoutName.trim() || exercises.length === 0) {
      return alert("Add workout name and at least one exercise.");
    }
    try {
      const payload = { name: workoutName.trim(), exercises };
      await axios.post("http://localhost:5000/api/workouts", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkoutName("");
      setExercises([]);
      fetchWorkouts();
    } catch (err) {
      console.error("saveWorkout error", err.response?.data || err.message);
      alert("Failed to save workout. Check console.");
    }
  };

  const deleteWorkout = async (id) => {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/workouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWorkouts();
    } catch (err) {
      console.error("deleteWorkout error", err);
      alert("Delete failed.");
    }
  };

  return (
    <div className="wf-page">
      <div className="wf-topbar">
        <h1 className="wf-title"><span className="wf-logo">💪</span> Workout Planner</h1>
      </div>

      <div className="wf-grid">
        <motion.section
          className="wf-card wf-create"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="card-heading">Create Workout</h2>

          <input
            className="wf-input"
            placeholder="Workout name (e.g., Push Day)"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
          />

          <div className="wf-row">
            <input
              className="wf-input small"
              placeholder="Exercise (e.g., Bench Press)"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
            <input
              className="wf-input tiny"
              placeholder="Sets"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
            <input
              className="wf-input tiny"
              placeholder="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <input
              className="wf-input tiny"
              placeholder="Weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <button className="wf-btn wf-btn-accent" onClick={addExercise}>Add</button>
          </div>

          {exercises.length > 0 && (
            <ul className="wf-list">
              {exercises.map((ex, idx) => (
                <li key={idx} className="wf-list-item">
                  <div>
                    <strong>{ex.name}</strong>
                    <div className="meta">{ex.sets} × {ex.reps} • {ex.weight} kg</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="wf-actions">
            <button className="wf-btn wf-btn-primary" onClick={saveWorkout}>Save Workout</button>
            <button className="wf-btn wf-btn-ghost" onClick={() => { setExercises([]); setWorkoutName(""); }}>Reset</button>
          </div>
        </motion.section>

        <motion.section
          className="wf-card wf-saved"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="card-heading">My Workouts</h2>

          {workouts.length === 0 ? (
            <p className="muted">No workouts saved yet. Create one to get started.</p>
          ) : (
            <div className="wf-saved-list">
              {workouts.map((w) => (
                <motion.div
                  key={w._id}
                  className="wf-saved-item"
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="saved-left">
                    <h3>{w.name}</h3>
                    <ul className="exercise-inline">
                      {w.exercises.map((ex, i) => (
                        <li key={i}>{ex.name} — {ex.sets}×{ex.reps} ({ex.weight}kg)</li>
                      ))}
                    </ul>
                  </div>
                  <div className="saved-right">
                    <button className="wf-btn wf-btn-danger" onClick={() => deleteWorkout(w._id)}>Delete</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default WorkoutPlanner;
