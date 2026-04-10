import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Card, Form, Button } from "react-bootstrap";

function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate("/");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1579758629938-03607ccdbaba')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Card
        className="shadow-lg"
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "30px",
          borderRadius: "15px",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          color: "white",
        }}
      >
        <h2 className="text-center mb-4 fw-bold">Join NutriFit 💪</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-transparent text-white border-light"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-transparent text-white border-light"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-transparent text-white border-light"
            />
          </Form.Group>

          <Button
            type="submit"
            className="w-100 fw-bold"
            style={{
              background: "linear-gradient(90deg, #00c6ff, #0072ff)",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "1rem",
            }}
          >
            Register
          </Button>
        </Form>

        <p className="text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#00c6ff", fontWeight: "bold" }}>
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Register;
