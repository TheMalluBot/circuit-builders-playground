
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <Zap className="w-16 h-16 text-primary mx-auto mb-6" />
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! The circuit connection is broken.
          We couldn't find the page you're looking for.
        </p>
        <Button size="lg" asChild>
          <Link to="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
