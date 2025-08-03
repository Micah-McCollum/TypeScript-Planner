import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Button, } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useClientSideEncryption } from "@shared/components/encrypt/client/useClientSideEncryption";
import { notesCollection } from "@utils/firestore";
import {
  query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, } from "firebase/firestore";
import { useAuth } from "@contexts/AuthContext";

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
  } = useClientSideEncryption();

  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Load & decrypt this user's notes
  const loadNotes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        notesCollection,
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);
      const decrypted = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const decryptedContent = await decrypt(data.content as string);
          return {
            id: d.id,
            subject: data.subject as string,
            content: decryptedContent,
          };
        })
      );
      setNotes(decrypted);
    } catch (err) {
      console.error("Error loading notes:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, [user]);

  // Save new or updated note
  const saveNote = async () => {
    if (!user || !subject.trim() || !content.trim()) return;
    setLoading(true);

    try {
      const encrypted = await encrypt(content);
      if (currentNote) {
        const noteRef = doc(notesCollection, currentNote.id);
        await updateDoc(noteRef, {
          subject,
          content: encrypted,
        });
        setCurrentNote(null);
      } else {
        await addDoc(notesCollection, {
          userId: user.uid,
          subject,
          content: encrypted,
        });
      }

      await loadNotes();
      setSubject("");
      setContent("");
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  // Populate form for editing
  const editNote = (note: Note) => {
    setCurrentNote(note);
    setSubject(note.subject);
    setContent(note.content);
  };

  // Delete a note
  const deleteNoteById = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(notesCollection, id));
      await loadNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  return (
    <Box sx={{ padding: "40px", maxWidth: 800, margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Notes
      </Typography>

      {loading ? (
        <Typography>Loading notes…</Typography>
      ) : (
        <>
          <Paper sx={{ padding: 2, mb: 4 }} elevation={3}>
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
                disabled={loading || !subject.trim() || !content.trim()}
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

          {notes.map((note) => (
            <Paper key={note.id} sx={{ p: 2, mb: 2 }} elevation={2}>
              <Typography variant="h6">{note.subject}</Typography>
              <Box
                sx={{ mb: 2 }}
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => editNote(note)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => deleteNoteById(note.id)}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          ))}
        </>
      )}
    </Box>
  );
};

export default NotesPage;