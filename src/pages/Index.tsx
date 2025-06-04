import { Layout } from '@/components/Layout';
import { InfiniteBookmarkList } from '@/components/InfiniteBookmarkList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Bookmark, Plus, Globe } from 'lucide-react';

const Index = () => {
  const { user } = useCurrentUser();
  const { data: userBookmarks } = useBookmarks(user?.pubkey);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">MKPinja</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A decentralized bookmarking service built on the Nostr protocol. 
            Save, organize, and share your favorite web content with complete ownership and control.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <p className="text-muted-foreground">
                Connect your Nostr account to start bookmarking
              </p>
            </div>
          )}
          
          {user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button asChild size="lg">
                <Link to="/add" className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>
                    {userBookmarks && userBookmarks.length > 0 
                      ? 'Add New Bookmark' 
                      : 'Add Your First Bookmark'
                    }
                  </span>
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link to="/my-bookmarks" className="flex items-center space-x-2">
                  <Bookmark className="h-5 w-5" />
                  <span>View My Bookmarks</span>
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <span>Decentralized</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your bookmarks are stored on the Nostr network, giving you complete ownership and control over your data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bookmark className="h-5 w-5 text-primary" />
                <span>Organized</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tag and categorize your bookmarks for easy discovery. Search through your collection with powerful filters.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-primary" />
                <span>Simple</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Clean, intuitive interface inspired by Pinboard. Add bookmarks quickly with titles, descriptions, and tags.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Public Bookmarks */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-2xl font-semibold">Public Bookmarks</h2>
            <p className="text-sm text-muted-foreground">
              Discover what others are bookmarking
            </p>
          </div>
          
          <InfiniteBookmarkList showUserFilter={true} />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
