"use client"; 

import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });  // 🔹 Ensure WebSocket transport is used

export default function ThreatAlert() {
    const [alertMessage, setAlertMessage] = useState(null);

    useEffect(() => {
        console.log("🔗 Connecting to backend...");

        socket.on("connect", () => {
            console.log("✅ Connected to WebSocket");
            socket.emit("start_monitoring");  // Start monitoring when connected
          });
          
          socket.on("threat_alert", (data) => {
            console.log("🚨 Threat Alert Received:", data.alert);
            alert(data.alert);  // Optional: Show an alert for testing
          });
          
          socket.on("disconnect", () => {
            console.log("❌ Disconnected from WebSocket");
          });

        return () => {
            socket.off("threat_alert");
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={() => {
                    console.log("📡 Sending 'start_monitoring' event...");
                    socket.emit("start_monitoring");
                }}
            >
                Start Voting Monitoring
            </button>

            {alertMessage && (
                <div className="mt-4 p-4 bg-red-500 text-white text-lg rounded">
                    {alertMessage}
                </div>
            )}
        </div>
    );
}
