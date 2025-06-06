
import React from 'react';
import NavBar from '@/components/NavBar';
import HeroSection from '@/components/HeroSection';
import DevLogSection from '@/components/DevLogSection';
import UserSection from '@/components/UserSection';
import { mockDevLogs } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-game-darker text-white">
      <NavBar />
      <HeroSection />
      <DevLogSection devlogs={mockDevLogs} />
      
      {/* Footer section */}
      <footer className="bg-game-darker py-12 border-t border-white/10">
        <div className="game-container">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-game-orange mb-2">REMNANTS OF DESTRUCTION</h2>
              <p className="text-gray-400 max-w-md">
                A post-apocalyptic action RPG where you navigate the remnants of a world destroyed by supernatural forces.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="flex space-x-4 mb-4">
                <a href="#" className="hover:text-game-orange">Twitter</a>
                <a href="#" className="hover:text-game-orange">Discord</a>
                <a href="#" className="hover:text-game-orange">Steam</a>
                <a href="#" className="hover:text-game-orange">YouTube</a>
              </div>
              <p className="text-sm text-gray-500">© 2025 Remnants of Destruction. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Show user section only if logged in */}
      {user && profile && (
        <UserSection user={profile} />
      )}
    </div>
  );
};

export default Index;
