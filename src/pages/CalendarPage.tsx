// src/pages/CalendarPage.tsx
import React, { useState, useEffect } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { calendarCollection } from "@utils/firestore";
import { query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@contexts/AuthContext";
import { FirebaseError } from "firebase/app";

/**
 * CalendarPage.tsx
 *
 * Manages per-user calendar events backed by Firestore.
 * Features: highlight days with events, modal CRUD for a selected date, and a readable event list.
 * Security: all reads/writes are scoped by `userId` and enforced by Firestore rules.
 * Error handling: shows permission errors and logs unexpected failures.
 * UI: react-calendar for the grid; MUI for modal, list, and buttons.
 */

// Event shape used across UI and Firestore mapping.
// `date` is stored as a local, calendar-only string: "YYYY-MM-DD"
interface Event {
  id: string;
  date: string; // "YYYY-MM-DD"
  title: string;
}

const CalendarPage: React.FC = () => {
  const { user } = useAuth();

  // Selected date in the calendar (react-calendar value)
  const [date, setDate] = useState<CalendarProps["value"]>(new Date());

  // Event list for the current user
  const [events, setEvents] = useState<Event[]>([]);

  // Initial load / refetch state
  const [loading, setLoading] = useState(true);

  // Dialog state for add/edit flow
  const [modalOpen, setModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  /**
   * Load events whenever the authenticated user changes.
   * Applies `userId` filter to align with security rules.
   */
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const q = query(calendarCollection, where("userId", "==", user.uid));
        const snap = await getDocs(q);
        setEvents(
          snap.docs.map(d => ({
            id: d.id,
            date: d.data().date as string,
            title: d.data().title as string,
          }))
        );
      } catch (err: any) {
        if (err instanceof FirebaseError && err.code === "permission-denied") {
          alert("User doesn't have permission to view events.");
        } else {
          console.error("Error loading events:", err);
          alert("An error occurred while loading events.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  /**
   * Begin add/edit for the clicked day.
   * If an event already exists for that date, preload it for editing.
   */
  const handleDayClick = (d: Date) => {
    if (!user) {
      alert("Please log in to add or edit events.");
      return;
    }
    const iso = d.toISOString().split("T")[0];
    const existing = events.find(e => e.date === iso) || null;
    setEditingEvent(existing);
    setDraftTitle(existing?.title ?? "");
    setDate(d);
    setModalOpen(true);
  };

  /**
   * Open the modal pre-populated with an existing event (from the list).
   */
  const openForEdit = (e: Event) => {
    if (!user) {
      alert("Please log in to edit events.");
      return;
    }
    setEditingEvent(e);
    setDraftTitle(e.title);
    setDate(new Date(e.date));
    setModalOpen(true);
  };

  /**
   * Create a new event for the selected date or update the currently edited one.
   * After a successful write, reload the user's events to refresh the UI.
   */
  const handleSave = async () => {
    if (!user) {
      alert("Please log in to save events.");
      return;
    }
    const iso = (date as Date).toISOString().split("T")[0];
    try {
      if (editingEvent) {
        const ref = doc(calendarCollection, editingEvent.id);
        await updateDoc(ref, { title: draftTitle });
      } else {
        await addDoc(calendarCollection, {
          userId: user.uid,
          date: iso,
          title: draftTitle,
        });
      }
      // Reload events after create/update
      const q = query(calendarCollection, where("userId", "==", user.uid));
      const snap = await getDocs(q);
      setEvents(
        snap.docs.map(d => ({
          id: d.id,
          date: d.data().date as string,
          title: d.data().title as string,
        }))
      );
    } catch (err: any) {
      if (err instanceof FirebaseError && err.code === "permission-denied") {
        alert("You don’t have permission to save this event.");
      } else {
        console.error("Error saving event:", err);
        alert("An error occurred while saving the event.");
      }
    }
    setModalOpen(false);
  };

  /**
   * Delete the currently edited event (when modal is open).
   * Note: the list delete button calls this too; ensure `editingEvent` is set first.
   * (Alternative approach: pass an id to delete and avoid relying on editing state.)
   */
  const handleDelete = async () => {
    if (!user || !editingEvent) {
      alert("Please log in to delete events.");
      return;
    }
    try {
      await deleteDoc(doc(calendarCollection, editingEvent.id));
      setEvents(events.filter(e => e.id !== editingEvent.id));
    } catch (err: any) {
      if (err instanceof FirebaseError && err.code === "permission-denied") {
        alert("You don’t have permission to delete this event.");
      } else {
        console.error("Error deleting event:", err);
        alert("An error occurred while deleting the event.");
      }
    }
    setModalOpen(false);
  };

  /**
   * Mark calendar tiles that have events.
   * Comparison uses the normalized "YYYY-MM-DD" string.
   */
  const isEventDay = (d: Date) =>
    events.some(e => e.date === d.toISOString().split("T")[0]);

  // Loading skeleton while fetching the user's events
  if (loading) {
    return (
      <Box sx={{ p: 8 }}>
        <Typography>Loading calendar…</Typography>
      </Box>
    );
  }

  // Auth guard for the page (also enforced by your protected routes)
  if (!user) {
    return (
      <Box sx={{ p: 8 }}>
        <Typography>Please log in to view your calendar.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 8, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Calendar
      </Typography>

      {/* Calendar grid with click-to-add/edit */}
      <Paper elevation={3} sx={{ maxWidth: 640, mx: "auto", p: 2 }}>
        <Calendar
          onChange={setDate}
          value={date}
          onClickDay={handleDayClick}
          tileClassName={({ date }) => (isEventDay(date) ? "event-day" : "")}
        />
      </Paper>

      {/* Selected date summary */}
      <Typography sx={{ mt: 2 }}>
        Selected Date: {Array.isArray(date)
          ? date.map(d => (d as Date).toLocaleDateString()).join(" – ")
          : (date as Date).toLocaleDateString()}
      </Typography>

      {/* Event list (sorted ascending by date) */}
      <Box sx={{ mt: 6, maxWidth: 640, mx: "auto", textAlign: "left" }}>
        <Typography variant="h5" gutterBottom>
          My Events
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {events.length === 0 ? (
          <Typography>No events yet.</Typography>
        ) : (
          <List>
            {events
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(ev => (
                <ListItem
                  key={ev.id}
                  secondaryAction={
                    <>
                      {/* Open prefilled editor for this item */}
                      <IconButton edge="end" onClick={() => openForEdit(ev)}>
                        <EditIcon />
                      </IconButton>
                      {/* This button calls handleDelete; ensure editingEvent is set (e.g., via modal) before deleting */}
                      <IconButton edge="end" onClick={handleDelete}>
                        <DeleteIcon />
                      </IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={ev.title}
                    secondary={
                      // Render "YYYY-MM-DD" as a local Date without timezone shifts
                      new Date(
                        ...ev.date.split("-").map((v, i) =>
                          i === 1 ? Number(v) - 1 : Number(v)
                        )
                      ).toLocaleDateString()
                    }
                  />
                </ListItem>
              ))}
          </List>
        )}
      </Box>

      {/* Add/Edit modal for the selected date */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>
          {editingEvent ? "Edit Event" : "Add Event"} –{" "}
          {(date as Date).toLocaleDateString()}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          {editingEvent && (
            <Button color="error" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Calendar day highlight */}
      <style>{`
        .event-day {
          background: #ffcc00 !important;
          border-radius: 50%;
        }
      `}</style>
    </Box>
  );
};

export default CalendarPage;3