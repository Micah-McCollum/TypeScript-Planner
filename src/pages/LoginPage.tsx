import React, { useState } from "react";
import "../styles/Authy.css";

const LoginPage: React.FC = () => {
  // State to Firestore user input
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload on form submission
    console.log("User logged in:", { email, password });

    // We need to add in authy logic here


    // Reset email or password
    setEmail("");
    setPassword("");
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // Update email
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // Update password
          required
        />
        <button type="submit">Sign In</button>
      </form>
      <p>
        Don't have an account? <a href="/create-account">Sign up</a>
      </p>
    </div>
  );
};

export default LoginPage;
