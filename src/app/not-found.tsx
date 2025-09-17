'use client';

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mountain, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";

const NotFound = () => {
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      window.location.pathname
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <div className="mb-8">
              <Mountain className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-6xl font-montserrat font-bold text-foreground mb-4">
                404
              </h1>
              <h2 className="text-2xl font-montserrat font-semibold text-foreground mb-4">
                Adventure Not Found
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Looks like this path doesn't lead to any adventures. 
                Let's get you back on track to explore amazing destinations!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="btn-hero group">
                  Back to Home
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="btn-outline">
                  Browse Adventures
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;