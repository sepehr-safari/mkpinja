import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAuthor } from '@/hooks/useAuthor';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useFollows } from '@/hooks/useFollows';
import { genUserName } from '@/lib/genUserName';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { InfiniteBookmarkList } from '@/components/InfiniteBookmarkList';
import { 
  User, 
  Bookmark, 
  Globe, 
  Mail, 
  ExternalLink,
  Users,
  UserPlus,
  UserMinus,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import type { NostrMetadata } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

const Profile = () => {
  const { pubkey: pubkeyParam } = useParams<{ pubkey: string }>();
  const { user } = useCurrentUser();
  const [copiedNpub, setCopiedNpub] = useState(false);
  
  // Decode npub if provided, otherwise use as hex
  let pubkey: string;
  let isValidPubkey = true;
  
  try {
    if (pubkeyParam?.startsWith('npub')) {
      const decoded = nip19.decode(pubkeyParam);
      if (decoded.type === 'npub') {
        pubkey = decoded.data;
      } else {
        isValidPubkey = false;
        pubkey = '';
      }
    } else {
      pubkey = pubkeyParam || '';
    }
  } catch {
    isValidPubkey = false;
    pubkey = '';
  }

  // Always call hooks in the same order
  const author = useAuthor(isValidPubkey ? pubkey : undefined);
  const { data: bookmarks = [] } = useBookmarks(isValidPubkey ? pubkey : undefined);
  const { data: follows = [] } = useFollows(isValidPubkey ? pubkey : undefined);
  const { data: userFollows = [] } = useFollows(user?.pubkey);
  
  // Handle invalid pubkey after hooks
  if (!isValidPubkey) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Profile</h1>
          <p className="text-muted-foreground mb-6">
            The profile identifier you provided is not valid.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }
  
  const metadata: NostrMetadata | undefined = author.data?.metadata;
  const isOwnProfile = user?.pubkey === pubkey;
  const isFollowing = userFollows.includes(pubkey);
  
  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const profileImage = metadata?.picture;
  const npub = nip19.npubEncode(pubkey);
  
  // Get initials for fallback
  const initials = displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleCopyNpub = async () => {
    try {
      await navigator.clipboard.writeText(npub);
      setCopiedNpub(true);
      toast.success('Npub copied to clipboard');
      setTimeout(() => setCopiedNpub(false), 2000);
    } catch {
      toast.error('Failed to copy npub');
    }
  };

  const handleFollow = () => {
    // TODO: Implement follow functionality
    toast.info('Follow functionality coming soon');
  };

  const handleUnfollow = () => {
    // TODO: Implement unfollow functionality  
    toast.info('Unfollow functionality coming soon');
  };

  if (author.isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-20 bg-muted rounded-lg"></div>
          <div className="h-40 bg-muted rounded-lg"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden">
          {/* Banner */}
          {metadata?.banner && (
            <div className="h-32 md:h-48 bg-gradient-to-r from-primary/10 to-primary/5 relative">
              <img 
                src={metadata.banner} 
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!metadata?.banner && (
            <div className="h-32 md:h-48 bg-gradient-to-r from-primary/10 to-primary/5"></div>
          )}
          
          <CardContent className="pt-6 relative">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start space-y-4">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg -mt-12 md:-mt-16">
                  {profileImage && (
                    <AvatarImage 
                      src={profileImage} 
                      alt={`${displayName}'s avatar`}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                    {initials || <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!isOwnProfile && user && (
                    <Button
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleCopyNpub}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {copiedNpub ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copiedNpub ? 'Copied!' : 'Copy npub'}
                  </Button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  {metadata?.display_name && metadata?.name && metadata.display_name !== metadata.name && (
                    <p className="text-lg text-muted-foreground">@{metadata.name}</p>
                  )}
                </div>

                {metadata?.about && (
                  <p className="text-muted-foreground whitespace-pre-wrap break-words">
                    {metadata.about}
                  </p>
                )}

                {/* Profile Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {metadata?.website && (
                    <a
                      href={metadata.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      {new URL(metadata.website).hostname}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  
                  {metadata?.nip05 && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {metadata.nip05}
                    </div>
                  )}


                </div>

                {/* Npub Display */}
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Nostr Public Key</p>
                  <p className="font-mono text-sm break-all">{npub}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookmarks.length}</div>
              <p className="text-xs text-muted-foreground">
                {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'} saved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Following
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{follows.length}</div>
              <p className="text-xs text-muted-foreground">
                {follows.length === 1 ? 'person' : 'people'} followed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metadata ? '✓' : '?'}
              </div>
              <p className="text-xs text-muted-foreground">
                {metadata ? 'Profile set up' : 'No profile data'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tags */}
        {bookmarks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(bookmarks.flatMap(bookmark => bookmark.tags))
                )
                  .slice(0, 20)
                  .map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* User's Bookmarks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {isOwnProfile ? 'Your Bookmarks' : `${displayName}'s Bookmarks`}
            </h2>
            {isOwnProfile && (
              <Button asChild>
                <Link to="/add">Add Bookmark</Link>
              </Button>
            )}
          </div>
          
          <InfiniteBookmarkList pubkey={pubkey} />
        </div>
      </div>
    </Layout>
  );
};

export default Profile;