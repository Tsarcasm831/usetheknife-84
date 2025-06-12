
import React, { useState } from 'react';
import DevLogCard from './DevLogCard';
import DevLogForm from './DevLogForm';
import { DevLogEntry } from '@/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface DevLogSectionProps {
  devlogs: DevLogEntry[];
}

const DevLogSection: React.FC<DevLogSectionProps> = ({ devlogs: initialDevlogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [devlogs, setDevlogs] = useState(initialDevlogs);
  
  // Extract all unique tags
  const allTags = Array.from(
    new Set(devlogs.flatMap(devlog => devlog.tags))
  );
  
  // Filter devlogs based on search and selected tag
  const filteredDevlogs = devlogs.filter(devlog => {
    const matchesSearch = searchQuery.trim() === '' || 
      devlog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      devlog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === null || devlog.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const handleAddDevLog = (newEntry: Omit<DevLogEntry, 'id' | 'date'>) => {
    const entry: DevLogEntry = {
      ...newEntry,
      id: `devlog-${crypto.randomUUID()}`,
      date: new Date().toISOString()
    };
    
    setDevlogs([entry, ...devlogs]);
    setShowForm(false);
    toast.success('DevLog entry added successfully!');
  };
  
  return (
    <section id="devlog" className="py-20 bg-game-dark">
      <div className="game-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              Development <span className="text-game-orange">Log</span>
            </h2>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-game-orange hover:bg-game-orange-light text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </div>

          {showForm && (
            <div className="mb-8">
              <DevLogForm
                onSubmit={handleAddDevLog}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search devlogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-game-gray/50 border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-game-orange/50 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className={`rounded-full ${selectedTag === null ? 'bg-game-orange text-white' : 'hover:text-game-orange'}`}
                onClick={() => setSelectedTag(null)}
              >
                All
              </Button>
              
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant="ghost"
                  size="sm"
                  className={`rounded-full ${selectedTag === tag ? 'bg-game-orange text-white' : 'hover:text-game-orange'}`}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDevlogs.length > 0 ? (
            filteredDevlogs.map((devlog, index) => (
              <DevLogCard key={devlog.id} devlog={devlog} index={index} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-gray-400">No devlogs found matching your criteria.</p>
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <Button className="btn-secondary">
            Load More Updates
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DevLogSection;
