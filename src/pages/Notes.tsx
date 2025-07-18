import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, TextField, Button } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useClientSideEncryption } from "../shared/components/encrypt/client/useClientSideEncryption";

interface Note {
    id: string;
    subject: string;
    content: string;
}

const Notes: React.FC = () => {
    const { clientSideOnlyEncryptionEncrypt, clientSideOnlyEncryptionDecrypt } = useClientSideEncryption();
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [decryptedNotes, setDecryptedNotes] = useState<Note[]>([]);

    useEffect(() => {
        const decryptNotes = async () => {
            const decrypted = await Promise.all(
                notes.map(async (note) => ({
                    id: note.id,
                    subject: note.subject,
                    content: await clientSideOnlyEncryptionDecrypt(note.content),
                }))
            );
            setDecryptedNotes(decrypted);
        };

        decryptNotes();
    }, [notes]);


    useEffect(() => {
        const loadNotes = async () => {
            try {
                const savedNotes = sessionStorage.getItem("notes");
                if (!savedNotes) {
                    setIsLoading(false);
                    return;
                }
                const parsedNotes: Note[] = JSON.parse(savedNotes);
                const decryptedNotes = await Promise.all(
                    parsedNotes.map(async (note) => {
                        try {
                            const decryptedContent = await clientSideOnlyEncryptionDecrypt(note.content);
                            return { id: note.id, subject: note.subject, content: decryptedContent };
                        } catch (decryptionError) {
                            console.error(`error:${note.id}:`, decryptionError);
                            return { ...note, content: "ERROR" };
                        }
                    })
                );
                setNotes(decryptedNotes);
            } catch (error) {
                console.error("error", error);
                setNotes([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadNotes();
    }, []);

    const saveNote = async () => {
        if (!subject.trim() || !content.trim()) return;
        try {
            const encryptedContent = await clientSideOnlyEncryptionEncrypt(content);
            let updatedNotes;
            if (currentNote) {
                updatedNotes = notes.map((note) =>
                    note.id === currentNote.id ? { ...note, subject, content: encryptedContent } : note
                );
                setCurrentNote(null);
            } else {
                const newNote = { id: Date.now().toString(), subject, content: encryptedContent };
                updatedNotes = [...notes, newNote];
            }
            sessionStorage.setItem("notes", JSON.stringify(updatedNotes));
            setNotes(updatedNotes);
        } catch (error) {
            console.error("error", error);
        }
        setSubject("");
        setContent("");
    };

    const editNote = (note: Note) => {
        setCurrentNote(note);
        setSubject(note.subject);
        setContent(note.content);
    };
    const deleteNote = (id: string) => {
        const updatedNotes = notes.filter((note) => note.id !== id);
        sessionStorage.setItem("notes", JSON.stringify(updatedNotes));
        setNotes(updatedNotes);
    };

    return (
        <Box sx={{ marginLeft: "0px", padding: "16px", maxWidth: "800px", margin: "auto" }}>
            <br />
            <br />
            <br />
            <Typography variant="h4" gutterBottom>
                NOTES.
            </Typography>

            {isLoading ? (
                <Typography>Loading notes...</Typography>
            ) : (
                <>
                    <Paper sx={{ padding: 2, marginBottom: 2 }} elevation={3}>
                        <Typography variant="h6">{currentNote ? "Edit Note" : "New Note"}</Typography>

                        <TextField
                            fullWidth
                            label="Subject"
                            variant="outlined"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            sx={{ marginBottom: 3 }}
                        />

                        <ReactQuill
                            value={content}
                            onChange={setContent}
                            style={{ height: "200px", marginBottom: "20px", overflowY: "auto" }}
                        />

                        <Button variant="contained" color="primary" onClick={saveNote} sx={{ marginRight: 2 }}>
                            {currentNote ? "Update" : "Save"}
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => setCurrentNote(null)}>
                            Cancel
                        </Button>
                    </Paper>

                    {decryptedNotes.map((note) => (
                        <Paper key={note.id} sx={{ padding: 2, marginBottom: 2 }} elevation={2}>
                            <Typography variant="h6">{note.subject}</Typography>
                            <Box dangerouslySetInnerHTML={{ __html: note.content }} sx={{ marginBottom: 2 }} />
                            <Button variant="contained" color="warning" onClick={() => editNote(note)} sx={{ marginRight: 2 }}>
                                Edit
                            </Button>
                            <Button variant="contained" color="error" onClick={() => deleteNote(note.id)}>
                                Delete
                            </Button>
                        </Paper>
                    ))}
                </>
            )}
        </Box>
    );
};
export default Notes;



