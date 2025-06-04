import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">404</h1>
              <h2 className="text-xl font-semibold">Page Not Found</h2>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
            <Button asChild>
              <Link to="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Return to Home</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NotFound;
