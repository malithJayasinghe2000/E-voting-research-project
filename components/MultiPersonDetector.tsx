import { useEffect, useState, useRef } from "react";
import { FiAlertCircle, FiUser, FiRefreshCw } from "react-icons/fi";

interface MultiPersonDetectorProps {
  onMultiplePersonsDetected: () => void;
  active?: boolean;
}

const MultiPersonDetector: React.FC<MultiPersonDetectorProps> = ({ 
  onMultiplePersonsDetected,
  active = true
}) => {
  const [faceCount, setFaceCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const maxRetries = 3;
  
  useEffect(() => {
    // Only connect if component is active
    if (active) {
      connectWebSocket();
    } else if (wsRef.current) {
      // Close connection if component becomes inactive
      wsRef.current.close();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [active]);
  
  const connectWebSocket = () => {
    console.log("Connecting to face detection WebSocket");
    
    // Close existing connection
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket("ws://127.0.0.1:8000/ws/face_detection");
      
      ws.onopen = () => {
        console.log("WebSocket connection established for face detection");
        setConnected(true);
        setError(null);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.error) {
            console.error("Face detection error:", data.error);
            setError(data.error);
            return;
          }
          
          // Update face count
          if (data.face_count !== undefined) {
            setFaceCount(data.face_count);
          }
          
          // If alert or multiple faces detected, notify parent component
          if (data.alert || data.face_count >= 2) {
            console.log("Multiple faces detected:", data.face_count);
            onMultiplePersonsDetected();
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error. Please try again.");
        setConnected(false);
      };
      
      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setConnected(false);
        
        // Try to reconnect if under max retries
        if (retryCount < maxRetries) {
          console.log(`Retrying connection (${retryCount + 1}/${maxRetries})...`);
          setRetryCount(prev => prev + 1);
          setTimeout(connectWebSocket, 2000);
        }
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setError("Failed to initialize face detection");
    }
  };
  
  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    connectWebSocket();
  };
  
  // If component is not active, return null
  if (!active) return null;
  
  return (
    <div className="rounded-lg border border-gray-200 shadow-sm p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-700">Security Monitor</h3>
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
          connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {connected ? "Connected" : "Disconnected"}
        </div>
      </div>
      
      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3">
          <div className="flex items-start">
            <FiAlertCircle className="mt-0.5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button 
            onClick={handleRetry} 
            className="mt-2 flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
          >
            <FiRefreshCw className="mr-1" /> Retry Connection
          </button>
        </div>
      ) : connected ? (
        <div>
          <div className={`mb-3 p-3 rounded-md ${
            faceCount === 0 
              ? "bg-gray-50 text-gray-700" 
              : faceCount === 1 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
          }`}>
            <div className="flex items-center mb-1">
              <FiUser className="mr-2" />
              <span className="font-medium">
                {faceCount === 0 
                  ? "No faces detected" 
                  : faceCount === 1 
                    ? "1 person detected" 
                    : `${faceCount} people detected!`}
              </span>
            </div>
            {faceCount >= 2 && (
              <p className="text-sm">
                For security reasons, only one person should be in front of the camera.
              </p>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {faceCount <= 1 
              ? "Security check passed. You may proceed with voting." 
              : "Security warning: Multiple people detected!"}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mr-2"></div>
          <p className="text-sm text-gray-600">Connecting to security service...</p>
        </div>
      )}
    </div>
  );
};

export default MultiPersonDetector;
