import { useState } from 'react';
import { useBookmarks, type Bookmark } from '@/hooks/useBookmarks';
import { useBookmarkDelete } from '@/hooks/useBookmarkPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ExternalLink, Trash2, Search, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { formatBookmarkCount } from '@/lib/utils';
import { UserDisplay } from '@/components/UserDisplay';

interface BookmarkListProps {
  pubkey?: string;
  showUserFilter?: boolean;
}

export function BookmarkList({ pubkey, showUserFilter = false }: BookmarkListProps) {
  const { user } = useCurrentUser();
  const { data: bookmarks, isLoading, error } = useBookmarks(pubkey);
  const { mutate: deleteBookmark } = useBookmarkDelete();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive">
            Failed to load bookmarks. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {pubkey ? 'This user has no bookmarks yet.' : 'No bookmarks found. Create your first bookmark!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get all unique tags for filtering
  const allTags = Array.from(
    new Set(bookmarks.flatMap(bookmark => bookmark.tags))
  ).sort();

  // Filter and sort bookmarks
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = 
      bookmark.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === 'all' || bookmark.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {formatBookmarkCount(filteredBookmarks.length)} bookmark{filteredBookmarks.length !== 1 ? 's' : ''} found
      </div>

      {/* Bookmark cards */}
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
                            onClick={() => setSelectedTag(tag)}
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
    </div>
  );
}