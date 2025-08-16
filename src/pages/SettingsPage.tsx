import { Box, Typography, Button } from "@mui/material";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Settings page for User allowing logging out of profile, then directs to the login page
// Optional collection built in firestore not currently used

const SettingsPage: React.FC = () => {
  const { signOutUser, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOutUser();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        p: 8,
        textAlign: "left",
        minHeight: "10vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <Typography variant="h4">
        {user ? `Logged in as ${user.email}` : "Not logged in"}
      </Typography>

      <Button
        variant="contained"
        color="error"
        onClick={handleLogout}
        sx={{ width: 200, alignSelf: "left" }}
      >
        Log Out
      </Button>
    </Box>
  );
};

export default SettingsPage;