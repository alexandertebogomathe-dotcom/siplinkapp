import { useState, useCallback, useMemo } from 'react';
import { Invite } from './useInvites';

type SortOption = 'newest' | 'oldest' | 'most-spots' | 'least-spots';

interface UseSearchFilter {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (option: SortOption) => void;
  filteredAndSortedInvites: Invite[];
  clearFilters: () => void;
}

/**
 * Hook for managing search and filtering of events
 */
export function useSearchFilter(invites: Invite[]): UseSearchFilter {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSortBy('newest');
  }, []);

  // Memoized filtering and sorting
  const filteredAndSortedInvites = useMemo(() => {
    let result = [...invites];

    // FILTER: Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (invite) =>
          invite.host.toLowerCase().includes(query) ||
          invite.location.toLowerCase().includes(query) ||
          invite.fun_fact.toLowerCase().includes(query) ||
          invite.detail?.toLowerCase().includes(query)
      );
    }

    // SORT
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => {
          const timeMap: { [key: string]: number } = { Now: 0, '+15 min': 1, '+30 min': 2 };
          return (timeMap[b.time] || 0) - (timeMap[a.time] || 0);
        });
        break;
      case 'most-spots':
        result.sort((a, b) => b.spots - a.spots);
        break;
      case 'least-spots':
        result.sort((a, b) => a.spots - b.spots);
        break;
      case 'newest':
      default:
        result.sort((a, b) => {
          const timeMap: { [key: string]: number } = { Now: 0, '+15 min': 1, '+30 min': 2 };
          return (timeMap[a.time] || 0) - (timeMap[b.time] || 0);
        });
    }

    return result;
  }, [invites, searchQuery, sortBy]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filteredAndSortedInvites,
    clearFilters
  };
}
