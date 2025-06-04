import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { InfiniteBookmarkList } from './InfiniteBookmarkList';

// Mock the hooks
vi.mock('@/hooks/useBookmarks', () => ({
  useInfiniteBookmarks: () => ({
    data: { pages: [{ bookmarks: [] }] },
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useBookmarkSearch', () => ({
  useBookmarkSearch: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useFollows', () => ({
  useFollows: () => ({
    data: [],
  }),
}));

vi.mock('@/hooks/useBookmarkPublish', () => ({
  useBookmarkDelete: () => ({
    mutate: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    user: null,
  }),
}));

describe('InfiniteBookmarkList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input correctly', () => {
    render(
      <TestApp>
        <InfiniteBookmarkList />
      </TestApp>
    );

    const searchInput = screen.getByPlaceholderText('Search bookmarks...');
    expect(searchInput).toBeInTheDocument();
  });

  it('allows typing in search input without disappearing', async () => {
    render(
      <TestApp>
        <InfiniteBookmarkList />
      </TestApp>
    );

    const searchInput = screen.getByPlaceholderText('Search bookmarks...');
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // The input should immediately show the typed value
    expect(searchInput).toHaveValue('test search');
    
    // Continue typing
    fireEvent.change(searchInput, { target: { value: 'test search query' } });
    
    // The input should still show the full typed value
    expect(searchInput).toHaveValue('test search query');
  });

  it('preserves search input value during re-renders', async () => {
    const { rerender } = render(
      <TestApp>
        <InfiniteBookmarkList />
      </TestApp>
    );

    const searchInput = screen.getByPlaceholderText('Search bookmarks...');
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'persistent search' } });
    expect(searchInput).toHaveValue('persistent search');
    
    // Force a re-render
    rerender(
      <TestApp>
        <InfiniteBookmarkList />
      </TestApp>
    );
    
    // The input should still have the same value
    expect(searchInput).toHaveValue('persistent search');
  });

  it('updates search input when initialSearchTerm prop changes', () => {
    const { rerender } = render(
      <TestApp>
        <InfiniteBookmarkList initialSearchTerm="initial" />
      </TestApp>
    );

    const searchInput = screen.getByPlaceholderText('Search bookmarks...');
    expect(searchInput).toHaveValue('initial');
    
    // Change the prop
    rerender(
      <TestApp>
        <InfiniteBookmarkList initialSearchTerm="updated" />
      </TestApp>
    );
    
    expect(searchInput).toHaveValue('updated');
  });
});