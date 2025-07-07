import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Star, Zap, Shield, Smartphone, Globe, Users } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import sectionBg from '@/assets/section-bg.jpg';
import techIcons from '@/assets/tech-icons.jpg';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // Parallax effect for background
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const hero = document.getElementById('hero');
      if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Experience blazing fast performance with our optimized architecture"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile First",
      description: "Perfectly responsive design that looks amazing on all devices"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Worldwide CDN for optimal performance anywhere"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Built for teams with advanced collaboration tools"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Premium Support",
      description: "24/7 dedicated support from our expert team"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart",
      content: "This platform transformed our workflow completely. The design is stunning and functionality is top-notch.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Designer, Creative Studio",
      content: "Beautiful aesthetics combined with powerful features. Exactly what we needed for our projects.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Product Manager",
      content: "The user experience is phenomenal. Our team productivity increased by 300% since we started using this.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section 
        id="hero"
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-hero"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-primary/10 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-accent/10 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 rounded-full bg-primary/20 animate-float" style={{ animationDelay: '4s' }}></div>

        <div className={`relative z-10 text-center px-6 max-w-6xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Glassmorphism hero card */}
          <div className="glass rounded-3xl p-12 mb-8">
            <h1 className="font-playfair text-6xl md:text-8xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Experience the Future
            </h1>
            <p className="font-poppins text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover a revolutionary platform that combines stunning aesthetics with powerful functionality. 
              Built for modern teams who demand excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-full hover-glow font-montserrat font-semibold"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="glass border-primary/30 hover:border-primary hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-full font-montserrat font-semibold"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { number: "10M+", label: "Happy Users" },
              { number: "99.9%", label: "Uptime" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`glass rounded-2xl p-6 hover-lift ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="font-montserrat text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="font-poppins text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${sectionBg})` }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-5xl font-bold mb-6 text-foreground">
              Powerful Features
            </h2>
            <p className="font-poppins text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to build, scale, and succeed. Our comprehensive suite of tools 
              empowers teams to achieve extraordinary results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`glass hover-lift group cursor-pointer border-0 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="font-montserrat text-xl font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-poppins text-center text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-5xl font-bold mb-6 text-foreground">
              What Our Users Say
            </h2>
            <p className="font-poppins text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of satisfied customers who have transformed their workflows with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className={`glass hover-lift ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="font-poppins text-foreground leading-relaxed text-lg">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-montserrat font-semibold text-foreground">{testimonial.name}</div>
                  <div className="font-poppins text-muted-foreground text-sm">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${techIcons})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-primary opacity-90"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <div className="glass rounded-3xl p-12">
            <h2 className="font-playfair text-5xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="font-poppins text-xl text-white/90 mb-8 leading-relaxed">
              Join millions of users who have already transformed their workflow. 
              Start your free trial today and experience the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-full font-montserrat font-semibold"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white hover:scale-105 transition-all duration-300 text-lg px-8 py-4 rounded-full font-montserrat font-semibold"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="glass rounded-2xl p-8">
            <h3 className="font-playfair text-3xl font-bold mb-4 text-foreground">
              Thank you for choosing us
            </h3>
            <p className="font-poppins text-muted-foreground mb-6">
              Experience the future of digital excellence with our modern, aesthetic platform.
            </p>
            <div className="flex justify-center space-x-6">
              <Button variant="ghost" className="font-poppins">Privacy</Button>
              <Button variant="ghost" className="font-poppins">Terms</Button>
              <Button variant="ghost" className="font-poppins">Support</Button>
              <Button variant="ghost" className="font-poppins">Contact</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;