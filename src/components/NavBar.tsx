
import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { mockNavItems } from '@/lib/data';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavBarProps {
  user?: User;
}

const NavBar: React.FC<NavBarProps> = ({ user }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-game-darker/90 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-6'
      )}
    >
      <div className="game-container flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold tracking-wider text-game-orange text-glow">
            REMNANTS
            <span className="text-white ml-2">DEVLOG</span>
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          {mockNavItems.map((item) => (
            <a 
              key={item.title} 
              href={item.href}
              className="nav-link"
            >
              {item.title}
            </a>
          ))}
          <Button variant="ghost" size="icon" className="ml-2">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        
        {/* User Menu / Login */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-game-orange">{user.username}</span>
              <div className="h-8 w-8 rounded-full bg-game-gray overflow-hidden">
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : (
            <Button className="btn-primary">
              Login
            </Button>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-game-dark/95 backdrop-blur-lg">
          <div className="game-container py-4 flex flex-col space-y-4">
            {mockNavItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="block py-2 text-lg"
                onClick={() => setMenuOpen(false)}
              >
                {item.title}
              </a>
            ))}
            {user ? (
              <div className="flex items-center space-x-3 py-3 border-t border-white/10">
                <div className="h-8 w-8 rounded-full bg-game-gray overflow-hidden">
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm text-game-orange">{user.username}</span>
              </div>
            ) : (
              <div className="py-3 border-t border-white/10">
                <Button className="btn-primary w-full">
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
