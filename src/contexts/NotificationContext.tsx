import React, { createContext, useContext, useEffect, useState } from "react";
import { query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { notificationsCollection } from "@utils/firestore";
import { useAuth } from "./AuthContext";

interface Notification { id: string; title: string; body: string; link?: string; timestamp: Date; read: boolean; }
interface ContextValue {
  notifications: Notification[];
  markRead: (id: string) => Promise<void>;
  unreadCount: number;
}

const NotificationContext = createContext<ContextValue|null>(null);

export const NotificationProvider: React.FC = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const q = query(
      notificationsCollection,
      where("userId", "==", user.uid),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, snap => {
      setNotifications(snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
        timestamp: (d.data() as any).timestamp.toDate(),
      })));
    });
    return unsub;
  }, [user]);

  const markRead = async (id: string) => {
    await updateDoc(doc(notificationsCollection, id), { read: true });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markRead,
        unreadCount: notifications.length,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside <NotificationProvider>");
  return ctx;
};