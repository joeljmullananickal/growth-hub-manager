import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import abstractBg from '@/assets/abstract-bg.jpg';

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else if (isSignUp) {
        toast({
          title: "Success",
          description: "Please check your email for verification link",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative font-inter animate-fade-in py-12 px-4" style={{ backgroundImage: `url(${abstractBg})` }}>
      {/* Video background placeholder - replace with your MP4 */}
      {/* <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
      >
        <source src="/path-to-your-video.mp4" type="video/mp4" />
      </video> */}
      <div className="absolute inset-0 bg-gradient-accent pointer-events-none animate-morphing opacity-70"></div>
      <div className="relative z-20 w-full max-w-md mx-auto">
        <Card className="w-full max-w-md rounded-xl shadow-soft transition-transform duration-200 hover:scale-105 hover:shadow-lg p-8 glass relative z-30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Growth Hub Manager</CardTitle>
            <CardDescription>
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary relative z-40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="rounded-xl transition-all duration-200 focus:ring-2 focus:ring-primary relative z-40"
                />
              </div>
              <Button
                type="submit"
                variant="gradient"
                className="w-full rounded-xl transition-transform duration-150 hover:scale-105 hover:shadow-lg"
                disabled={loading}
              >
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}