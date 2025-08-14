// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { notificationsCollection } from "@utils/firestore";
import { useAuth } from "./AuthContext";
import { FirebaseError } from "firebase/app";

/**
 * NotificationContext.tsx
 *
 * Provides real-time, per-user notifications from Firestore to the UI.
 * Features: subscribes to **unread** notifications for the current user, exposes
 *           `unreadCount`, and a `markRead(id)` helper.
 * Dependencies: must be wrapped by `<AuthProvider>`; requires a valid
 *               `notificationsCollection` Firestore CollectionReference.
 */

type Notification = {
  id: string;
  title: string;
  body: string;
  link?: string;
  timestamp: Date;
  read: boolean;
};

type Ctx = {
  notifications: Notification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
};

const NotificationContext = createContext<Ctx | undefined>(undefined);
type Props = { children: React.ReactNode };

export default function NotificationProvider({ children }: Props) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    if (!notificationsCollection) {
      console.error("notificationsCollection is undefined");
      return;
    }

    const q = query(
      notificationsCollection,
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => {
          const data = d.data() as any;
          let ts: Date = new Date();
          try {
            ts = data.timestamp?.toDate?.() ?? new Date();
          } catch {
            // leave default
          }
          return {
            id: d.id,
            title: data.title ?? "",
            body: data.body ?? "",
            link: data.link,
            read: Boolean(data.read),
            timestamp: ts,
          } as Notification;
        });
        setNotifications(next);
      },
      (err) => {
        if (err instanceof FirebaseError && err.code === "permission-denied") {
          console.warn("Permission denied for notifications; check Firestore rules.");
          setNotifications([]); // clear rather than crash
        } else {
          console.error("onSnapshot(notifications) failed:", err);
        }
      }
    );

    return unsub;
  }, [user]);

  const markRead = async (id: string) => {
    await updateDoc(doc(notificationsCollection, id), { read: true });
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount: notifications.length, markRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}