import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "@shared/components/Sidebar";
import Footer from "@shared/components/Footer";

const MainLayout: React.FC = () => {
    return (
        <Container fluid className="d-flex flex-column min-vh-100">
            <Row className="flex-grow-1">
                <Col md={2}>
                     <Sidebar />
                </Col>
                
                    <Col md={10} className="p-4 overflow-auto">
                    <Outlet />
                </Col>
            </Row>
            <Row>
                <Col>
                    <Footer />
                </Col>
            </Row>
        </Container>
    );
};

export default MainLayout;
