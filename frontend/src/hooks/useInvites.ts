import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api';

export interface Invite {
  id: string | number;
  host: string;
  time: string;
  location: string;
  detail?: string;
  spots: number;
  original_spots?: number;
  phone?: string;
  fun_fact: string;
  additional_info?: string;
  beverages?: string[];
  guests?: string[];
  joined_by?: string[];
  messages?: Message[];
  created_at?: number;
}

export interface Message {
  sender: string;
  text: string;
}

export interface EventFormData {
  time: string;
  location: string;
  detail: string;
  spots: number;
  phone: string;
  fun_fact: string;
  additional_info: string;
  beverages: string[];
}

interface UseInvites {
  invites: Invite[];
  visibleInvites: Invite[];
  myEvents: Invite[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  fetchInvites: () => Promise<void>;
  createInvite: (formData: EventFormData) => Promise<boolean>;
  joinInvite: (inviteId: string) => Promise<boolean>;
}

const BEVERAGE_OPTIONS = [
  '☕ Coffee',
  '🍵 Tea',
  '🥛 Milk',
  '🧋 Boba Tea',
  '🍹 Juice',
  '🧃 Smoothie',
  '🥤 Soda',
  '💧 Water'
];

/**
 * Hook for managing event invites and CRUD operations
 * Handles API communication with Flask backend
 */
export function useInvites(currentUser: string | null): UseInvites {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchInvites = useCallback(async (): Promise<void> => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      
      // Fetch available invites and all events (including full ones)
      const [availableRes, allEventsRes] = await Promise.all([
        fetch(`${API_URL}/invites`),
        fetch(`${API_URL}/all-events`)
      ]);

      if (!availableRes.ok) {
        throw new Error(`Failed to fetch available invites: ${availableRes.statusText}`);
      }
      if (!allEventsRes.ok) {
        throw new Error(`Failed to fetch all events: ${allEventsRes.statusText}`);
      }

      const available: Invite[] = await availableRes.json();
      const allEvents: Invite[] = await allEventsRes.json();
      
      // Combine both lists, avoiding duplicates (combining live available + all events)
      const seen = new Set<number | string>();
      const combined: Invite[] = [];
      
      // Add available invites first
      for (const inv of available) {
        const id = inv.id;
        if (!seen.has(id)) {
          combined.push(inv);
          seen.add(id);
        }
      }
      
      // Add all events that weren't in available (i.e., the full ones)
      for (const inv of allEvents) {
        const id = inv.id;
        if (!seen.has(id)) {
          combined.push(inv);
          seen.add(id);
        }
      }

      setInvites(combined);

      console.log('📊 INVITE DATA SYNC');
      console.log('Available invites:', available.length);
      console.log('All events:', allEvents.length);
      console.log('Combined:', combined.length);
      console.log('Sample:', combined[0]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMsg);
      console.error('❌ Fetch error:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const createInvite = useCallback(
    async (formData: EventFormData): Promise<boolean> => {
      if (!currentUser) {
        setError('You must be logged in to create an invite');
        return false;
      }

      try {
        setSubmitting(true);
        setError(null);

        const payload = {
          ...formData,
          host: currentUser
        };

        const response = await fetch(`${API_URL}/invites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Failed to create invite: ${response.statusText}`);
        }

        console.log('✅ Invite created:', payload);
        await fetchInvites();
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create event';
        setError(errorMsg);
        console.error('❌ Create error:', errorMsg);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [currentUser, fetchInvites]
  );

  const joinInvite = useCallback(
    async (inviteId: string): Promise<boolean> => {
      if (!currentUser) {
        setError('You must be logged in to join an invite');
        return false;
      }

      try {
        setSubmitting(true);
        setError(null);

        const response = await fetch(`${API_URL}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: inviteId, guestName: currentUser })
        });

        if (!response.ok) {
          throw new Error(`Failed to join invite: ${response.statusText}`);
        }

        console.log('✅ Joined event:', inviteId);
        await fetchInvites();
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to join event';
        setError(errorMsg);
        console.error('❌ Join error:', errorMsg);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [currentUser, getApiUrl, fetchInvites]
  );

  // Auto-polling when currentUser exists
  useEffect(() => {
    if (!currentUser) return;

    // Fetch immediately on mount or currentUser change
    fetchInvites();
    
    // Then set up polling every 3 seconds
    const interval = setInterval(() => {
      fetchInvites();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, fetchInvites]);

  const visibleInvites = invites.filter((invite) => {
    if (!currentUser) return true;
    
    // FIXED: Support both guests and joined_by arrays
    const allGuests = [...(invite.guests || []), ...(invite.joined_by || [])];
    
    // Show invites where current user is NOT a guest AND not the host
    return invite.host !== currentUser && !allGuests.includes(currentUser);
  });

  const myEvents = invites.filter((invite) => {
    if (!currentUser) return false;

    // FIXED: Check host AND guests/joined_by (backend now normalizes all to lowercase)
    const isHost = invite.host === currentUser;
    
    // Support both guests and joined_by arrays
    const allGuests = [...(invite.guests || []), ...(invite.joined_by || [])];
    const isGuest = allGuests.includes(currentUser);

    return isHost || isGuest;
  });

  return {
    invites,
    visibleInvites,
    myEvents,
    loading,
    error,
    submitting,
    fetchInvites,
    createInvite,
    joinInvite
  };
}

export { BEVERAGE_OPTIONS };
