
import { DevLogEntry } from '@/types';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DevLogCardProps {
  devlog: DevLogEntry;
  index: number;
}

const DevLogCard: React.FC<DevLogCardProps> = ({ devlog, index }) => {
  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "glass-card rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-game-orange/10",
        devlog.featured ? "col-span-full md:grid md:grid-cols-5 md:gap-6" : ""
      )}
    >
      <div 
        className={cn(
          "relative h-48 md:h-60 overflow-hidden",
          devlog.featured ? "md:col-span-2 md:h-auto" : ""
        )}
      >
        <img 
          src={devlog.imageUrl} 
          alt={devlog.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex space-x-2">
            {devlog.tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs py-1 px-2 rounded-full bg-game-gray/80 text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className={cn(
        "p-6 flex flex-col",
        devlog.featured ? "md:col-span-3" : ""
      )}>
        <header className="mb-3">
          <h3 className="text-xl font-bold mb-2 text-game-orange">
            {devlog.title}
          </h3>
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>{devlog.author}</span>
            <time dateTime={devlog.date}>
              {formatDistanceToNow(new Date(devlog.date), { addSuffix: true })}
            </time>
          </div>
        </header>
        
        <p className="text-gray-300 mb-4 flex-grow">
          {devlog.excerpt}
        </p>
        
        <footer className="mt-auto flex items-center justify-between">
          <Button variant="ghost" className="text-game-orange hover:text-game-orange-light hover:bg-white/5">
            Read More
          </Button>
          
          {devlog.featured && (
            <span className="text-xs py-1 px-2 bg-game-orange/20 text-game-orange rounded-full">
              Featured
            </span>
          )}
        </footer>
      </div>
    </motion.article>
  );
};

export default DevLogCard;
