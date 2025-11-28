import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { db } from "../config/firebase"; // Adjusted path for Expo (no `../../` unless necessary)
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp?: any;
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messagesList, setMessagesList] = useState<Message[]>([]);

  // Replace with dynamic user IDs when auth is ready
  const currentUser = "victim1";
  const expertUser = "expert1";
  const chatId = [currentUser, expertUser].sort().join("_");

  useEffect(() => {
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, "id">),
      }));
      setMessagesList(msgs);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        sender: currentUser,
        text: message.trim(),
        timestamp: serverTimestamp(),
      });
      setMessage("");
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      Alert.alert("Error", "Failed to send message. Try again.");
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "chats", chatId, "messages", id));
    } catch (error) {
      console.error("Error deleting message:", error);
      Alert.alert("Error", "Could not delete message.");
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert("Delete Message", "Are you sure you want to delete this message?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: () => deleteMessage(id) },
    ]);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <TouchableOpacity
      onLongPress={() => {
        if (item.sender === currentUser) {
          confirmDelete(item.id);
        }
      }}
      delayLongPress={600}
      activeOpacity={0.8}
      style={[
        styles.messageBubble,
        item.sender === currentUser ? styles.self : styles.other,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={80}
    >
      <FlatList
        data={messagesList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
          placeholderTextColor="#777"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  messagesContainer: { padding: 10 },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopColor: "#ccc",
    borderTopWidth: 1,
    backgroundColor: "#f9f9f9",
  },
  input: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    color: "#000",
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonText: { color: "white", fontWeight: "bold" },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    maxWidth: "75%",
  },
  self: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C5",
  },
  other: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageText: { fontSize: 16, color: "#000" },
});
