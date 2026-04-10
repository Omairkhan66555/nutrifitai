// client/src/pages/MealPlanner.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Spinner,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import QuickAdd from "../components/QuickAdd";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { FaAppleAlt, FaCarrot, FaLeaf, FaFish, FaEgg } from "react-icons/fa";
import "./MealPlanner.css"; // Custom CSS for animations

ChartJS.register(ArcElement, Tooltip, Legend);

const MealPlanner = () => {
  const [meals, setMeals] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loadingDetect, setLoadingDetect] = useState(false);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const [mealType, setMealType] = useState("breakfast");

  const [recipeQuery, setRecipeQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/meals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeals(res.data.data || []);
    } catch (err) {
      console.error("fetchMeals error", err);
    }
  };

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      const base = reader.result.split(",")[1];
      setImageBase64(base);
      setConcepts([]);
      setSelectedConcept(null);
      setNutrition(null);
    };
    reader.readAsDataURL(f);
  };

  const handleDetect = async () => {
    if (!imageBase64) {
      alert("Please upload an image first");
      return;
    }
    try {
      setLoadingDetect(true);
      const res = await axios.post(
        "http://localhost:5000/api/clarifai/analyze-food",
        { imageBase64 }
      );
      if (!res.data.concepts || res.data.concepts.length === 0) {
        alert("No suggestions found — try a clearer image or type the food name.");
        return;
      }
      setConcepts(res.data.concepts);
    } catch (err) {
      console.error("Error detecting food", err);
      alert("Food detection failed. Try again.");
    } finally {
      setLoadingDetect(false);
    }
  };

  const handleChoose = async (c) => {
    setSelectedConcept(c);
    setNutrition(null);
    try {
      setLoadingNutrition(true);
      const res = await axios.post(
        "http://localhost:5000/api/nutrition/get-nutrition",
        { query: c.name }
      );
       // ✅ fix: Edamam response doesn't have .nutrition field, so check res.data directly
    const data = res.data.nutrition || res.data;
    console.log("🥗 Nutrition response received:", data);

    // ✅ handle case if data missing calories
    if (!data || !data.calories) {
      alert("Nutrition not found for this suggestion. You can type manually.");
      return;
    }

    // ✅ normalize key names (fat vs dat)
    const normalizedData = {
      name: data.name || c.name,
      calories: data.calories || 0,
      protein: data.protein || 0,
      fat: data.fat || data.dat || 0,
      carbs: data.carbs || 0,
    };

    setNutrition(normalizedData);
    } catch (err) {
      console.error("Nutrition lookup error", err);
      alert("Nutrition lookup failed.");
    } finally {
      setLoadingNutrition(false);
    }
  };

  const handleAddMeal = async () => {
    if (!nutrition) {
      alert("Please select a suggestion and fetch nutrition first.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: nutrition.name,
        mealType,
        calories: nutrition.calories,
        protein: nutrition.protein,
        fat: nutrition.fat,
        carbs: nutrition.carbs,
      };
      const res = await axios.post("http://localhost:5000/api/meals", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeals((p) => [res.data.data, ...p]);
      setImageFile(null);
      setImageBase64(null);
      setConcepts([]);
      setSelectedConcept(null);
      setNutrition(null);
    } catch (err) {
      console.error("Add meal error", err);
      alert("Failed to add meal.");
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/meals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeals((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Delete meal error", err);
      alert("Failed to delete meal.");
    }
  };

  const dailySummary = meals.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.fat += m.fat;
      acc.carbs += m.carbs;
      return acc;
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  const renderMacroProgress = () => {
    if (!nutrition) return null;
    const total = nutrition.protein + nutrition.fat + nutrition.carbs;
    return (
      <ProgressBar>
        <ProgressBar
          now={(nutrition.protein / total) * 100}
          variant="success"
          key={1}
          label={`${nutrition.protein}g`}
        />
        <ProgressBar
          now={(nutrition.fat / total) * 100}
          variant="danger"
          key={2}
          label={`${nutrition.fat}g`}
        />
        <ProgressBar
          now={(nutrition.carbs / total) * 100}
          variant="warning"
          key={3}
          label={`${nutrition.carbs}g`}
        />
      </ProgressBar>
    );
  };

  const macroPieData = {
    labels: ["Protein", "Fat", "Carbs"],
    datasets: [
      {
        label: "Macro Distribution",
        data: [dailySummary.protein, dailySummary.fat, dailySummary.carbs],
        backgroundColor: ["#28a745", "#dc3545", "#ffc107"],
        hoverOffset: 10,
      },
    ],
  };

  const handleRecipeSearch = async () => {
    if (!recipeQuery.trim()) return alert("Enter a food idea");
    try {
      setLoadingRecipes(true);
      const res = await axios.post("http://localhost:5000/api/recipes/get-recipes", {
        query: recipeQuery,
      });
      setRecipes(res.data.recipes || []);
    } catch (err) {
      console.error("Recipe fetch error", err);
      alert("Failed to fetch recipes.");
    } finally {
      setLoadingRecipes(false);
    }
  };

  return (
    <div className="mealplanner-bg">
      <Container style={{ marginTop: "30px", marginBottom: "30px", position: "relative", zIndex: 1 }}>
        {/* Macro Summary */}
        <Row className="mb-4">
          <Col md={8}>
            <Card className="shadow-sm border-0 rounded-4 p-4 h-100 gradient-card">
              <h5 className="mb-3 text-white">📊 Daily Macro Summary</h5>
              <Row className="text-center mb-3">
                <Col>
                  <Badge bg="warning" className="p-3 w-100 rounded-3">
                    Calories <br />
                    <strong>{dailySummary.calories} kcal</strong>
                  </Badge>
                </Col>
                <Col>
                  <Badge bg="success" className="p-3 w-100 rounded-3">
                    Protein <br />
                    <strong>{dailySummary.protein} g</strong>
                  </Badge>
                </Col>
                <Col>
                  <Badge bg="danger" className="p-3 w-100 rounded-3">
                    Fat <br />
                    <strong>{dailySummary.fat} g</strong>
                  </Badge>
                </Col>
                <Col>
                  <Badge bg="info" className="p-3 w-100 rounded-3 text-dark">
                    Carbs <br />
                    <strong>{dailySummary.carbs} g</strong>
                  </Badge>
                </Col>
              </Row>
              <div style={{ maxWidth: "300px", margin: "0 auto" }}>
                <Pie data={macroPieData} />
              </div>
            </Card>
          </Col>
        </Row>

        <Row className="gy-4">
          {/* Left Panel */}
          <Col md={5}>
            <Card className="shadow-sm p-4 border-0 rounded-4 gradient-card-light">
              <h4 className="mb-3 text-success">🍴 Add Meal</h4>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Upload Food Image</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={onFileChange} />
              </Form.Group>

              {imageFile && (
                <div className="text-center mb-3">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Food preview"
                    style={{ maxWidth: "100%", borderRadius: "12px", maxHeight: "200px", objectFit: "cover" }}
                  />
                </div>
              )}

              <Button
                variant="success"
                onClick={handleDetect}
                disabled={loadingDetect || !imageBase64}
                className="mb-3 w-100"
              >
                {loadingDetect ? <Spinner animation="border" size="sm" /> : "Detect Food"}
              </Button>

              {concepts?.length > 0 && (
                <div className="mb-3">
                  <h6 className="fw-semibold">Suggestions:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {concepts.map((c) => (
                      <Badge
                        key={c.name}
                        bg={selectedConcept?.name === c.name ? "success" : "secondary"}
                        style={{ cursor: "pointer", fontSize: "0.9rem", padding: "0.5em 0.8em" }}
                        onClick={() => handleChoose(c)}
                      >
                        {c.name} ({Math.round(c.confidence * 100)}%)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedConcept && (
                <Card className="p-3 border-1 border rounded-3 shadow-sm mb-3 bg-lightgreen">
                  <h6 className="fw-bold mb-2">Selected: {selectedConcept.name}</h6>
                  {loadingNutrition ? (
                    <Spinner />
                  ) : nutrition ? (
                    <div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Calories:</span> <strong>{nutrition.calories} kcal</strong>
                      </div>
                      {renderMacroProgress()}
                      <Form.Select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value)}
                        className="mb-3"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </Form.Select>
                      <Button variant="success" className="w-100" onClick={handleAddMeal}>
                        Add Meal
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">Click a suggestion to fetch nutrition.</p>
                  )}
                </Card>
              )}

              <QuickAdd
                onSelect={(nutri) => {
                  setNutrition(nutri);
                  setSelectedConcept({ name: nutri.name, confidence: 1 });
                }}
              />
            </Card>
          </Col>

          {/* Right Panel */}
          <Col md={7}>
            {/* Meals */}
            <Card className="shadow-sm p-4 border-0 rounded-4 mb-4 bg-lightgreen">
              <h4 className="mb-3 text-success">📋 My Meals</h4>
              {meals.length === 0 ? (
                <p className="text-muted">No meals added yet.</p>
              ) : (
                <Table hover responsive bordered className="align-middle text-center" style={{ background: "#f1f8e9" }}>
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Calories</th>
                      <th>Protein</th>
                      <th>Fat</th>
                      <th>Carbs</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meals.map((m) => (
                      <tr key={m._id || m.name + Math.random()}>
                        <td>{m.name}</td>
                        <td className="text-capitalize">{m.mealType}</td>
                        <td>{m.calories}</td>
                        <td>{m.protein}</td>
                        <td>{m.fat}</td>
                        <td>{m.carbs}</td>
                        <td>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteMeal(m._id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card>

            {/* Recipes */}
            <Card className="shadow-sm p-4 border-0 rounded-4 bg-lightgreen">
              <h4 className="mb-3 text-success">👩‍🍳 Healthy Recipe Ideas</h4>
              <Form.Control
                type="text"
                placeholder="e.g. High protein dinner, healthy sweet bar..."
                style={{ backgroundColor: "#fff", color: "#222" }}
                value={recipeQuery}
                onChange={(e) => setRecipeQuery(e.target.value)}
                className="mb-2"
              />
              <Button variant="info" className="mb-3 w-100" onClick={handleRecipeSearch} disabled={loadingRecipes}>
                {loadingRecipes ? <Spinner size="sm" animation="border" /> : "Get Recipes"}
              </Button>

              {recipes.length > 0 && (
                <div>
                  {recipes.map((r) => (
                    <Card key={r.id} className="mb-3 p-3 shadow-sm rounded-3 bg-white">
                      <h5 className="text-success">{r.title}</h5>
                      {r.image && (
                        <img
                          src={r.image}
                          alt={r.title}
                          style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "12px" }}
                        />
                      )}
                      <p><strong>Calories:</strong> {r.calories} kcal</p>
                      <p><strong>Protein:</strong> {r.protein} g</p>
                      <p><strong>Fat:</strong> {r.fat} g</p>
                      <p><strong>Carbs:</strong> {r.carbs} g</p>

                      <h6>🧾 Ingredients</h6>
                      <ul>{r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>

                      <h6>👨‍🍳 Instructions</h6>
                      <p dangerouslySetInnerHTML={{ __html: r.instructions }} />
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Floating Food Icons */}
      <FaAppleAlt className="float-icon icon1" />
      <FaCarrot className="float-icon icon2" />
      <FaLeaf className="float-icon icon3" />
      <FaFish className="float-icon icon4" />
      <FaEgg className="float-icon icon5" />
    </div>
  );
};

export default MealPlanner;
