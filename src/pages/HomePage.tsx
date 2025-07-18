import { useEffect } from "react";
import log from "loglevel";
import { Box } from "@mui/material";

export default function HomePage() {
  useEffect(() => {
    log.info("React app started!");
    log.warn("This is a warning!");
    log.error("Something went wrong!");
  }, []);

  const text = "Financial Planner SP25_Hotel";
  const otherText = "Basic Setup Complete!";

  return (
      <Box sx={{ marginLeft: "20px", padding: "100px" }}>  
        <h2>HOME...</h2>
      </Box>
  );
}

