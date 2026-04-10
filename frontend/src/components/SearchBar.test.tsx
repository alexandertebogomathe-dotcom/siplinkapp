import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/SearchBar';

describe('SearchBar Component', () => {
  const mockProps = {
    searchQuery: '',
    onSearchChange: jest.fn(),
    sortBy: 'newest' as const,
    onSortChange: jest.fn(),
    onClearFilters: jest.fn(),
    resultCount: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    render(<SearchBar {...mockProps} />);
    const input = screen.getByPlaceholderText(/Search by host/i);
    expect(input).toBeInTheDocument();
  });

  it('should call onSearchChange when typing', () => {
    render(
      <SearchBar
        {...mockProps}
        searchQuery=""
        onSearchChange={mockProps.onSearchChange}
      />
    );

    const input = screen.getByPlaceholderText(/Search by host/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Alice' } });

    expect(mockProps.onSearchChange).toHaveBeenCalledWith('Alice');
  });

  it('should render sort dropdown', () => {
    render(<SearchBar {...mockProps} />);
    const select = screen.getByDisplayValue('⏰ Newest First');
    expect(select).toBeInTheDocument();
  });

  it('should call onSortChange when sort option changes', () => {
    render(
      <SearchBar
        {...mockProps}
        sortBy="newest"
        onSortChange={mockProps.onSortChange}
      />
    );

    const select = screen.getByDisplayValue('⏰ Newest First');
    fireEvent.change(select, { target: { value: 'most-spots' } });

    expect(mockProps.onSortChange).toHaveBeenCalledWith('most-spots');
  });

  it('should display result count', () => {
    render(<SearchBar {...mockProps} resultCount={3} />);
    expect(screen.getByText(/3 events found/i)).toBeInTheDocument();
  });

  it('should show reset button when filters are active', () => {
    render(
      <SearchBar
        {...mockProps}
        searchQuery="Alice"
        onClearFilters={mockProps.onClearFilters}
      />
    );

    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();

    fireEvent.click(resetButton);
    expect(mockProps.onClearFilters).toHaveBeenCalled();
  });

  it('should not show reset button when no filters applied', () => {
    render(
      <SearchBar
        {...mockProps}
        searchQuery=""
        sortBy="newest"
        onClearFilters={mockProps.onClearFilters}
      />
    );

    const resetButton = screen.queryByText('Reset');
    expect(resetButton).not.toBeInTheDocument();
  });

  it('should handle singular event text', () => {
    render(<SearchBar {...mockProps} resultCount={1} />);
    expect(screen.getByText(/1 event found/i)).toBeInTheDocument();
  });
});
