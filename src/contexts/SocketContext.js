import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, restaurant } = useAuth();
  const socketRef = useRef(null);
  
 useEffect(() => {
  if (user) {
    console.log("SOCKET FIXED BUILD");
    const SOCKET_URL = "https://foodash-backend-1-uuwg.onrender.com";

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

      socketRef.current.emit('join', {
        userId: user._id,
        role: user.role,
        restaurantId: restaurant?._id
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user, restaurant]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
