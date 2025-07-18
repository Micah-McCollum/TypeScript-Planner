import React, { useState, useEffect } from "react";
import { Box, Switch, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

// Settings page for User to change accessibility features
// Includes Dark mode/Font size changes
// Will store and load user settings based on profile
const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<string>("small");

  // Load settings for the user on mount
  useEffect(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    const storedFontSize = localStorage.getItem("fontSize");

    if(storedDarkMode) setDarkMode(storedDarkMode === "true");
    if(storedFontSize) setFontSize(storedFontSize);
  }, []);

  // Save settings for the user here
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
    localStorage.setItem("fontSize", fontSize);
  }, [darkMode, fontSize]);

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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: "20px" }}>
        <Typography>Dark Mode</Typography>
        <Switch checked={darkMode} onChange={() => setDarkMode((prev) => !prev)} />
      </Box>

      {/* Font Size Selector */}
      <FormControl fullWidth>
        <InputLabel>Font Size</InputLabel>
        <Select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
          <MenuItem value="size 14">Small</MenuItem>
          <MenuItem value="size 18">Medium</MenuItem>
          <MenuItem value="size 22">Large</MenuItem>
        </Select>
      </FormControl>

      {/* Example Text for Font Size Selection */}
      <Typography sx={{ marginTop: "20px", fontSize: fontSize === "small" ? "14px" : fontSize === "medium" ? "18px" : "22px" }}>
        This is example text showing {fontSize} font size.
      </Typography>
    </Box>
  );
};

export default SettingsPage;