import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Card, Form, Button } from "react-bootstrap";
import "./Login3D.css";

function Login3D() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="center-bg" />
      <div className="card-wrapper">
        <Card className="login-card shadow-lg">
          <h2 className="welcome-heading">
            Welcome to <span className="nutrifit-highlight" >NutriFit AI</span>{" "}
            <span role="img" aria-label="gym">
              🏋️‍♂️
            </span>
          </h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-transparent text-black border-light"
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
                className="bg-transparent text- border-light"
              />
            </Form.Group>

            <Button type="submit" className="w-100 fw-bold neon-btn">
              Login
            </Button>
          </Form>

          <p className="text-center mt-3">
            Don’t have an account?{" "}
            <Link to="/register" className="link-custom">
              Register
            </Link>
          </p>
          <p className="text-center">
            <Link to="/forgot-password" className="link-muted">
              Forgot Password?
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default Login3D;
