import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Connects to the backend socket, joins a site room, and registers handlers.
// `handlers` is an object: { event_name: fn }. Pass null siteId to skip joining.
export function useSocket(siteId, handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!siteId) return undefined;

    const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });
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
