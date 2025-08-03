// src/components/Footer.tsx

import React from "react";
import { useAuth } from "@contexts/AuthContext";

const Footer: React.FC = () => {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer
      className="text-light text-center py-3 mt-4"
      style={{ backgroundColor: "#00674F" }}
    >
      <div>© {year} TypeScript Planner App</div>
      {user?.email && (
        <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
          Logged in as {user.email}
        </div>
      )}
    </footer>
  );
};

export default Footer;