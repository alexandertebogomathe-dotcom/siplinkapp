import React, { FC, memo } from 'react';
import { inputStyle, selectStyle } from '../styles/theme';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'newest' | 'oldest' | 'most-spots' | 'least-spots';
  onSortChange: (sort: 'newest' | 'oldest' | 'most-spots' | 'least-spots') => void;
  onClearFilters?: () => void;
  resultCount: number;
}

/**
 * Component for searching and filtering events
 * Memoized to prevent unnecessary re-renders
 */
const SearchBar: FC<SearchBarProps> = memo(
  ({ searchQuery, onSearchChange, sortBy, onSortChange, onClearFilters, resultCount }) => {
    const hasActiveFilters = searchQuery.trim().length > 0 || sortBy !== 'newest';

    return (
      <div
        style={{
          marginBottom: 16,
          padding: 12,
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: 8,
          border: '1px solid #ddd'
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search by host, location, or topic..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            ...inputStyle,
            marginBottom: 8
          }}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            style={{
              ...selectStyle,
              flex: 1,
              marginBottom: 0
            }}
          >
            <option value="newest">⏰ Newest First</option>
            <option value="oldest">🕐 Oldest First</option>
            <option value="most-spots">👥 Most Spots</option>
            <option value="least-spots">👤 Least Spots</option>
          </select>

          {hasActiveFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              style={{
                padding: '8px 12px',
                background: '#999',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                minWidth: 'auto'
              }}
            >
              Reset
            </button>
          )}
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: '#666',
            textAlign: 'right'
          }}
        >
          📊 {resultCount} event{resultCount !== 1 ? 's' : ''} found
        </p>
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
