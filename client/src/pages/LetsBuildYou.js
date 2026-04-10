import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // Corrected Import
import { sendNotification, requestNotificationPermission } from "../utils/notifications";
import "./LetsBuildYou.css";

const LetsBuildYou = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    goal: "muscle-gain",
  });
  const [bmi, setBmi] = useState(null);
  const [plan, setPlan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [streak, setStreak] = useState(0);
  const [showReward, setShowReward] = useState(false);

  // PDF Generator Function - Fixed Syntax
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(40, 167, 69);
    doc.text("NutriFit AI - Fitness Report", 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    // User Details Table
    autoTable(doc, {
      startY: 35,
      head: [['Category', 'Details']],
      body: [
        ['Client Name', formData.name || 'User'],
        ['Age', formData.age || 'N/A'],
        ['Gender', formData.gender || 'N/A'],
        ['Current BMI', bmi || 'Not Calculated'],
        ['Fitness Goal', formData.goal.toUpperCase()],
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 167, 69] }
    });

    // Diet Plan Table
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Nutritional Diet Plan", 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Meal Schedule', 'Recommended Food & Portions']],
      body: plan.diet.map(item => {
        const parts = item.split(':');
        return [parts[0] || "Meal", parts[1] || item];
      }),
      theme: 'striped',
      headStyles: { fillColor: [255, 153, 0] }
    });

    // Workout Plan Table
    doc.text("Workout Routine", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Focus Area', 'Exercise/Guideline']],
      body: plan.workout.map(item => ['Daily Activity', item]),
      theme: 'grid',
      headStyles: { fillColor: [0, 123, 255] }
    });

    doc.save(`${formData.name || 'My'}_Fitness_Plan.pdf`);
  };

  const calculateBMI = () => {
    if (!formData.height || !formData.weight) return;
    const heightM = formData.height / 100;
    const bmiValue = (formData.weight / (heightM * heightM)).toFixed(1);
    setBmi(bmiValue);
  };

  const generatePlan = () => {
    let suggestion = {};
    if (formData.goal === "muscle-gain") {
      suggestion = {
        diet: [
          "Breakfast: 4 Egg Whites + 1 Whole Egg with 1 bowl of Oats and Almonds",
          "Mid-Morning: Greek Yogurt with 1 Scoop Whey Protein and Banana",
          "Lunch: 150g Grilled Chicken Breast or Paneer with Brown Rice and Salad",
          "Pre-Workout: Black Coffee with Peanut Butter Toast",
          "Post-Workout: Protein Shake + 1 Sweet Potato",
          "Dinner: Fish or Soya Chunks with Stir-fried veggies and Quinoa"
        ],
        workout: ["Push/Pull/Legs split", "Focus on progressive overload", "Track weights weekly", "Compound movements focus"],
      };
    } else if (formData.goal === "fat-loss") {
      suggestion = {
        diet: [
          "Breakfast: Vegetable Omelet or Masala Oats with Green Tea",
          "Mid-Morning: A handful of Walnuts and Sprouts salad",
          "Lunch: 2 Roti with Daal, 1 bowl of Curd and huge bowl of Salad",
          "Evening: Roasted Chana or Makhana with Lemon Water",
          "Dinner: Clear Soup with Sauteed Paneer/Chicken and Broccoli"
        ],
        workout: ["HIIT 3x/week", "Strength training 2x/week", "Daily steps goal 10k+", "Fasted Cardio morning"],
      };
    } else {
      suggestion = {
        diet: [
          "Breakfast: Poha or Upma with 1 glass of Milk",
          "Mid-Morning: Any Seasonal Fruit (Apple/Papaya)",
          "Lunch: Balanced Indian Meal (Roti, Sabzi, Daal, Rice)",
          "Evening: Tea/Coffee with Digestive Biscuits",
          "Dinner: Multigrain Roti with Seasonal Vegetable and Salad"
        ],
        workout: ["Mix cardio + weights", "Stretching & mobility", "Active recovery on weekends"],
      };
    }
    setPlan(suggestion);
  };

  // Streak Logic (Unchanged as per your request)
  const handleResetStreak = () => {
    localStorage.setItem("streak", "0");
    setStreak(0);
    setShowReward(false);
    sendNotification("Streak Reset", "Your streak has been reset.");
  };

  const demoSevenDayReward = () => {
    const demoCount = 7;
    localStorage.setItem("streak", "7");
    setStreak(demoCount);
    setShowReward(true);
  };

  useEffect(() => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem("lastLogin");
    let streakCount = parseInt(localStorage.getItem("streak") || "0");

    if (lastLogin !== today) {
      streakCount++;
      localStorage.setItem("lastLogin", today);
      localStorage.setItem("streak", streakCount);
    }
    setStreak(streakCount);
    setShowReward(streakCount >= 7);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white p-8">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-center mb-6 text-green-400">
        🚀 Let's Build You
      </motion.h1>

      {showReward && (
        <div className="reward-popup-bg p-6 rounded-xl shadow-lg text-center font-bold mb-8 bg-yellow-600">
          🏆 Consistency Hero <br /> 7-Day Streak Completed!
        </div>
      )}

      {/* Form Section */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4 text-yellow-400">👤 Enter Your Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Name" className="p-2 rounded bg-gray-900 border border-gray-600 text-white" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <select className="p-2 rounded bg-gray-900 border border-gray-600 text-white" onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
            <option value="">Gender</option>
            <option value="male">Male ♂</option>
            <option value="female">Female ♀</option>
          </select>
          <input type="number" placeholder="Age" className="p-2 rounded bg-gray-900 border border-gray-600 text-white" onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
          <input type="number" placeholder="Height (cm)" className="p-2 rounded bg-gray-900 border border-gray-600 text-white" onChange={(e) => setFormData({ ...formData, height: e.target.value })} />
          <input type="number" placeholder="Weight (kg)" className="p-2 rounded bg-gray-900 border border-gray-600 text-white" onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
          <select className="p-2 rounded bg-gray-900 border border-gray-600 text-white" onChange={(e) => setFormData({ ...formData, goal: e.target.value })}>
            <option value="muscle-gain">💪 Muscle Gain</option>
            <option value="fat-loss">🔥 Fat Loss</option>
            <option value="maintain">⚖️ Maintain</option>
          </select>
        </div>
        <div className="mt-4 flex gap-4">
          <button onClick={calculateBMI} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Calculate BMI</button>
          <button onClick={generatePlan} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Generate Plan</button>
        </div>
        {bmi && <p className="mt-3">📊 Your BMI: <span className="font-bold">{bmi}</span></p>}
      </div>

      {/* Plan & PDF Section */}
      {plan && (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-3xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-semibold text-pink-400">🎯 Your Plan</h2>
            <button onClick={downloadPDF} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-sm font-bold flex items-center gap-2">
              📥 Download PDF
            </button>
          </div>
          <h3 className="text-lg font-bold text-green-300">Detailed Diet</h3>
          <ul className="list-disc ml-6 mb-4 text-gray-300">{plan.diet.map((item, i) => <li key={i}>{item}</li>)}</ul>
          <h3 className="text-lg font-bold text-blue-300">Workout</h3>
          <ul className="list-disc ml-6 text-gray-300">{plan.workout.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      )}

      {/* Progress Section */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">📅 Progress Tracker</h2>
        <Calendar value={selectedDate} onChange={setSelectedDate} className="mx-auto text-black" />
        <p className="mt-3 text-lg">🔥 Current Streak: <span className="font-bold text-yellow-400">{streak} days</span></p>
        <div className="flex justify-center gap-3 mt-4">
          <button className="bg-yellow-500 px-4 py-2 rounded font-bold text-black" onClick={handleResetStreak}>Reset Streak</button>
          <button className="bg-pink-500 px-4 py-2 rounded font-bold" onClick={demoSevenDayReward}>Demo 7-Day</button>
        </div>
      </div>
    </div>
  );
};

export default LetsBuildYou;