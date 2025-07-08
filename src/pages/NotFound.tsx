import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import abstractBg from '@/assets/abstract-bg.jpg';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative font-inter animate-fade-in py-12 px-4" style={{ backgroundImage: `url(${abstractBg})` }}>
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none"></div>
      <div className="relative z-10 w-full flex flex-col items-center justify-center max-w-xl mx-auto glass rounded-3xl p-10 shadow-2xl backdrop-blur-md">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page Not Found</p>
        <a
          href="/"
          className="rounded-xl px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold transition-transform duration-150 hover:scale-105 hover:shadow-lg"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
