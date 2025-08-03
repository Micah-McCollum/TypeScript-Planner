// src/pages/NotesPage.tsx
import React, { useState, useEffect } from "react";
import {Box, Typography, Paper, TextField, Button,} from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useClientSideEncryption } from "@shared/components/encrypt/client/useClientSideEncryption";
import { notesCollection } from "@utils/firestore";
import {query, where, getDocs, addDoc, updateDoc, deleteDoc, doc,} from "firebase/firestore";
import { useAuth } from "@contexts/AuthContext"

interface Note {
  id: string;
  subject: string;
  content: string;
}

const NotesPage: React.FC = () => {
  const { user } = useAuth();
  const {
    clientSideOnlyEncryptionEncrypt: encrypt,
    clientSideOnlyEncryptionDecrypt: decrypt,
    ready,
  } = useClientSideEncryption();

  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Load & decrypt this user's notes, but never abort on a single failure
  const loadNotes = async () => {
    if (!user || !ready) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const q = query(notesCollection, where("userId", "==", user.uid));
      const snap = await getDocs(q);
      console.log("Fetched notes:", snap.docs.length);

      const list: Note[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        let decryptedContent = "";
        try {
          decryptedContent = await decrypt(data.content as string);
        } catch (e) {
          console.error("Decrypt failed for note", d.id, e);
        }
        list.push({
          id: d.id,
          subject: data.subject as string,
          content: decryptedContent,
        });
      }

      setNotes(list);
    } catch (err) {
      console.error("Error loading notes:", err);
      setNotes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ready, decrypt]);

  // Create or update a note
  const saveNote = async () => {
    if (!user || !ready || !subject.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const blob = await encrypt(content);
      if (currentNote) {
        await updateDoc(doc(notesCollection, currentNote.id), {
          subject,
          content: blob,
        });
        setCurrentNote(null);
      } else {
        await addDoc(notesCollection, {
          userId: user.uid,
          subject,
          content: blob,
        });
      }
      setSubject("");
      setContent("");
      await loadNotes();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  // Prepare form for editing
  const editNote = (n: Note) => {
    setCurrentNote(n);
    setSubject(n.subject);
    setContent(n.content);
  };

  // Delete a note
  const deleteNoteById = async (id: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await deleteDoc(doc(notesCollection, id));
      await loadNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, m: "0 auto" }}>
        <Typography>Loading notes…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, m: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Notes
      </Typography>

      {/* Note creation/edit form */}
      <Paper sx={{ p: 2, mb: 4 }} elevation={3}>
        <Typography variant="h6" gutterBottom>
          {currentNote ? "Edit Note" : "New Note"}
        </Typography>
        <TextField
          fullWidth
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          sx={{ mb: 2 }}
        />
        <ReactQuill
          value={content}
          onChange={setContent}
          style={{ height: 200, marginBottom: 16 }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={saveNote}
            disabled={!subject.trim() || !content.trim()}
          >
            {currentNote ? "Update" : "Save"}
          </Button>
          {currentNote && (
            <Button
              variant="outlined"
              onClick={() => {
                setCurrentNote(null);
                setSubject("");
                setContent("");
              }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Paper>

      {/* Existing notes */}
      {notes.length === 0 ? (
        <Typography>No notes yet. Create one above!</Typography>
      ) : (
        notes.map((n) => (
          <Paper key={n.id} sx={{ p: 2, mb: 2 }} elevation={2}>
            <Typography variant="h6">{n.subject}</Typography>
            <Box
              sx={{ mb: 2 }}
              dangerouslySetInnerHTML={{ __html: n.content }}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={() => editNote(n)}>
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => deleteNoteById(n.id)}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default NotesPage;