import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Backend origin for the WebSocket connection. Set VITE_API_URL in production.
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Connects to the backend socket, joins a site room, and registers handlers.
// `handlers` is an object: { event_name: fn }. Pass null siteId to skip joining.
export function useSocket(siteId, handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!siteId) return undefined;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.emit('join_site', siteId);

    const events = Object.keys(handlersRef.current || {});
    events.forEach((evt) => {
      socket.on(evt, (payload) => handlersRef.current?.[evt]?.(payload));
    });

    return () => {
      socket.emit('leave_site', siteId);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId]);
}
