import { useState, useEffect, useCallback } from 'react';
import { useInfiniteBookmarks, type Bookmark } from '@/hooks/useBookmarks';
import { useBookmarkSearch } from '@/hooks/useBookmarkSearch';
import { useFollows } from '@/hooks/useFollows';
import { useBookmarkDelete } from '@/hooks/useBookmarkPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ExternalLink, Trash2, Search, Calendar, Tag, Users, Globe, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { formatBookmarkCount } from '@/lib/utils';
import { UserDisplay } from '@/components/UserDisplay';

interface InfiniteBookmarkListProps {
  pubkey?: string;
  showUserFilter?: boolean;
  initialSearchTerm?: string;
}

export function InfiniteBookmarkList({ pubkey, showUserFilter = false, initialSearchTerm = '' }: InfiniteBookmarkListProps) {
  const { user } = useCurrentUser();
  const [searchInput, setSearchInput] = useState(initialSearchTerm);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showFollowsOnly, setShowFollowsOnly] = useState(false);

  // Update search input when prop changes
  useEffect(() => {
    setSearchInput(initialSearchTerm);
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  // Debounce search input to avoid too many queries
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);
  
  // Get user's follows
  const { data: follows = [] } = useFollows(user?.pubkey);
  
  // Determine which authors to query
  const authors = showFollowsOnly && follows.length > 0 ? follows : undefined;
  
  // Use search when there's a search term, otherwise use infinite query
  const isSearching = searchTerm.trim().length > 0;
  
  const infiniteQuery = useInfiniteBookmarks({ 
    pubkey, 
    authors,
    pageSize: 20 
  });

  const searchQuery = useBookmarkSearch({
    query: searchTerm,
    authors: pubkey ? [pubkey] : authors,
    tags: selectedTag !== 'all' ? [selectedTag] : undefined,
    limit: 100,
  });

  const { mutate: deleteBookmark } = useBookmarkDelete();

  // Use search results when searching, otherwise use infinite query results
  const data = isSearching ? undefined : infiniteQuery.data;
  const fetchNextPage = infiniteQuery.fetchNextPage;
  const hasNextPage = isSearching ? false : infiniteQuery.hasNextPage;
  const isFetchingNextPage = isSearching ? false : infiniteQuery.isFetchingNextPage;
  const isLoading = isSearching ? searchQuery.isLoading : infiniteQuery.isLoading;
  const error = isSearching ? searchQuery.error : infiniteQuery.error;

  // Get bookmarks from appropriate source
  const allBookmarks = isSearching 
    ? (searchQuery.data || [])
    : (data?.pages.flatMap(page => page.bookmarks) || []);

  // Get all unique tags for filtering (from infinite query for better tag discovery)
  const allTags = Array.from(
    new Set((infiniteQuery.data?.pages.flatMap(page => page.bookmarks) || []).flatMap(bookmark => bookmark.tags))
  ).sort();

  // Filter and sort bookmarks
  let filteredBookmarks = allBookmarks;

  // Apply tag filter if not searching (search already handles tag filtering)
  if (!isSearching) {
    filteredBookmarks = allBookmarks.filter(bookmark => {
      const matchesTag = selectedTag === 'all' || bookmark.tags.includes(selectedTag);
      return matchesTag;
    });
  }

  // Sort bookmarks
  filteredBookmarks.sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return a.createdAt - b.createdAt;
      case 'title':
        return (a.title || a.url).localeCompare(b.title || b.url);
      case 'newest':
      default:
        return b.createdAt - a.createdAt;
    }
  });

  // Infinite scroll handler (only when not searching)
  const handleScroll = useCallback(() => {
    if (
      !isSearching &&
      window.innerHeight + document.documentElement.scrollTop
      >= document.documentElement.offsetHeight - 1000 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isSearching]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleDelete = (bookmark: Bookmark) => {
    deleteBookmark(bookmark.id, {
      onSuccess: () => {
        toast.success('Bookmark deleted successfully');
      },
      onError: () => {
        toast.error('Failed to delete bookmark');
      },
    });
  };

  const canDelete = (bookmark: Bookmark) => {
    return user && user.pubkey === bookmark.pubkey;
  };

  // Don't return early for loading state - we want to show the search interface

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and basic filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search bookmarks..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'title') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Global vs Follows toggle */}
            {!pubkey && user && follows.length > 0 && (
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Switch
                  id="follows-only"
                  checked={showFollowsOnly}
                  onCheckedChange={setShowFollowsOnly}
                />
                <Label htmlFor="follows-only" className="flex items-center gap-2 cursor-pointer">
                  {showFollowsOnly ? (
                    <>
                      <Users className="h-4 w-4" />
                      <span>Showing bookmarks from your connections ({follows.length})</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      <span>Showing global bookmarks</span>
                    </>
                  )}
                </Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          {isSearching ? (
            <>
              {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''} found for "{searchInput}"
              {showFollowsOnly && follows.length > 0 && (
                <span> from your {follows.length} connection{follows.length !== 1 ? 's' : ''}</span>
              )}
            </>
          ) : (
            <>
              {formatBookmarkCount(filteredBookmarks.length, hasNextPage)} bookmark{filteredBookmarks.length !== 1 ? 's' : ''} found
              {showFollowsOnly && follows.length > 0 && (
                <span> from your {follows.length} connection{follows.length !== 1 ? 's' : ''}</span>
              )}
            </>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{isSearching ? 'Searching...' : 'Loading bookmarks...'}</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Failed to load bookmarks. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No results */}
      {filteredBookmarks.length === 0 && !isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {isSearching ? (
                <>
                  No bookmarks found for "{searchInput}". Try different keywords or check your filters.
                </>
              ) : (
                showFollowsOnly 
                  ? 'No bookmarks found from your connections. Try switching to global view or follow more people.'
                  : pubkey 
                    ? 'This user has no bookmarks yet.' 
                    : 'No bookmarks found. Create your first bookmark!'
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bookmark cards */}
      {!isLoading && !error && filteredBookmarks.length > 0 && (
        <div className="space-y-4">
          {filteredBookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-primary hover:underline flex items-center gap-2 truncate"
                    >
                      {bookmark.title || new URL(bookmark.url).hostname}
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </a>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2 break-all">
                    {bookmark.url}
                  </div>

                  {showUserFilter && (
                    <div className="mb-2">
                      <UserDisplay 
                        pubkey={bookmark.pubkey} 
                        avatarSize="sm"
                        className="text-xs text-muted-foreground"
                      />
                    </div>
                  )}
                </div>

                {canDelete(bookmark) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Bookmark</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this bookmark? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(bookmark)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {bookmark.description && (
                <p className="text-sm mb-3 whitespace-pre-wrap break-words">
                  {bookmark.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(bookmark.createdAt * 1000), { addSuffix: true })}
                  </span>
                </div>

                {bookmark.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <div className="flex flex-wrap gap-1">
                        {bookmark.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-accent"
                            onClick={() => {
                              setSelectedTag(tag);
                              // Clear search when filtering by tag
                              if (searchInput) {
                                setSearchInput('');
                              }
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Load more indicator */}
      {!isSearching && isFetchingNextPage && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading more bookmarks...</span>
          </div>
        </div>
      )}

      {/* End of results */}
      {!isSearching && !hasNextPage && allBookmarks.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've reached the end of the bookmarks!</p>
        </div>
      )}
    </div>
  );
}