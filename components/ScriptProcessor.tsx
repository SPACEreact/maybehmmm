
import React, { useState } from 'react';
import type { Story, Shot } from '../types';
import { generateShotsFromScript } from '../services/geminiService';
import { FilmIcon } from './Icon';

interface ScriptProcessorProps {
  onProcessComplete: (story: Pick<Story, 'title' | 'logline'>, shots: Shot[], directorInstructions: string) => void;
}

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const ScriptProcessor: React.FC<ScriptProcessorProps> = ({ onProcessComplete }) => {
  const [script, setScript] = useState('');
  const [directorInstructions, setDirectorInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!script.trim()) {
      alert("Please paste your script before generating.");
      return;
    }
    setIsLoading(true);
    try {
      const { story, shots } = await generateShotsFromScript(script, directorInstructions);
      onProcessComplete(story, shots, directorInstructions);
    } catch (error) {
      console.error("Failed to process script:", error);
      alert("There was an error processing your script. Please check your API key and try again.");
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-8 animate-fade-in">
            <div className="w-16 h-16 text-purple-400">
                <FilmIcon />
            </div>
            <h3 className="text-3xl font-bold mt-6">Directing Your Reel...</h3>
            <p className="text-gray-400 mt-3 max-w-md">Our AI Director is analyzing your script, breaking it down into an engaging, fast-paced shot list.</p>
            <div className="mt-8">
                <LoadingSpinner />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8 animate-fade-in min-h-[50vh]">
      <h2 className="text-3xl font-bold text-gray-100 mb-4">From Script to Screen</h2>
      <p className="text-gray-400 mb-8 max-w-xl text-center">Paste your script below. Our AI director will analyze the content and generate a cinematic shot list optimized for an engaging Instagram Reel.</p>

      <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-2xl p-6">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="[SCENE START]

INT. COFFEE SHOP - DAY

JANE (30s) nervously stirs her coffee. ACROSS from her, MARK (30s) looks at his phone, oblivious.

JANE
(quietly)
We need to talk.

Mark looks up, annoyed.

MARK
About what?

[SCENE END]"
          className="w-full h-64 p-4 bg-gray-900/50 rounded-lg text-gray-300 font-mono text-sm border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        />
        <div className="mt-6">
            <label htmlFor="director-instructions" className="block text-sm font-medium text-gray-300 mb-2">Director's Instructions (Optional)</label>
            <textarea
              id="director-instructions"
              value={directorInstructions}
              onChange={(e) => setDirectorInstructions(e.target.value)}
              placeholder="e.g., 'Focus on extreme close-ups for emotional impact.' 'Use a lot of handheld camera work to create a sense of urgency.' 'The color palette should be cold and desaturated.'"
              className="w-full h-24 p-4 bg-gray-900/50 rounded-lg text-gray-300 font-mono text-sm border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <LoadingSpinner /> : <FilmIcon />}
          Generate Cinematic Reel
        </button>
      </div>
    </div>
  );
};

export default ScriptProcessor;
