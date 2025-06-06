
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface UserSectionProps {
  user: any;
}

const UserSection: React.FC<UserSectionProps> = ({ user }) => {
  const { signOut } = useAuth();
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Your comment received 5 likes", read: true },
    { id: 2, text: "New game update available", read: false }
  ]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <div className="relative">
        <Button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="rounded-full h-12 w-12 bg-game-gray hover:bg-game-gray-light relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-game-orange rounded-full text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
        
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-72 bg-game-dark border border-white/10 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-4 bg-game-gray/50 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img 
                    src={user.avatar_url} 
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link to="/profile" className="text-gray-400 hover:text-white">
                  <Settings className="h-4 w-4" />
                </Link>
                <button onClick={signOut} className="text-gray-400 hover:text-white">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="px-2 py-1 bg-game-gray/30 border-b border-white/10">
              <p className="text-xs font-medium">Notifications</p>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${notification.read ? 'opacity-60' : 'bg-game-gray/20'}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <p className="text-sm">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-400">
                  No notifications
                </div>
              )}
            </div>
            
            <div className="p-2 border-t border-white/10">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default UserSection;
