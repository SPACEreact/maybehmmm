
import React, { useState } from 'react';
import type { Story } from '../types';
import { PlusIcon, TrashIcon, MagicIcon, GoogleIcon } from './Icon';
import { getSuggestionForField, enrichWithSearch } from '../services/geminiService';

interface StoryBuilderProps {
  story: Story;
  setStory: React.Dispatch<React.SetStateAction<Story>>;
  onNext: () => void;
}

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const StoryBuilder: React.FC<StoryBuilderProps> = ({ story, setStory, onNext }) => {
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});

  const handleStoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStory({ ...story, [e.target.name]: e.target.value });
  };

  const handleCharacterChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newCharacters = [...story.characters];
    newCharacters[index] = { ...newCharacters[index], [e.target.name]: e.target.value };
    setStory({ ...story, characters: newCharacters });
  };
  
  const addCharacter = () => {
    setStory({ ...story, characters: [...story.characters, { name: '', description: '' }] });
  };
  
  const removeCharacter = (index: number) => {
    const newCharacters = story.characters.filter((_, i) => i !== index);
    setStory({ ...story, characters: newCharacters });
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStory({ ...story, setting: { ...story.setting, [e.target.name]: e.target.value } });
  };

  const handleSuggestion = async (key: string, field: 'logline' | 'character' | 'setting', index: number = -1) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    try {
      const suggestion = await getSuggestionForField(field, story);
      if (field === 'logline') {
        setStory(prev => ({ ...prev, logline: suggestion }));
      } else if (field === 'character' && index > -1) {
        const newCharacters = [...story.characters];
        newCharacters[index].description = suggestion;
        setStory(prev => ({...prev, characters: newCharacters}));
      } else if (field === 'setting') {
        setStory(prev => ({...prev, setting: {...prev.setting, description: suggestion}}));
      }
    } catch (error) {
      alert("Failed to get suggestion. Please check your API key.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleEnrichment = async (key: string, field: 'character' | 'setting', index: number = -1) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    try {
      let subject = '';
      let existingDesc = '';
      if(field === 'character' && index > -1) {
        subject = story.characters[index].name;
        existingDesc = story.characters[index].description;
      } else if (field === 'setting') {
        subject = story.setting.name;
        existingDesc = story.setting.description;
      }

      if(!subject) {
        alert(`Please provide a name for the ${field} to enrich it.`);
        setLoadingStates(prev => ({ ...prev, [key]: false }));
        return;
      }

      const enrichedText = await enrichWithSearch(subject, existingDesc);

      if (field === 'character' && index > -1) {
        const newCharacters = [...story.characters];
        newCharacters[index].description = enrichedText;
        setStory(prev => ({...prev, characters: newCharacters}));
      } else if (field === 'setting') {
        setStory(prev => ({...prev, setting: {...prev.setting, description: enrichedText}}));
      }
    } catch (error) {
      alert("Failed to enrich content. Please check your API key.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Define Your Story</h2>
        <p className="text-gray-400">Lay the foundation of your narrative. This context will inform every prompt you generate.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
          <input type="text" name="title" id="title" value={story.title} onChange={handleStoryChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white" placeholder="e.g., Echoes of Neon"/>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="logline" className="flex items-center justify-between text-sm font-medium text-gray-300">
            <span>Logline</span>
            <button onClick={() => handleSuggestion('logline', 'logline')} disabled={!story.title || loadingStates['logline']} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {loadingStates['logline'] ? <LoadingSpinner /> : <MagicIcon />} Suggest
            </button>
          </label>
          <textarea name="logline" id="logline" value={story.logline} onChange={handleStoryChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white" placeholder="A brief summary of your story..."></textarea>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Characters</h3>
        <div className="space-y-4">
          {story.characters.map((char, index) => (
            <div key={index} className="p-4 bg-gray-900/50 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-3">
                  <label htmlFor={`char-name-${index}`} className="block text-sm font-medium text-gray-300">Name</label>
                  <input type="text" name="name" id={`char-name-${index}`} value={char.name} onChange={(e) => handleCharacterChange(index, e)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md" placeholder="e.g., Alex"/>
              </div>
              <div className="md:col-span-8">
                  <label htmlFor={`char-desc-${index}`} className="flex items-center justify-between text-sm font-medium text-gray-300">
                    <span>Description</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEnrichment(`enrich_char_${index}`, 'character', index)} disabled={!char.name || loadingStates[`enrich_char_${index}`]} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loadingStates[`enrich_char_${index}`] ? <LoadingSpinner /> : <GoogleIcon />} Enrich
                      </button>
                      <button onClick={() => handleSuggestion(`suggest_char_${index}`, 'character', index)} disabled={!char.name || loadingStates[`suggest_char_${index}`]} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loadingStates[`suggest_char_${index}`] ? <LoadingSpinner /> : <MagicIcon />} Suggest
                      </button>
                    </div>
                  </label>
                  <input type="text" name="description" id={`char-desc-${index}`} value={char.description} onChange={(e) => handleCharacterChange(index, e)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md" placeholder="e.g., a rogue AI with a penchant for poetry"/>
              </div>
              <div className="md:col-span-1 flex justify-end">
                {story.characters.length > 1 && (
                    <button onClick={() => removeCharacter(index)} className="mt-6 p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <TrashIcon />
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button onClick={addCharacter} className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
          <PlusIcon /> Add Character
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Setting</h3>
        <div className="p-4 bg-gray-900/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
              <label htmlFor="setting-name" className="block text-sm font-medium text-gray-300">Name</label>
              <input type="text" name="name" id="setting-name" value={story.setting.name} onChange={handleSettingChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md" placeholder="e.g., Neo-Kyoto, 2088"/>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="setting-desc" className="flex items-center justify-between text-sm font-medium text-gray-300">
                <span>Description</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEnrichment('enrich_setting', 'setting')} disabled={!story.setting.name || loadingStates['enrich_setting']} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loadingStates['enrich_setting'] ? <LoadingSpinner /> : <GoogleIcon />} Enrich
                  </button>
                  <button onClick={() => handleSuggestion('suggest_setting', 'setting')} disabled={!story.setting.name || loadingStates['suggest_setting']} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loadingStates['suggest_setting'] ? <LoadingSpinner /> : <MagicIcon />} Suggest
                  </button>
                </div>
              </label>
              <textarea name="description" id="setting-desc" value={story.setting.description} onChange={handleSettingChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md" placeholder="e.g., a rain-slicked metropolis where tradition and technology clash"></textarea>
            </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button onClick={onNext} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
          Set Director's Vision &rarr;
        </button>
      </div>
    </div>
  );
};

export default StoryBuilder;