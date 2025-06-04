import { Layout } from '@/components/Layout';
import { InfiniteBookmarkList } from '@/components/InfiniteBookmarkList';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { User, Plus } from 'lucide-react';

const MyBookmarks = () => {
  const { user } = useCurrentUser();

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <User className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Login Required</h2>
              <p className="text-muted-foreground">
                You need to connect your Nostr account to view your bookmarks.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <User className="h-6 w-6 text-primary" />
              <span>My Bookmarks</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your personal bookmark collection
            </p>
          </div>
          
          <Button asChild>
            <Link to="/add" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Bookmark</span>
            </Link>
          </Button>
        </div>

        <InfiniteBookmarkList pubkey={user.pubkey} />
      </div>
    </Layout>
  );
};

export default MyBookmarks;