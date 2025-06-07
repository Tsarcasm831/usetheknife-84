
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface DevLogImageGeneratorProps {
  title: string;
  excerpt: string;
  onImageGenerated: (imageUrl: string) => void;
}

const DevLogImageGenerator: React.FC<DevLogImageGeneratorProps> = ({
  title,
  excerpt,
  onImageGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateImage = async () => {
    if (!title.trim() || !excerpt.trim()) {
      toast.error('Please provide both title and excerpt before generating an image');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-devlog-image', {
        body: { title, excerpt }
      });

      if (error) {
        console.error('Error generating image:', error);
        toast.error('Failed to generate image. Please try again.');
        return;
      }

      if (data?.image) {
        onImageGenerated(data.image);
        toast.success('AI image generated successfully!');
      }
    } catch (error) {
      console.error('Error calling image generation function:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateImage}
      disabled={isGenerating || !title.trim() || !excerpt.trim()}
      className="w-full bg-game-orange hover:bg-game-orange-light text-white"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Generating AI Image...
        </>
      ) : (
        <>
          <Wand2 className="w-4 h-4 mr-2" />
          Generate AI Image
        </>
      )}
    </Button>
  );
};

export default DevLogImageGenerator;
