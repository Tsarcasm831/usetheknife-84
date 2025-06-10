
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mockNavItems } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const NavBar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navItems = user ? mockNavItems : mockNavItems.filter(item => item.title !== "Game");

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
          <Link to="/" className="text-2xl font-bold tracking-wider text-game-orange text-glow">
            REMNANTS
            <span className="text-white ml-2">DEVLOG</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          {navItems.map((item) => (
            <Link
              key={item.title} 
              to={item.href}
              className="nav-link"
            >
              {item.title}
            </Link>
          ))}
          <Button variant="ghost" size="icon" className="ml-2">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        
        {/* User Menu / Login */}
        <div className="hidden md:flex items-center space-x-4">
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer group">
                  <span className="text-sm text-game-orange group-hover:text-white transition-colors">
                    {profile.username}
                  </span>
                  <Avatar className="h-8 w-8 ring-1 ring-white/10 group-hover:ring-game-orange transition-all">
                    <AvatarImage src={profile.avatar_url} alt={profile.username} />
                    <AvatarFallback className="bg-game-gray">
                      {profile.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-game-dark border-white/10 text-white">
                <DropdownMenuItem className="hover:bg-white/5" asChild>
                  <Link to="/profile" className="cursor-pointer w-full">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="btn-primary">
              <Link to="/auth">Login</Link>
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
            {navItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="block py-2 text-lg"
                onClick={() => setMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            {user && profile ? (
              <div className="flex flex-col space-y-3 py-3 border-t border-white/10">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url} alt={profile.username} />
                    <AvatarFallback className="bg-game-gray">
                      {profile.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-game-orange">{profile.username}</span>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center text-white py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <button 
                  className="flex items-center text-red-400 py-1" 
                  onClick={() => {
                    signOut();
                    setMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="py-3 border-t border-white/10">
                <Button asChild className="btn-primary w-full">
                  <Link to="/auth" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
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
