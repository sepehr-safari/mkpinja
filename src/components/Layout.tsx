import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoginArea } from '@/components/auth/LoginArea';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Bookmark, Home, User, Plus, UserCircle, Search, Github } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user } = useCurrentUser();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Navigation items for mobile bottom bar
  const mobileNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    ...(user ? [
      { path: '/add', icon: Plus, label: 'Add' },
      { path: '/my-bookmarks', icon: User, label: 'Bookmarks' },
      { path: `/profile/${nip19.npubEncode(user.pubkey)}`, icon: UserCircle, label: 'Profile' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2">
                <Bookmark className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">MKPinja</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-4">
                <Button
                  variant={isActive('/') ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to="/" className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </Button>
                
                <Button
                  variant={isActive('/search') ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to="/search" className="flex items-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </Link>
                </Button>
                
                {user && (
                  <>
                    <Button
                      variant={isActive('/add') ? 'default' : 'ghost'}
                      size="sm"
                      asChild
                    >
                      <Link to="/add" className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Bookmark</span>
                      </Link>
                    </Button>
                    
                    <Button
                      variant={isActive('/my-bookmarks') ? 'default' : 'ghost'}
                      size="sm"
                      asChild
                    >
                      <Link to="/my-bookmarks" className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>My Bookmarks</span>
                      </Link>
                    </Button>
                    
                    <Button
                      variant={isActive(`/profile/${nip19.npubEncode(user.pubkey)}`) ? 'default' : 'ghost'}
                      size="sm"
                      asChild
                    >
                      <Link to={`/profile/${nip19.npubEncode(user.pubkey)}`} className="flex items-center space-x-2">
                        <UserCircle className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </Button>
                  </>
                )}
                

              </nav>
            </div>

            {/* Desktop Header Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <a
                  href="https://github.com/sepehr-safari/mkpinja"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source on GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <ThemeToggle />
              <LoginArea className="max-w-60" />
            </div>

            {/* Mobile Header Actions */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <a
                  href="https://github.com/sepehr-safari/mkpinja"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source on GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <ThemeToggle />
              <LoginArea className="max-w-40" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with bottom padding on mobile for fixed bottom nav */}
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-7xl">
        {children}
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Bookmark className="h-4 w-4" />
              <span>MKPinja - Decentralized bookmarking on Nostr</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Built with NIP-B0</span>
              <span>•</span>
              <a 
                href="https://github.com/nostr-protocol/nips/blob/master/B0.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}