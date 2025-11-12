
import React from 'react';
import { SparklesIcon, DocumentTextIcon } from './Icon';

interface StartScreenProps {
  onSelectCreator: () => void;
  onSelectScript: () => void;
  isPastelMode: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onSelectCreator, onSelectScript, isPastelMode }) => {
  
  const cardBaseClasses = "p-8 rounded-2xl shadow-lg border transition-all duration-300 transform hover:-translate-y-1 group";
  const darkCardClasses = "bg-gray-800 hover:shadow-indigo-500/30 border-gray-700 hover:border-indigo-500";
  const pastelCardClasses = "bg-pink-100/50 hover:shadow-pink-500/30 border-pink-200 hover:border-pink-400";

  const iconContainerBase = "flex items-center justify-center h-16 w-16 rounded-full mx-auto mb-4 group-hover:scale-110 transition-transform";
  const darkIconContainer = "bg-indigo-500/20 text-indigo-300";
  const darkIconContainer2 = "bg-purple-500/20 text-purple-300";
  const pastelIconContainer = "bg-pink-500/20 text-pink-500";
  
  const titleClasses = `text-xl font-bold mb-2 ${isPastelMode ? 'text-pink-800' : 'text-white'}`;
  const textClasses = `${isPastelMode ? 'text-pink-700' : 'text-gray-400'}`;


  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in text-center min-h-[50vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mt-12">
        {/* Creator Mode */}
        <button 
          onClick={onSelectCreator} 
          className={`${cardBaseClasses} ${isPastelMode ? pastelCardClasses : darkCardClasses}`}
        >
          <div className={`${iconContainerBase} ${isPastelMode ? pastelIconContainer : darkIconContainer}`}>
            <SparklesIcon />
          </div>
          <h3 className={titleClasses}>Build from Scratch</h3>
          <p className={textClasses}>The original step-by-step process. Define your story, characters, and setting, then craft each shot manually.</p>
        </button>

        {/* Script Mode */}
        <button 
          onClick={onSelectScript} 
          className={`${cardBaseClasses} ${isPastelMode ? pastelCardClasses : 'bg-gray-800 hover:shadow-purple-500/30 border-gray-700 hover:border-purple-500'}`}
        >
          <div className={`${iconContainerBase} ${isPastelMode ? pastelIconContainer : darkIconContainer2}`}>
            <DocumentTextIcon />
          </div>
          <h3 className={titleClasses}>Generate from Script</h3>
          <p className={textClasses}>Paste your script and get an AI-generated, reel-optimized shot list in seconds. Perfect for fast-paced content.</p>
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
