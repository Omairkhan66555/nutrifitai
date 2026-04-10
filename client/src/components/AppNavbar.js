import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { Navbar, Nav, Container, Button } from "react-bootstrap";

const AppNavbar = () => {
  const { logout, currentUser } = useContext(AuthContext);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">NutriFit AI 🏋️‍♀️</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {currentUser && (
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/meal-planner">Meal Planner</Nav.Link>
              <Nav.Link as={Link} to="/workout-planner">Workout Planner</Nav.Link>
              <Nav.Link as={Link} to="/ar-workout">AR Workout</Nav.Link>
              <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
              <Nav.Link as={Link} to="/lets-build-you">Let's Build You</Nav.Link>

            </Nav>
          )}
          {currentUser && (
            <Button variant="outline-light" onClick={logout}>
              Logout
            </Button>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
