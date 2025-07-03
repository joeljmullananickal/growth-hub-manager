import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-inter animate-fade-in">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page Not Found</p>
      <a
        href="/"
        className="rounded-xl px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold transition-transform duration-150 hover:scale-105 hover:shadow-lg"
      >
        Go Home
      </a>
    </div>
  );
};

export default NotFound;
