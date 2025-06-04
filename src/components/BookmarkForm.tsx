import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBookmarkPublish } from '@/hooks/useBookmarkPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const bookmarkSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  title: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  tagInput: z.string().optional(),
});

type BookmarkFormData = z.infer<typeof bookmarkSchema>;

interface BookmarkFormProps {
  onSuccess?: () => void;
  initialUrl?: string;
  initialTitle?: string;
}

export function BookmarkForm({ onSuccess, initialUrl = '', initialTitle = '' }: BookmarkFormProps) {
  const { user } = useCurrentUser();
  const { mutate: createBookmark, isPending } = useBookmarkPublish();
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BookmarkFormData>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      url: initialUrl,
      title: initialTitle,
      description: '',
      tagInput: '',
    },
  });

  const tagInput = watch('tagInput');

  const addTag = () => {
    if (tagInput && tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setValue('tagInput', '');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = (data: BookmarkFormData) => {
    if (!user) {
      toast.error('You must be logged in to create bookmarks');
      return;
    }

    createBookmark(
      {
        url: data.url,
        title: data.title || undefined,
        description: data.description,
        tags,
      },
      {
        onSuccess: () => {
          toast.success('Bookmark created successfully!');
          reset();
          setTags([]);
          onSuccess?.();
        },
        onError: (error) => {
          console.error('Failed to create bookmark:', error);
          toast.error('Failed to create bookmark. Please try again.');
        },
      }
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to create bookmarks.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Bookmark</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              {...register('url')}
              disabled={isPending}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Optional title for the bookmark"
              {...register('title')}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what this bookmark is about..."
              rows={3}
              {...register('description')}
              disabled={isPending}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagInput">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                placeholder="Add a tag and press Enter"
                {...register('tagInput')}
                onKeyPress={handleKeyPress}
                disabled={isPending}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
                disabled={!tagInput?.trim() || isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                      disabled={isPending}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Bookmark...
              </>
            ) : (
              'Create Bookmark'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}