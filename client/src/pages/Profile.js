import React, { useContext } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { AuthContext } from "../contexts/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Profile = () => {
  const { currentUser, logout } = useContext(AuthContext);

  // Dummy progress data (isko baad me backend se laa sakte hai)
  const progressData = [
    { day: "Mon", calories: 1800, workouts: 1 },
    { day: "Tue", calories: 2000, workouts: 2 },
    { day: "Wed", calories: 1700, workouts: 1 },
    { day: "Thu", calories: 2200, workouts: 2 },
    { day: "Fri", calories: 2100, workouts: 1 },
    { day: "Sat", calories: 1900, workouts: 2 },
    { day: "Sun", calories: 2000, workouts: 1 },
  ];

  return (
    <Container style={{ marginTop: "40px" }}>
      <Row className="mb-4">
        {/* Left side - Profile Card */}
        <Col md={4}>
          <Card className="shadow-lg">
            <Card.Img
              variant="top"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
              style={{ height: "250px", objectFit: "cover" }}
            />
            <Card.Body>
              <Card.Title>{currentUser?.name || "User Name"}</Card.Title>
              <Card.Text>
                <strong>Email:</strong> {currentUser?.email || "user@mail.com"}
              </Card.Text>
              <Button variant="danger" onClick={logout}>
                Logout
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Right side - Chart */}
        <Col md={8}>
          <Card className="shadow-lg p-3">
            <h4 className="mb-3">📊 Weekly Progress</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="workouts" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
