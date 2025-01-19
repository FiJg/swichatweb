import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import axios from "axios";

const LOCALHOST_URL = "http://localhost:8082";

const MainChat = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        // Fetch messages from the Main Chatroom
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${LOCALHOST_URL}/api/chatroom/public/messages`);
                if (isMounted) {
                    setMessages(response.data);
                }
            } catch (error) {
                console.error("Error fetching main chat messages:", err);
                if (isMounted) {
                    setError("Unable to load messages. Please try again later.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchMessages();
        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) {
        return (
            <Box sx={{ textAlign: "center", marginTop: "50px" }}>
                <CircularProgress />
                <Typography variant="caption" sx={{ marginTop: "10px", display: "block" }}>
                    Loading messages...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ padding: "20px", backgroundColor: "#f5f5f5" }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Error
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    {error}
                </Typography>
            </Box>
        );
    }

    function formatDate(timestamp) {
        if (!timestamp) return "Invalid Date";


        const date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);

        if (isNaN(date.getTime())) return "Invalid Date";


        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });
    }




    return (
        <Box sx={{ padding: "20px", backgroundColor: "#f5f5f5" }}>
            <Typography variant="h5" gutterBottom>
              Browsing messsages in the Main Chat
            </Typography>
            <Typography variant="subtitle1" gutterBottom>

            </Typography>
            <Box sx={{ maxHeight: "500px", overflowY: "auto", marginTop: "20px" }}>
                {messages.length === 0 ? (
                    <Typography>No messages yet.</Typography>
                ) : (
                    messages.map((msg) => (
                        <Box
                            key={msg.id}
                            sx={{
                                padding: "10px",
                                marginBottom: "10px",
                                backgroundColor: "#e0e0e0",
                                borderRadius: "10px",
                            }}
                        >
                            <Typography variant="body1">{msg.content || "No Content"}</Typography>
                            <Typography variant="caption" sx={{ color: 'gray' }}>
                                Sent by {msg.username || 'Anonymous'} at {formatDate(msg.sendTime)}
                            </Typography>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default MainChat;
