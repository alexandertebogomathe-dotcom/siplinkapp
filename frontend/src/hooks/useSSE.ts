import { useEffect, useCallback, useRef } from 'react';
import { API_URL } from '../config/api';

export interface SSEEvent {
  type: string;
  data: any;
}

interface UseSSE {
  isConnected: boolean;
  onEvent: (callback: (event: SSEEvent) => void) => void;
}

/**
 * Hook for Server-Sent Events real-time notifications
 */
export function useSSE(username: string | null): UseSSE {
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  const callbacksRef = useRef<Set<(event: SSEEvent) => void>>(new Set());

  const onEvent = useCallback((callback: (event: SSEEvent) => void) => {
    callbacksRef.current.add(callback);
    return () => callbacksRef.current.delete(callback);
  }, []);

  useEffect(() => {
    if (!username) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        isConnectedRef.current = false;
      }
      return;
    }

    const eventSource = new EventSource(
      `${API_URL}/events?user=${encodeURIComponent(username)}`
    );

    eventSource.onopen = () => {
      isConnectedRef.current = true;
      console.log('✅ SSE Connected for:', username);
    };

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 SSE Event:', message.type, message.data);
        callbacksRef.current.forEach((callback) => callback(message));
      } catch (err) {
        console.error('❌ Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = () => {
      isConnectedRef.current = false;
      console.warn('⚠️ SSE Connection error');
      eventSource.close();
    };

    eventSourceRef.current = eventSource;

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        isConnectedRef.current = false;
      }
    };
  }, [username]);

  return {
    isConnected: isConnectedRef.current,
    onEvent
  };
}
