import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { InfiniteBookmarkList } from '@/components/InfiniteBookmarkList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [currentQuery, setCurrentQuery] = useState(searchParams.get('q') || '');

  // Update search input when URL changes
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchInput(query);
    setCurrentQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchInput.trim();
    
    if (trimmedQuery) {
      setSearchParams({ q: trimmedQuery });
      setCurrentQuery(trimmedQuery);
    } else {
      setSearchParams({});
      setCurrentQuery('');
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchParams({});
    setCurrentQuery('');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Search Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="h-5 w-5" />
              Search Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search bookmarks by title, description, URL, or tags..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={!searchInput.trim()}>
                Search
              </Button>
              {currentQuery && (
                <Button type="button" variant="outline" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </form>
            
            {currentQuery && (
              <div className="mt-4 text-sm text-muted-foreground">
                Searching for: <span className="font-medium">"{currentQuery}"</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {currentQuery ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Search Results</h2>
            {/* Pass the search term to trigger search mode */}
            <InfiniteBookmarkList 
              key={currentQuery} 
              showUserFilter={true} 
              initialSearchTerm={currentQuery}
            />
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Search for bookmarks</p>
                <p className="text-sm">
                  Enter keywords to search through titles, descriptions, URLs, and tags.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Search;