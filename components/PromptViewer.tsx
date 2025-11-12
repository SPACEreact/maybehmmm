import React, { useState, useEffect } from 'react';
import type { Shot, Story } from '../types';
import { CopyIcon, CameraIcon, VideoCameraIcon } from './Icon';

interface PromptViewerProps {
  shots: Shot[];
  story: Story;
  onBack: () => void;
}

type PromptType = 'image' | 'video';

const generateImagePrompt = (story: Story, shot: Shot): string => {
  const parts = [];
  parts.push(shot.description);
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

const PromptCard: React.FC<{ prompt: string, index: number }> = ({ prompt, index }) => {
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
        <div className="bg-gray-900/50 p-5 rounded-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-lg text-indigo-300">Prompt #{index + 1}</h4>
                <button onClick={handleCopy} className={`flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-md transition-all ${copied ? 'bg-green-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                   <CopyIcon /> {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <p className="text-gray-300 leading-relaxed font-mono text-sm">{prompt}</p>
        </div>
    );
}

const PromptViewer: React.FC<PromptViewerProps> = ({ shots, story, onBack }) => {
  const [activeTab, setActiveTab] = useState<PromptType>('image');

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Your Generated Prompts</h2>
        <p className="text-gray-400">Here are the final prompts based on your story and scene design. Choose a tab and copy the prompts for your favorite AI generator.</p>
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
        {activeTab === 'image' && shots.map((shot, index) => (
          <PromptCard key={`${shot.id}-image`} prompt={generateImagePrompt(story, shot)} index={index} />
        ))}
         {activeTab === 'video' && shots.map((shot, index) => (
          <PromptCard key={`${shot.id}-video`} prompt={generateVideoPrompt(story, shot)} index={index} />
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