import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { createUserProfile } from "@utils/users";
import "../styles/Authy.css";

/**
 * CreateAccountPage.tsx
 *
 * Handles email/password sign-up and post-signup profile creation in Firestore.
 * UX: basic form with password confirmation, loading state, and inline errors.
 * Security: passwords are sent only to Firebase Auth; profile doc is user-scoped by UID.
 * Error handling: validates password confirmation; narrows unknown errors for safe messaging.
 */

const CreateAccountPage: React.FC = () => {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);

  const { signUp } = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don’t match.");
      return;
    }

    setLoading(true);
    try {
      const user = await signUp(email, password);

      // Create corresponding Firestore profile
      await createUserProfile(user);

      navigate("/", { replace: true });
    } catch (err: unknown) {
  // Narrow the unknown to an Error if possible:
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError("An error occurred during account creation");
  }
    }
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirm(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default CreateAccountPage;