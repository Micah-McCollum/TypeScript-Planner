// src/pages/HomePage.tsx
import React, { useState, useEffect } from "react";
import {Box, Typography, Paper, List, ListItem, ListItemText } from "@mui/material";
import { useAuth } from "@contexts/AuthContext";
import { financesCollection, calendarCollection, notesCollection } from "@utils/firestore";
import { query, where, getDocs } from "firebase/firestore";
/* HomePage is the landing page after logging in, provides widgets of different data for the User
 * 
*/
const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [upcoming, setUpcoming] = useState<{ date: string; title: string }[]>(
    []
  );
  const [notesCount, setNotesCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Load finance totals
    (async () => {
      const q = query(financesCollection, where("userId", "==", user.uid));
      const snap = await getDocs(q);
      let income = 0,
        expense = 0;
      snap.docs.forEach((d) => {
        const { amount, type } = d.data();
        if (type === "Income") income += amount as number;
        else expense += amount as number;
      });
      setTotals({ income, expense });
    })();

    // Load upcoming calendar events
    (async () => {
      const q = query(
        calendarCollection,
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);
      const today = new Date();
      const evts = snap.docs
        .map((d) => {
          const data = d.data();
          return { date: data.date as string, title: data.title as string };
        })
        .map((e) => {
          const [y, m, d] = e.date.split("-");
          return {
            ...e,
            dateObj: new Date(Number(y), Number(m) - 1, Number(d)),
          };
        })
        .filter((e) => e.dateObj >= today)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
        .slice(0, 5)
        .map((e) => ({ date: e.date, title: e.title }));
      setUpcoming(evts);
    })();

    // Load notes count
    (async () => {
      const q = query(notesCollection, where("userId", "==", user.uid));
      const snap = await getDocs(q);
      setNotesCount(snap.docs.length);
    })();
  }, [user]);

  return (
    <Box sx={{ ml: "240px", p: 5 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to TypeScript Planner!
      </Typography>
      {user && (
        <Typography variant="subtitle1" gutterBottom>
          Logged in as {user.email}
        </Typography>
      )}

      {/* Finance Summary */}
      <Box sx={{ display: "flex", gap: 4, mb: 4, flexWrap: "wrap" }}>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6">Finances Summary</Typography>
          <Typography>Income:  ${totals.income.toFixed(2)}</Typography>
          <Typography>Expense: ${totals.expense.toFixed(2)}</Typography>
          <Typography>
            Balance: ${(totals.income - totals.expense).toFixed(2)}
          </Typography>
        </Paper>

        {/* Notes Summary */}
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6">Notes</Typography>
          <Typography>You have {notesCount} notes.</Typography>
        </Paper>
      </Box>

      {/* Upcoming Events */}
      <Paper sx={{ p: 2, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Upcoming Events
        </Typography>
        {upcoming.length === 0 ? (
          <Typography>No upcoming events.</Typography>
        ) : (
          <List dense>
            {upcoming.map((e) => (
              <ListItem key={e.date + e.title}>
                <ListItemText
                  primary={e.title}
                  secondary={new Date(
                    ...e.date.split("-").map((s, i) => (i === 1 ? Number(s) - 1 : Number(s)))
                  ).toLocaleDateString()}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default HomePage;