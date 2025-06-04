import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrMetadata } from '@nostrify/nostrify';

interface UserDisplayProps {
  pubkey: string;
  className?: string;
  showFullPubkey?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
  linkToProfile?: boolean;
}

export function UserDisplay({ 
  pubkey, 
  className = '', 
  showFullPubkey = false,
  avatarSize = 'sm',
  linkToProfile = true
}: UserDisplayProps) {
  const author = useAuthor(pubkey);
  const metadata: NostrMetadata | undefined = author.data?.metadata;

  const displayName = metadata?.display_name || metadata?.name || genUserName(pubkey);
  const profileImage = metadata?.picture;
  
  // Get initials for fallback
  const initials = displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const npub = nip19.npubEncode(pubkey);
  const profilePath = `/profile/${npub}`;

  const content = (
    <>
      <Avatar className={avatarSizeClasses[avatarSize]}>
        {profileImage && (
          <AvatarImage 
            src={profileImage} 
            alt={`${displayName}'s avatar`}
          />
        )}
        <AvatarFallback className="bg-muted text-muted-foreground">
          {initials || <User className="h-3 w-3" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col min-w-0">
        <span className={`font-medium truncate ${textSizeClasses[avatarSize]}`}>
          {displayName}
        </span>
        {showFullPubkey && (
          <span className="text-xs text-muted-foreground font-mono truncate">
            {pubkey}
          </span>
        )}
      </div>
    </>
  );

  if (linkToProfile) {
    return (
      <Link 
        to={profilePath}
        className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {content}
    </div>
  );
}