
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const HeroSection: React.FC = () => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <section className="relative min-h-screen flex items-center bg-hero-pattern bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-t from-game-darker via-transparent to-transparent" />
      
      <div className="game-container relative z-10 pt-24 pb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className={cn(
            'transition-all duration-1000 transform',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
              <span className="block text-game-orange animate-glow">REMNANTS OF</span>
              <span className="block">DESTRUCTION</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg">
              Follow the development journey of our post-apocalyptic action RPG. 
              Discover the latest updates, design insights, and behind-the-scenes content.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild className="btn-primary">
                <Link to="/devlog">Latest Updates</Link>
              </Button>
              <Button
                variant="outline"
                className="border-game-orange text-game-orange hover:bg-game-orange hover:text-white transition-colors group"
              >
                <span className="block group-hover:hidden">ROD Intro Video</span>
                <span className="hidden group-hover:block">Coming Soon</span>
              </Button>
            </div>
          </div>
          
          <div className={cn(
            'transition-all duration-1000 delay-300 transform',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-game-orange rounded-lg blur opacity-30 animate-pulse-slow"></div>
              <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-game-orange/20 animate-float">
                <img 
                  src="/lovable-uploads/7db9e57a-96e2-431c-aeca-429aef63288a.png" 
                  alt="Remnants of Destruction"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-1">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
