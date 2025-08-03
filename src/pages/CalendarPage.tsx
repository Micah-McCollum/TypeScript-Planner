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

interface Event {
  id: string;
  date: string;      // "YYYY-MM-DD"
  title: string;
}

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<CalendarProps["value"]>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // dialog state
  const [modalOpen, setModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // load events on mount / user change
  useEffect(() => {
    if (!user) {
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
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // open modal to add or edit
  const handleDayClick = (d: Date) => {
    const iso = d.toISOString().split("T")[0];
    const existing = events.find(e => e.date === iso) || null;
    setEditingEvent(existing);
    setDraftTitle(existing?.title ?? "");
    setDate(d);
    setModalOpen(true);
  };

  const openForEdit = (e: Event) => {
    setEditingEvent(e);
    setDraftTitle(e.title);
    setDate(new Date(e.date));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    const iso = (date as Date).toISOString().split("T")[0];
    try {
      if (editingEvent) {
        // update
        const ref = doc(calendarCollection, editingEvent.id);
        await updateDoc(ref, { title: draftTitle });
      } else {
        // create
        await addDoc(calendarCollection, {
          userId: user.uid,
          date: iso,
          title: draftTitle,
        });
      }
      // reload
      const q = query(calendarCollection, where("userId", "==", user.uid));
      const snap = await getDocs(q);
      setEvents(
        snap.docs.map(d => ({
          id: d.id,
          date: d.data().date as string,
          title: d.data().title as string,
        }))
      );
    } catch (err) {
      console.error(err);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    try {
      await deleteDoc(doc(calendarCollection, editingEvent.id));
      setEvents(events.filter(e => e.id !== editingEvent.id));
    } catch (err) {
      console.error(err);
    }
    setModalOpen(false);
  };

  const isEventDay = (d: Date) =>
    events.some(e => e.date === d.toISOString().split("T")[0]);

  if (loading) {
    return (
      <Box sx={{ p: 8 }}>
        <Typography>Loading calendar…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 8, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Calendar
      </Typography>

      {/* Calendar widget */}
      <Paper elevation={3} sx={{ maxWidth: 640, mx: "auto", p: 2 }}>
        <Calendar
          onChange={setDate}
          value={date}
          onClickDay={handleDayClick}
          tileClassName={({ date }) => (isEventDay(date) ? "event-day" : "")}
        />
      </Paper>

      <Typography sx={{ mt: 2, textAlign: "center" }}>
        Selected Date:{" "}
        {(Array.isArray(date)
          ? date.map(d => (d as Date).toLocaleDateString()).join(" – ")
          : (date as Date).toLocaleDateString())}
      </Typography>

      {/* Readable list of events */}
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
        .map((ev) => (
          <ListItem
            key={ev.id}
            secondaryAction={
              <>
                <IconButton edge="end" onClick={() => openForEdit(ev)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={async () => {
                    await deleteDoc(doc(calendarCollection, ev.id));
                    setEvents(events.filter((e) => e.id !== ev.id));
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={ev.title}
              secondary={
                (() => {
                  const [y, m, d] = ev.date.split("-");
                  // construct a local-date so it doesn’t shift by timezone
                  return new Date(
                    Number(y),
                    Number(m) - 1,
                    Number(d)
                  ).toLocaleDateString();
                })()
              }
            />
          </ListItem>
        ))}
    </List>
  )}
</Box>

      {/* Modal for add/edit */}
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