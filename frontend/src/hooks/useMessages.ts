import { useState, useCallback } from 'react';
import { Invite, Message } from './useInvites';
import { API_URL } from '../config/api';

interface UseMessages {
  messageInput: string;
  error: string | null;
  submitting: boolean;
  setMessageInput: (input: string) => void;
  sendMessage: (selectedInvite: Invite | null, onSuccess?: () => Promise<void>) => Promise<boolean>;
}

/**
 * Hook for managing message input and sending
 * Delegates state updates to parent component
 */
export function useMessages(currentUser: string | null): UseMessages {
  const [messageInput, setMessageInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const sendMessage = useCallback(
    async (selectedInvite: Invite | null, onSuccess?: () => Promise<void>): Promise<boolean> => {
      if (!selectedInvite || !currentUser) {
        setError('Invalid invite or user');
        return false;
      }

      if (!messageInput.trim()) {
        setError('Message cannot be empty');
        return false;
      }

      try {
        setSubmitting(true);
        setError(null);

        const payload = {
          sender: currentUser,
          text: messageInput.trim()
        };

        const response = await fetch(`${API_URL}/messages/${selectedInvite.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.statusText}`);
        }

        console.log('💬 SENDING MESSAGE', { sender: currentUser, text: messageInput, invite_id: selectedInvite.id });

        setMessageInput('');
        if (onSuccess) {
          await onSuccess();
        }
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMsg);
        console.error('❌ Message error:', errorMsg);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [currentUser, messageInput]
  );

  return {
    messageInput,
    error,
    submitting,
    setMessageInput,
    sendMessage
  };
}
