import { renderHook, act } from '@testing-library/react';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { Invite } from '../hooks/useInvites';

describe('useSearchFilter Hook', () => {
  const mockInvites: Invite[] = [
    {
      id: '1',
      host: 'Alice',
      location: 'Common Room',
      time: 'Now',
      spots: 3,
      fun_fact: 'I love coffee',
      detail: 'Level 1',
      guests: []
    },
    {
      id: '2',
      host: 'Bob',
      location: 'Kitchen',
      time: '+15 min',
      spots: 1,
      fun_fact: 'I love tea',
      guests: []
    },
    {
      id: '3',
      host: 'Charlie',
      location: 'Outside',
      time: '+30 min',
      spots: 5,
      fun_fact: 'I love hiking',
      guests: []
    }
  ];

  it('should initialize with empty search query', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));
    expect(result.current.searchQuery).toBe('');
  });

  it('should update search query', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));

    act(() => {
      result.current.setSearchQuery('Alice');
    });

    expect(result.current.searchQuery).toBe('Alice');
  });

  it('should filter by host name', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));

    act(() => {
      result.current.setSearchQuery('Alice');
    });

    expect(result.current.filteredAndSortedInvites).toHaveLength(1);
    expect(result.current.filteredAndSortedInvites[0].host).toBe('Alice');
  });

  it('should filter by location', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));

    act(() => {
      result.current.setSearchQuery('Kitchen');
    });

    expect(result.current.filteredAndSortedInvites).toHaveLength(1);
    expect(result.current.filteredAndSortedInvites[0].location).toBe('Kitchen');
  });

  it('should filter by fun fact', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));

    act(() => {
      result.current.setSearchQuery('coffee');
    });

    expect(result.current.filteredAndSortedInvites).toHaveLength(1);
    expect(result.current.filteredAndSortedInvites[0].fun_fact).toContain('coffee');
  });

  it('should sort by newest first', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));

    act(() => {
      result.current.setSortBy('newest');
    });

    expect(result.current.filteredAndSortedInvites[0].time).toBe('Now');
  });

  it('should sort by most spots', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));

    act(() => {
      result.current.setSortBy('most-spots');
    });

    expect(result.current.filteredAndSortedInvites[0].spots).toBe(5);
  });

  it('should sort by least spots', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));

    act(() => {
      result.current.setSortBy('least-spots');
    });

    expect(result.current.filteredAndSortedInvites[0].spots).toBe(1);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));

    act(() => {
      result.current.setSearchQuery('Alice');
      result.current.setSortBy('most-spots');
    });

    expect(result.current.searchQuery).toBe('Alice');
    expect(result.current.sortBy).toBe('most-spots');

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.sortBy).toBe('newest');
    expect(result.current.filteredAndSortedInvites).toEqual(mockInvites);
  });

  it('should handle case-insensitive search', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));

    act(() => {
      result.current.setSearchQuery('ALICE');
    });

    expect(result.current.filteredAndSortedInvites).toHaveLength(1);
    expect(result.current.filteredAndSortedInvites[0].host).toBe('Alice');
  });

  it('should return all invites when no filters applied', () => {
    const { result } = renderHook(() => useSearchFilter(mockInvites));
    expect(result.current.filteredAndSortedInvites).toEqual(mockInvites);
  });
});
