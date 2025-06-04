import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Bookmark, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const Bookmarklet = () => {
  const bookmarkletCode = `javascript:(function(){
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open('${window.location.origin}/add?url=' + url + '&title=' + title, '_blank');
  })();`;

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    toast.success('Bookmarklet copied to clipboard!');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Code className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Bookmarklet</h1>
          </div>
          <p className="text-muted-foreground">
            Quick bookmark any page with a single click
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bookmark className="h-5 w-5 text-primary" />
                <span>Quick Bookmark</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Drag this button to your bookmarks bar for one-click bookmarking:
              </p>
              
              <div className="p-4 bg-muted rounded-lg">
                <a
                  href={bookmarkletCode}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  <Bookmark className="h-4 w-4" />
                  <span>📌 MKPinja</span>
                </a>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>How to use:</strong>
                </p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Drag the button above to your browser's bookmarks bar</li>
                  <li>Navigate to any webpage you want to bookmark</li>
                  <li>Click the "📌 MKPinja" bookmark</li>
                  <li>The bookmark form will open with the URL pre-filled</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-primary" />
                <span>Manual Setup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Alternatively, you can manually create a bookmark with this code:
              </p>
              
              <div className="space-y-2">
                <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                  {bookmarkletCode}
                </div>
                
                <Button onClick={copyBookmarklet} variant="outline" size="sm">
                  Copy Code
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Manual setup steps:</strong>
                </p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Copy the code above</li>
                  <li>Create a new bookmark in your browser</li>
                  <li>Set the name to "MKPinja"</li>
                  <li>Paste the code as the URL</li>
                  <li>Save the bookmark</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Browser Extension (Coming Soon)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We're working on a dedicated browser extension that will make bookmarking even easier. 
              It will include features like:
            </p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Right-click context menu for instant bookmarking</li>
              <li>Keyboard shortcuts</li>
              <li>Automatic tag suggestions</li>
              <li>Offline bookmark queue</li>
            </ul>
            <Button variant="outline" className="mt-4" disabled>
              <ExternalLink className="h-4 w-4 mr-2" />
              Download Extension (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Bookmarklet;