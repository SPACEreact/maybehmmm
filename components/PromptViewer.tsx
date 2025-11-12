
import React, { useState, useEffect } from 'react';
import type { Shot, Story } from '../types';
import { CopyIcon, CameraIcon, VideoCameraIcon, MagicIcon } from './Icon';
import { makePromptCinematic } from '../services/geminiService';

interface PromptViewerProps {
  shots: Shot[];
  story: Story;
  onBack: () => void;
}

type PromptType = 'image' | 'video';

const generateImagePrompt = (story: Story, shot: Shot): string => {
  const parts = [];
  parts.push(shot.description);
  if (shot.characterBlocking) {
    parts.push(`Character blocking: ${shot.characterBlocking}.`);
  }
  if (story.characters.length > 0) {
    const characterNames = story.characters.map(c => `${c.name} (${c.description})`).join(', ');
    parts.push(`featuring ${characterNames}.`);
  }
  if (story.setting.name) {
    parts.push(`The scene is set in ${story.setting.name}, ${story.setting.description}.`);
  }
  if (shot.shotType) parts.push(shot.shotType);
  if (shot.cameraAngle) parts.push(`${shot.cameraAngle} angle`);
  if (shot.focalLength) parts.push(`shot on a ${shot.focalLength} lens`);
  if (shot.aperture) parts.push(`with an aperture of ${shot.aperture} creating ${shot.aperture.includes('Shallow') ? 'a blurry background' : 'a sharp, deep focus'}.`);
  if (shot.cameraMovement && shot.cameraMovement !== "Static") parts.push(`The camera movement is a ${shot.cameraMovement.toLowerCase()}.`);
  if (shot.lightingStyle) parts.push(`Lighting is ${shot.lightingStyle.toLowerCase()}.`);
  if (shot.colorGrade) parts.push(`The color grade is ${shot.colorGrade}.`);
  if (shot.composition) parts.push(`Composition follows the ${shot.composition}.`);
  parts.push('cinematic still, professional photograph, high detail, 8k.');
  return parts.filter(p => p).join(', ');
};

const generateVideoPrompt = (story: Story, shot: Shot): string => {
  const parts = [];
  const movement = shot.cameraMovement && shot.cameraMovement !== "Static" 
    ? `${shot.cameraMovement} shot` 
    : shot.shotType;
  parts.push(`Video: ${movement} of ${shot.description}`);
   if (shot.characterBlocking) {
    parts.push(`Character blocking: ${shot.characterBlocking}.`);
  }
  if (story.characters.length > 0) {
    const characterNames = story.characters.map(c => c.name).join(' and ');
    parts.push(`with ${characterNames}`);
  }
  if (story.setting.name) {
    parts.push(`in the setting of ${story.setting.name}`);
  }
  if (shot.cameraAngle) parts.push(`from a ${shot.cameraAngle.toLowerCase()}`);
  if (shot.lightingStyle) parts.push(`${shot.lightingStyle.toLowerCase()} lighting`);
  if (shot.colorGrade) parts.push(`with a ${shot.colorGrade.toLowerCase()} color grade`);
  if (shot.focalLength) parts.push(`using a ${shot.focalLength} lens`);
  parts.push('cinematic video, motion picture, dynamic action, 4k, hyper detailed, film grain.');
  return parts.filter(p => p).join(', ');
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

const PromptViewer: React.FC<PromptViewerProps> = ({ shots, story, onBack }) => {
  const [activeTab, setActiveTab] = useState<PromptType>('image');
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState<number | null>(null);

  useEffect(() => {
    const generate = () => {
        const generator = activeTab === 'image' ? generateImagePrompt : generateVideoPrompt;
        setPrompts(shots.map(shot => generator(story, shot)));
    };
    generate();
  }, [shots, story, activeTab]);

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