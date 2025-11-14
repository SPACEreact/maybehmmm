
import React, { useState, useEffect } from 'react';
import type { Shot, Story } from '../types';
import { CopyIcon, CameraIcon, VideoCameraIcon, MagicIcon } from './Icon';
import { makePromptCinematic } from '../services/geminiService';

interface PromptViewerProps {
  shots: Shot[];
  story: Story;
  onBack: () => void;
  directorInstructions?: string;
}

type PromptType = 'image' | 'video';

const sanitizeSegment = (segment: string) => segment
  .replace(/\s+/g, ' ')
  .replace(/[\s,;]+$/g, '')
  .trim();

const buildPrompt = (segments: Array<string | null | undefined | false>) => {
  const cleaned = segments
    .map(segment => (segment ? sanitizeSegment(segment) : null))
    .filter((segment): segment is string => Boolean(segment));

  const unique = cleaned.filter((segment, index) => cleaned.indexOf(segment) === index);
  if (unique.length === 0) {
    return '';
  }

  const prompt = unique.join('. ');
  return prompt.endsWith('.') ? prompt : `${prompt}.`;
};

const generateImagePrompt = (story: Story, shot: Shot, directorInstructions?: string): string => {
  const characterDetails = story.characters.length > 0
    ? story.characters.map(c => `${c.name} (${c.description})`).join(', ')
    : '';

  return buildPrompt([
    shot.description,
    shot.characterBlocking && `Character blocking focuses on ${shot.characterBlocking}`,
    characterDetails && `Featuring ${characterDetails}`,
    story.setting.name && `Set in ${story.setting.name}, ${story.setting.description}`,
    shot.shotType && `Framed as a ${shot.shotType.toLowerCase()}`,
    shot.cameraAngle && `Captured from a ${shot.cameraAngle.toLowerCase()} perspective`,
    shot.focalLength && `Shot on a ${shot.focalLength} lens`,
    shot.aperture && `Aperture set to ${shot.aperture.toLowerCase()}`,
    shot.cameraMovement && shot.cameraMovement !== "Static" && `Subtle sense of ${shot.cameraMovement.toLowerCase()} energy`,
    shot.lightingStyle && `${shot.lightingStyle} lighting creates the mood`,
    shot.colorGrade && `Color grade leans toward ${shot.colorGrade.toLowerCase()}`,
    shot.composition && `Composition follows the ${shot.composition.toLowerCase()}`,
    directorInstructions && `Incorporate the director's notes: ${directorInstructions}`,
    'Rendered as a cinematic still photograph with professional lighting, exquisite texture, and 8k clarity'
  ]);
};

const generateVideoPrompt = (story: Story, shot: Shot, directorInstructions?: string): string => {
  const hasMovement = shot.cameraMovement && shot.cameraMovement !== "Static";
  const characterNames = story.characters.length > 0
    ? story.characters.map(c => c.name).join(' and ')
    : '';

  return buildPrompt([
    hasMovement
      ? `${shot.cameraMovement?.toLowerCase()} camera move tracking ${shot.description}`
      : `${shot.shotType ? shot.shotType.toLowerCase() : 'cinematic'} shot capturing ${shot.description}`,
    shot.characterBlocking && `Character blocking emphasizes ${shot.characterBlocking}`,
    characterNames && `Featuring ${characterNames}`,
    story.setting.name && `Located in ${story.setting.name}, ${story.setting.description}`,
    shot.cameraAngle && `Filmed from a ${shot.cameraAngle.toLowerCase()} angle`,
    shot.lightingStyle && `${shot.lightingStyle.toLowerCase()} lighting defines the atmosphere`,
    shot.colorGrade && `Finished with a ${shot.colorGrade.toLowerCase()} color grade`,
    shot.focalLength && `Captured using a ${shot.focalLength} lens`,
    directorInstructions && `Honor the director's notes: ${directorInstructions}`,
    'Deliver as cinematic motion footage in 4K with dynamic action and refined film grain'
  ]);
};

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const PromptCard: React.FC<{ prompt: string, index: number, onMakeCinematic: (index: number) => void; isEnhancing: boolean }> = ({ prompt, index, onMakeCinematic, isEnhancing }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
    };

    useEffect(() => {
        if(copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    return (
        <div className="bg-gray-900/50 p-5 rounded-lg transition-all duration-300">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-lg text-indigo-300">Prompt #{index + 1}</h4>
                <div className="flex items-center gap-2">
                    <button onClick={() => onMakeCinematic(index)} disabled={isEnhancing} className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-md transition-all ${isEnhancing ? 'bg-purple-500/50 text-white cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                       {isEnhancing ? <LoadingSpinner /> : <MagicIcon />} {isEnhancing ? 'Enhancing...' : 'Make Cinematic'}
                    </button>
                    <button onClick={handleCopy} className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-md transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                       <CopyIcon /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
            <p className="text-gray-300 leading-relaxed font-mono text-sm">{prompt}</p>
        </div>
    );
}

const PromptViewer: React.FC<PromptViewerProps> = ({ shots, story, onBack, directorInstructions }) => {
  const [activeTab, setActiveTab] = useState<PromptType>('image');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState<number | null>(null);

  useEffect(() => {
    const generate = () => {
        const generator = activeTab === 'image' ? generateImagePrompt : generateVideoPrompt;
        setPrompts(shots.map(shot => generator(story, shot, directorInstructions)));
    };
    generate();
  }, [shots, story, activeTab, directorInstructions]);

  const handleMakeCinematic = async (index: number) => {
    setIsEnhancing(index);
    try {
        const enhancedPrompt = await makePromptCinematic(prompts[index]);
        const newPrompts = [...prompts];
        newPrompts[index] = enhancedPrompt;
        setPrompts(newPrompts);
    } catch (error) {
        console.error("Failed to make prompt cinematic:", error);
        alert("There was an error enhancing your prompt. Please try again.");
    } finally {
        setIsEnhancing(null);
    }
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Your Generated Prompts</h2>
        <p className="text-gray-400">Here are the final prompts based on your story and scene design. Choose a tab and copy the prompts, or use the magic wand to make them even more cinematic.</p>
      </div>

      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('image')}
            className={`${
              activeTab === 'image'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            } flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <CameraIcon /> Image Prompts
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`${
              activeTab === 'video'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
            } flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <VideoCameraIcon /> Video Prompts
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {prompts.map((prompt, index) => (
          <PromptCard 
            key={`${shots[index].id}-${activeTab}-${index}`} 
            prompt={prompt} 
            index={index} 
            onMakeCinematic={handleMakeCinematic}
            isEnhancing={isEnhancing === index}
          />
        ))}
      </div>

      <div className="flex justify-start pt-8 mt-4 border-t border-gray-700">
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
          &larr; Back to Scene
        </button>
      </div>
    </div>
  );
};

export default PromptViewer;
