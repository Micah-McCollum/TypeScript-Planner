import React, { useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Default React style for Calendar
import { Box, Paper, Typography } from "@mui/material";

// Basic Calendar import from React, can click to select a date if needed later
// Need to test functionality with DB later point
const CalendarPage: React.FC = () => {
  // State for selected date
  const [date, setDate] = useState<CalendarProps["value"]>(new Date());

  // Test Mock event dates to be replaced
  // DATE FORMAT: ("YYYY-MM-DD")
  const mockEvents = ["2025-03-10", "2025-03-15", "2025-03-20"];

  // Function to determine if a day has an event set
  const isEventDay = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    return mockEvents.includes(formattedDate);
  };

  return (
    <Box sx={{ padding: "64px" }}>
      <Typography variant="h4" gutterBottom>
        Calendar
      </Typography>

      <Paper elevation={3} sx={{ maxWidth: 640, padding: 2 }}>
        {/* Main Calendar Component */}
        {/* Can add Event System Here */}
        <Calendar
          onChange={setDate}
          value={date}
          tileClassName={({ date }) =>
            isEventDay(date) ? "event-day" : "" // TODO: Add class for event dates
          }
        />
      </Paper>

      {/* Selected Date Display w/ basic validation*/}
      <Typography sx={{ marginTop: "20px" }}>
        Selected Date: {Array.isArray(date)
          ? `${date[0] instanceof Date ? date[0].toLocaleDateString() : date[0]} - ${date[1] instanceof Date ? date[1].toLocaleDateString() : date[1]}`
          : date instanceof Date
          ? date.toLocaleDateString()
          : date}
      </Typography>


      {/* Will show highlighted date on calendar */}
      <style>{`
        .event-day {
          background: #ffcc00 !important;
          border-radius: 50%;
        }
      `}</style>
    </Box>
  );
};

export default CalendarPage;