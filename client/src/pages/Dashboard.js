import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div>
      {/* ✅ Hero Section */}
      <div
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "65vh",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textShadow: "2px 2px 6px rgba(0,0,0,0.7)",
        }}
      >
        <h1 style={{ fontSize: "3.5rem", fontWeight: "bold" }}>
          Welcome to NutriFit AI
        </h1>
        <p style={{ fontSize: "1.3rem", marginBottom: "20px" }}>
          Your AI Fitness Partner — Plan. Train. Transform.
        </p>
        <Button
          variant="light"
          size="lg"
          onClick={() => navigate("/meal-planner")}
        >
          Start Your Journey
        </Button>
      </div>

      {/* ✅ Cards Section with Animations */}
      <Container style={{ marginTop: "60px", marginBottom: "60px" }}>
        <Row className="g-4">
          {[
            {
              title: "🍽 Meal Planner",
              text: "Track your nutrition and plan healthy meals with ease.",
              img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
              btn: "primary",
              link: "/meal-planner",
            },
            {
              title: "🏋️ Workout Planner",
              text: "Build custom workouts and stay consistent with your training.",
              img: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1",
              btn: "success",
              link: "/workout-planner",
            },
            {
              title: "🤖 AR Workout",
              text: "Experience AI-powered workouts with real-time pose detection.",
              img: "https://cdn.mos.cms.futurecdn.net/ivVDGShTSLy8kb4VsHX7df-1200-80.jpg",
              btn: "warning",
              link: "/ar-workout",
            },
            {
              title: "👤 Profile",
              text: "View and manage your personal details and progress.",
              img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
              btn: "dark",
              link: "/profile",
            },
          ].map((item, index) => (
            <Col md={6} lg={3} key={index}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                variants={cardVariants}
              >
                <Card className="h-100 shadow-lg border-0 card-hover">
                  <Card.Img
                    variant="top"
                    src={item.img}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title>{item.title}</Card.Title>
                    <Card.Text>{item.text}</Card.Text>
                    <Button
                      variant={item.btn}
                      onClick={() => navigate(item.link)}
                    >
                      Go
                    </Button>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* ✅ Footer */}
      <footer
        style={{
          backgroundColor: "#222",
          color: "white",
          textAlign: "center",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        NutriFit AI © 2025 | Built with ❤️
      </footer>

      {/* ✅ Extra CSS for Hover */}
      <style>
        {`
          .card-hover {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .card-hover:hover {
            transform: translateY(-10px) scale(1.03);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
