import { useNostr } from '@nostrify/react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

export interface Bookmark {
  id: string;
  url: string;
  title?: string;
  description: string;
  tags: string[];
  publishedAt?: number;
  createdAt: number;
  pubkey: string;
  event: NostrEvent;
}

export function useBookmarks(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['bookmarks', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      const filter: {
        kinds: number[];
        limit: number;
        authors?: string[];
      } = {
        kinds: [39701],
        limit: 100,
      };
      
      if (pubkey) {
        filter.authors = [pubkey];
      }

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

      // Sort by creation date (newest first)
      return bookmarks.sort((a, b) => b.createdAt - a.createdAt);
    },
    enabled: true,
  });
}

interface UseInfiniteBookmarksOptions {
  pubkey?: string;
  authors?: string[];
  pageSize?: number;
}

export function useInfiniteBookmarks({ 
  pubkey, 
  authors, 
  pageSize = 20 
}: UseInfiniteBookmarksOptions = {}) {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['infinite-bookmarks', pubkey, authors],
    queryFn: async ({ pageParam, signal }) => {
      const querySignal = AbortSignal.any([signal, AbortSignal.timeout(5000)]);
      
      const filter: {
        kinds: number[];
        limit: number;
        authors?: string[];
        until?: number;
      } = {
        kinds: [39701],
        limit: pageSize,
      };
      
      if (pubkey) {
        filter.authors = [pubkey];
      } else if (authors && authors.length > 0) {
        filter.authors = authors;
      }
      
      if (pageParam) {
        filter.until = pageParam;
      }

      const events = await nostr.query([filter], { signal: querySignal });
      
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

      // Sort by creation date (newest first)
      const sortedBookmarks = bookmarks.sort((a, b) => b.createdAt - a.createdAt);
      
      return {
        bookmarks: sortedBookmarks,
        nextCursor: sortedBookmarks.length === pageSize ? 
          sortedBookmarks[sortedBookmarks.length - 1].createdAt : undefined,
      };
    },
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: true,
  });
}

export function useBookmark(url: string, pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['bookmark', url, pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      // Convert URL to d tag format (remove protocol)
      const dTag = url.replace(/^https?:\/\//, '');
      
      const filter: {
        kinds: number[];
        '#d': string[];
        limit: number;
        authors?: string[];
      } = {
        kinds: [39701],
        '#d': [dTag],
        limit: 1,
      };
      
      if (pubkey) {
        filter.authors = [pubkey];
      }

      const events = await nostr.query([filter], { signal });
      
      if (events.length === 0) return null;
      
      const event = events[0];
      const titleTag = event.tags.find(tag => tag[0] === 'title')?.[1];
      const publishedAtTag = event.tags.find(tag => tag[0] === 'published_at')?.[1];
      const tTags = event.tags.filter(tag => tag[0] === 't').map(tag => tag[1]);

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
      } as Bookmark;
    },
    enabled: !!url,
  });
}