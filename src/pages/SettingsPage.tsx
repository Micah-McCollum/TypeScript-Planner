import React, { useState, useEffect } from "react";
import { Box, Switch, Typography, Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";

// Settings page for User to change accessibility features
// Includes Dark mode/Font size changes
// Will store and load user settings based on profile
const SettingsPage: React.FC = () => {
  const { signOutUser } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<string>("small");

  // Load settings for the user on mount
  useEffect(() => {
    const storedDark = localStorage.getItem("darkMode");
    const storedSize = localStorage.getItem("fontSize");
    if (storedDark) setDarkMode(storedDark === "true");
    if (storedSize) setFontSize(storedSize);
  }, []);

  // Save settings for the user
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    localStorage.setItem("fontSize", fontSize);
  }, [darkMode, fontSize]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Box
      sx={{
        padding: "80px",
        backgroundColor: darkMode ? "#121212" : "#f5f5f5",
        color: darkMode ? "#ffffff" : "#000000",
        minHeight: "100vh",
        transition: "background-color 0.3s ease",
      }}
    >
      <Typography variant="h4" gutterBottom>
        User Settings
      </Typography>

      {/* Dark Mode Toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginBottom: "20px",
        }}
      >
        <Typography>Dark Mode</Typography>
        <Switch
          checked={darkMode}
          onChange={() => setDarkMode((prev) => !prev)}
        />
      </Box>

      {/* Font Size Selector */}
      <FormControl fullWidth sx={{ marginBottom: 4 }}>
        <InputLabel>Font Size</InputLabel>
        <Select
          value={fontSize}
          label="Font Size"
          onChange={(e) => setFontSize(e.target.value)}
        >
          <MenuItem value="small">Small</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="large">Large</MenuItem>
        </Select>
      </FormControl>

      {/* Example Text */}
      <Typography
        sx={{
          marginBottom: 4,
          fontSize:
            fontSize === "small"
              ? "14px"
              : fontSize === "medium"
              ? "18px"
              : "22px",
        }}
      >
        This is example text showing {fontSize} font size.
      </Typography>

      {/* Log Out Button */}
      <Button variant="contained" color="error" onClick={handleLogout}>
        Log Out
      </Button>
    </Box>
  );
};

export default SettingsPage;