import { Layout } from '@/components/Layout';
import { BookmarkForm } from '@/components/BookmarkForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

const AddBookmark = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get('url') || '';
  const initialTitle = searchParams.get('title') || '';

  const handleSuccess = () => {
    navigate('/my-bookmarks');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Plus className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Add New Bookmark</h1>
          </div>
          <p className="text-muted-foreground">
            Save a new bookmark to your Nostr collection
          </p>
        </div>

        <BookmarkForm onSuccess={handleSuccess} initialUrl={initialUrl} initialTitle={initialTitle} />
      </div>
    </Layout>
  );
};

export default AddBookmark;