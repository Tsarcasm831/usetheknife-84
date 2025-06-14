
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DevLogImageGenerator from './DevLogImageGenerator';
import { DevLogEntry } from '@/types';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface DevLogFormProps {
  onSubmit: (entry: Omit<DevLogEntry, 'id' | 'date'>) => void;
  onCancel?: () => void;
}

const DevLogForm: React.FC<DevLogFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !excerpt.trim() || !content.trim() || !author.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const defaultImage = `https://robohash.org/${encodeURIComponent(`${title.trim()} ${excerpt.trim()}`)}?size=640x360`;

    onSubmit({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: author.trim(),
      tags,
      imageUrl: imageUrl || defaultImage,
      featured
    });

    // Reset form
    setTitle('');
    setExcerpt('');
    setContent('');
    setAuthor('');
    setTags([]);
    setImageUrl('');
    setFeatured(false);
  };

  const handleImageGenerated = (generatedImageUrl: string) => {
    setImageUrl(generatedImageUrl);
  };

  return (
    <Card className="p-6 bg-game-gray/20 border-white/10">
      <h3 className="text-xl font-bold mb-4 text-game-orange">Add New DevLog Entry</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter devlog title"
            className="bg-game-gray/50 border-white/10 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Excerpt *
          </label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief description of the update"
            className="bg-game-gray/50 border-white/10 text-white"
            rows={2}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Content *
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Full content of the devlog entry"
            className="bg-game-gray/50 border-white/10 text-white"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Author *
          </label>
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
            className="bg-game-gray/50 border-white/10 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className="bg-game-gray/50 border-white/10 text-white flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 bg-game-orange/20 text-game-orange rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-orange focus-visible:ring-offset-2 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Image URL
          </label>
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image URL (optional - will use AI generated image if empty)"
            className="bg-game-gray/50 border-white/10 text-white mb-2"
          />
          <DevLogImageGenerator
            title={title}
            excerpt={excerpt}
            onImageGenerated={handleImageGenerated}
          />
        </div>

        {imageUrl && (
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Preview
            </label>
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-md border border-white/10"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="featured" className="text-sm text-white">
            Featured post
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="bg-game-orange hover:bg-game-orange-light text-white"
          >
            Add DevLog Entry
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default DevLogForm;
