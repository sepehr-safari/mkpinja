import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { Bookmark } from './useBookmarks';

interface UseBookmarkSearchOptions {
  query: string;
  authors?: string[];
  tags?: string[];
  limit?: number;
}

export function useBookmarkSearch({ 
  query, 
  authors, 
  tags, 
  limit = 50 
}: UseBookmarkSearchOptions) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['bookmark-search', query, authors, tags, limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // If no query, return empty results
      if (!query.trim()) {
        return [];
      }
      
      const filter: {
        kinds: number[];
        limit: number;
        authors?: string[];
        '#t'?: string[];
        search?: string;
      } = {
        kinds: [39701],
        limit,
      };
      
      if (authors && authors.length > 0) {
        filter.authors = authors;
      }
      
      if (tags && tags.length > 0) {
        filter['#t'] = tags;
      }

      // Try to use search if supported by relay, otherwise fall back to content filtering
      try {
        // First try with search parameter (NIP-50)
        filter.search = query;
        const events = await nostr.query([filter], { signal });
        
        if (events.length > 0) {
          // Convert events to bookmark objects
          const bookmarks: Bookmark[] = events.map(event => {
            const dTag = event.tags.find(tag => tag[0] === 'd')?.[1] || '';
            const titleTag = event.tags.find(tag => tag[0] === 'title')?.[1];
            const publishedAtTag = event.tags.find(tag => tag[0] === 'published_at')?.[1];
            const tTags = event.tags.filter(tag => tag[0] === 't').map(tag => tag[1]);
            
            // Reconstruct URL from d tag (add https:// if not present)
            let url = dTag;
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
              url = 'https://' + url;
            }

            return {
              id: event.id,
              url,
              title: titleTag,
              description: event.content,
              tags: tTags,
              publishedAt: publishedAtTag ? parseInt(publishedAtTag) : undefined,
              createdAt: event.created_at,
              pubkey: event.pubkey,
              event,
            };
          });

          // Sort by creation date (newest first) and return
          return bookmarks.sort((a, b) => b.createdAt - a.createdAt);
        }
      } catch {
        // Search not supported, fall back to fetching all and filtering
      }

      // Fallback: fetch more events and filter client-side
      delete filter.search;
      filter.limit = Math.min(limit * 5, 500); // Fetch more to filter from
      
      const events = await nostr.query([filter], { signal });
      
      // Convert events to bookmark objects
      const bookmarks: Bookmark[] = events.map(event => {
        const dTag = event.tags.find(tag => tag[0] === 'd')?.[1] || '';
        const titleTag = event.tags.find(tag => tag[0] === 'title')?.[1];
        const publishedAtTag = event.tags.find(tag => tag[0] === 'published_at')?.[1];
        const tTags = event.tags.filter(tag => tag[0] === 't').map(tag => tag[1]);
        
        // Reconstruct URL from d tag (add https:// if not present)
        let url = dTag;
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }

        return {
          id: event.id,
          url,
          title: titleTag,
          description: event.content,
          tags: tTags,
          publishedAt: publishedAtTag ? parseInt(publishedAtTag) : undefined,
          createdAt: event.created_at,
          pubkey: event.pubkey,
          event,
        };
      });

      // Filter bookmarks client-side
      const queryLower = query.toLowerCase();
      const filteredBookmarks = bookmarks.filter(bookmark => {
        const matchesContent = 
          bookmark.title?.toLowerCase().includes(queryLower) ||
          bookmark.description.toLowerCase().includes(queryLower) ||
          bookmark.url.toLowerCase().includes(queryLower) ||
          bookmark.tags.some(tag => tag.toLowerCase().includes(queryLower));
        
        return matchesContent;
      });

      // Sort by creation date (newest first) and limit results
      return filteredBookmarks
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    },
    enabled: !!query.trim(),
    staleTime: 30000, // 30 seconds
  });
}