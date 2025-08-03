import React from "react";

const Footer: React.FC = () => (
    <footer className="text-light text-center py-3 mt-4" style={{ backgroundColor: "#00674F" }}>
        © {new Date().getFullYear()} TypeScript Planner App
    </footer>
);
export default Footer;
