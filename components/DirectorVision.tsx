
import React from 'react';
import type { DirectorVision } from '../types';

interface DirectorVisionProps {
  vision: DirectorVision;
  setVision: React.Dispatch<React.SetStateAction<DirectorVision>>;
  onBack: () => void;
  onNext: () => void;
}

const DirectorVision: React.FC<DirectorVisionProps> = ({ vision, setVision, onBack, onNext }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVision({ ...vision, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Set Your Director's Vision</h2>
        <p className="text-gray-400">Define the cinematic language of your film. This will guide the AI in generating stylistically coherent shots.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-gray-300">Genre</label>
          <input type="text" name="genre" id="genre" value={vision.genre} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" placeholder="e.g., Sci-Fi Noir, Romantic Comedy"/>
        </div>
        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-300">Tone</label>
          <input type="text" name="tone" id="tone" value={vision.tone} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" placeholder="e.g., Gritty and tense, whimsical and lighthearted"/>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="colorPalette" className="block text-sm font-medium text-gray-300">Core Color Palette</label>
          <input type="text" name="colorPalette" id="colorPalette" value={vision.colorPalette} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" placeholder="e.g., Desaturated blues, vibrant neons, warm earth tones"/>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="inspirations" className="block text-sm font-medium text-gray-300">Cinematic Inspirations</label>
          <textarea name="inspirations" id="inspirations" value={vision.inspirations} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" placeholder="e.g., Inspired by the handheld realism of 'Children of Men' and the color palette of 'Blade Runner 2049'"></textarea>
        </div>
      </div>
      
      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">&larr; Back to Story</button>
        <button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
          Plan The Scene &rarr;
        </button>
      </div>
    </div>
  );
};

export default DirectorVision;
