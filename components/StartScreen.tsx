
import React from 'react';
import { SparklesIcon, DocumentTextIcon } from './Icon';

interface StartScreenProps {
  onSelectCreator: () => void;
  onSelectScript: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onSelectCreator, onSelectScript }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in text-center min-h-[50vh]">
      <h2 className="text-3xl font-bold text-gray-100 mb-4">How do you want to start?</h2>
      <p className="text-gray-400 mb-10 max-w-lg">Choose your creative path. Build a story from the ground up with full control, or let AI instantly generate a shot list from your script.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        {/* Creator Mode */}
        <button 
          onClick={onSelectCreator} 
          className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-indigo-500/30 border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/20 text-indigo-300 mx-auto mb-4 group-hover:scale-110 transition-transform">
            <SparklesIcon />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Build from Scratch</h3>
          <p className="text-gray-400">The original step-by-step process. Define your story, characters, and setting, then craft each shot manually.</p>
        </button>

        {/* Script Mode */}
        <button 
          onClick={onSelectScript} 
          className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-purple-500/30 border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-500/20 text-purple-300 mx-auto mb-4 group-hover:scale-110 transition-transform">
            <DocumentTextIcon />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Generate from Script</h3>
          <p className="text-gray-400">Paste your script and get an AI-generated, reel-optimized shot list in seconds. Perfect for fast-paced content.</p>
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
