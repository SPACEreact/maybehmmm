
import React, { useState, useRef } from 'react';
import type { Shot, Story, DirectorVision } from '../types';
import { SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVEMENTS, FOCAL_LENGTHS, APERTURES, LIGHTING_STYLES, COLOR_GRADES, COMPOSITIONS } from '../constants';
import { PlusIcon, TrashIcon, MagicIcon, FilmIcon } from './Icon';
import { getGeminiSceneSuggestions, getGeminiShotDetails, getDirectorNoteSuggestion } from '../services/geminiService';

interface ShotBuilderProps {
  shots: Shot[];
  setShots: React.Dispatch<React.SetStateAction<Shot[]>>;
  story: Story;
  directorVision: DirectorVision;
  onBack: () => void;
  onNext: () => void;
  isInitializing: boolean;
  sceneEmotionalCore: string;
  setSceneEmotionalCore: React.Dispatch<React.SetStateAction<string>>;
}

const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ShotEditor: React.FC<{ shot: Shot; onSave: (shot: Shot) => void; onCancel: () => void; story: Story; directorVision: DirectorVision; sceneEmotionalCore: string; }> = ({ shot, onSave, onCancel, story, directorVision, sceneEmotionalCore }) => {
    const [editedShot, setEditedShot] = useState(shot);
    const [isSuggestingDetails, setIsSuggestingDetails] = useState(false);
    const [isSuggestingNote, setIsSuggestingNote] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setEditedShot({ ...editedShot, [e.target.name]: e.target.value });
    };

    const handleTechSpecChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedShot(prev => ({
            ...prev,
            technicalSpecs: {
                ...prev.technicalSpecs,
                [name]: value
            }
        }));
    };

    const handleSuggestAllDetails = async () => {
        if (!editedShot.description) {
            alert("Please provide a shot description first.");
            return;
        }
        setIsSuggestingDetails(true);
        try {
            const suggestedDetails = await getGeminiShotDetails(story, directorVision, editedShot.description, sceneEmotionalCore);
            setEditedShot(prev => ({...prev, ...suggestedDetails}));
        } catch (error) {
            console.error("Failed to get shot details:", error);
            alert("Sorry, there was an error getting detailed suggestions.");
        } finally {
            setIsSuggestingDetails(false);
        }
    };
    
    const handleSuggestDirectorNote = async () => {
        if (!editedShot.description) {
            alert("Please provide a shot description first.");
            return;
        }
        setIsSuggestingNote(true);
        try {
            const note = await getDirectorNoteSuggestion(story, directorVision, editedShot, sceneEmotionalCore);
            setEditedShot(prev => ({ ...prev, directorNotes: note }));
        } catch (error) {
            console.error("Failed to suggest director's note:", error);
            alert("Sorry, there was an error suggesting a director's note.");
        } finally {
            setIsSuggestingNote(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-5xl space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-white">Shot Details</h3>
                        <p className="text-gray-400 mt-1">Define the cinematic properties of this shot.</p>
                    </div>
                     <button 
                        onClick={handleSuggestAllDetails} 
                        disabled={isSuggestingDetails || !editedShot.description}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSuggestingDetails ? <LoadingSpinner /> : <MagicIcon />}
                        Suggest All Details
                    </button>
                </div>
                
                <div className="space-y-4">
                    <TextAreaControl label="Description" name="description" value={editedShot.description} onChange={handleChange} placeholder="Describe the action or moment in this shot..."/>
                    <TextAreaControl label="Character Blocking" name="characterBlocking" value={editedShot.characterBlocking} onChange={handleChange} placeholder="e.g., Alex stands center frame, back to camera. Sarah enters from screen left."/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-b border-gray-700 py-6">
                    <SelectControl label="Shot Type" name="shotType" value={editedShot.shotType} onChange={handleChange} options={SHOT_TYPES} />
                    <SelectControl label="Camera Angle" name="cameraAngle" value={editedShot.cameraAngle} onChange={handleChange} options={CAMERA_ANGLES} />
                    <SelectControl label="Camera Movement" name="cameraMovement" value={editedShot.cameraMovement} onChange={handleChange} options={CAMERA_MOVEMENTS} />
                    <SelectControl label="Focal Length" name="focalLength" value={editedShot.focalLength} onChange={handleChange} options={FOCAL_LENGTHS} />
                    <SelectControl label="Aperture" name="aperture" value={editedShot.aperture} onChange={handleChange} options={APERTURES} />
                    <SelectControl label="Lighting Style" name="lightingStyle" value={editedShot.lightingStyle} onChange={handleChange} options={LIGHTING_STYLES} />
                    <SelectControl label="Color Grade" name="colorGrade" value={editedShot.colorGrade} onChange={handleChange} options={COLOR_GRADES} />
                    <SelectControl label="Composition" name="composition" value={editedShot.composition} onChange={handleChange} options={COMPOSITIONS} />
                </div>
                
                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Production Notes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TextAreaControl label="Camera & Lens" name="camera" value={editedShot.technicalSpecs.camera} onChange={handleTechSpecChange} placeholder="e.g., Arri Alexa Mini with 50mm Signature Prime" />
                        <TextAreaControl label="Lighting Setup" name="lighting" value={editedShot.technicalSpecs.lighting} onChange={handleTechSpecChange} placeholder="e.g., Key light (softbox), fill light, backlight for separation" />
                        <TextAreaControl label="Audio Notes" name="audio" value={editedShot.technicalSpecs.audio} onChange={handleTechSpecChange} placeholder="e.g., Capture clean dialogue, record ambient sound" />
                    </div>
                </div>

                <div>
                    <label className="flex items-center justify-between text-sm font-medium text-gray-300">
                        <span>Director's Notes</span>
                         <button onClick={handleSuggestDirectorNote} disabled={isSuggestingNote || !editedShot.description} className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSuggestingNote ? <LoadingSpinner /> : <MagicIcon />} Suggest Note
                        </button>
                    </label>
                    <textarea name="directorNotes" value={editedShot.directorNotes} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white" placeholder="Why: [The core emotion]. How: [The visual invention and technique]. Feel: [The intended rhythm and pace]."/>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                    <button onClick={() => onSave(editedShot)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Save Shot</button>
                </div>
            </div>
        </div>
    );
};

const SelectControl: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({label, name, value, onChange, options}) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <select name={name} value={value} onChange={onChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white py-2 px-3">
            <option value="">Select...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const TextAreaControl: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder?: string}> = ({label, name, value, onChange, placeholder}) => (
    <div>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <textarea name={name} value={value} onChange={onChange} rows={2} placeholder={placeholder} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white"/>
    </div>
);


const ShotCard: React.FC<{ shot: Shot; onEdit: () => void; onDelete: () => void; index: number; onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void; onDragOver: (e: React.DragEvent<HTMLDivElement>) => void; onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void; isDragging: boolean; }> = ({ shot, onEdit, onDelete, index, onDragStart, onDragOver, onDrop, isDragging }) => {
    return (
        <div 
            draggable 
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            className={`bg-gray-900/50 p-4 rounded-lg flex justify-between items-start gap-4 cursor-grab transition-opacity ${isDragging ? 'opacity-30' : 'opacity-100'}`}
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center font-bold text-indigo-300">{index + 1}</div>
                <div>
                    <p className="font-semibold text-white">{shot.description || "Untitled Shot"}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
                        {shot.shotType && <span><strong>Type:</strong> {shot.shotType}</span>}
                        {shot.cameraAngle && <span><strong>Angle:</strong> {shot.cameraAngle}</span>}
                        {shot.lightingStyle && <span><strong>Light:</strong> {shot.lightingStyle}</span>}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={onEdit} className="text-gray-400 hover:text-white transition-colors">Edit</button>
                <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><TrashIcon /></button>
            </div>
        </div>
    );
};

const ShotBuilder: React.FC<ShotBuilderProps> = ({ shots, setShots, story, directorVision, onBack, onNext, isInitializing, sceneEmotionalCore, setSceneEmotionalCore }) => {
    const [editingShot, setEditingShot] = useState<Shot | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    
    // Drag and drop state
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
        setIsDragging(true);
    };
    
    // FIX: Defined the missing handleDragEnter function to update the dragOverItem ref.
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
    };

    const handleDrop = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const newShots = [...shots];
            const dragItemContent = newShots[dragItem.current];
            newShots.splice(dragItem.current, 1);
            newShots.splice(dragOverItem.current, 0, dragItemContent);
            dragItem.current = null;
            dragOverItem.current = null;
            setShots(newShots);
        }
        setIsDragging(false);
    };

    const createNewShot = (): Shot => ({
        id: new Date().toISOString(),
        description: '', 
        characterBlocking: '',
        shotType: '', cameraAngle: '', cameraMovement: '',
        focalLength: '50mm (Standard)', aperture: 'f/2.8 (Shallow)',
        lightingStyle: '', colorGrade: '', composition: 'Rule of Thirds',
        technicalSpecs: { camera: '', lighting: '', audio: '' },
        directorNotes: '',
    });

    const handleAddShot = () => {
        setEditingShot(createNewShot());
    };

    const handleEditShot = (shot: Shot) => {
        setEditingShot(shot);
    };

    const handleDeleteShot = (id: string) => {
        setShots(shots.filter(s => s.id !== id));
    };

    const handleSaveShot = (shotToSave: Shot) => {
        const index = shots.findIndex(s => s.id === shotToSave.id);
        if (index > -1) {
            const newShots = [...shots];
            newShots[index] = shotToSave;
            setShots(newShots);
        } else {
            setShots([...shots, shotToSave]);
        }
        setEditingShot(null);
    };
    
    const handleGetSuggestions = async () => {
        if (!sceneEmotionalCore) {
            alert("Please define the Scene's Emotional Core before getting suggestions.");
            return;
        }
        setIsSuggesting(true);
        try {
            const suggestedShots = await getGeminiSceneSuggestions(story, directorVision, sceneEmotionalCore);
            setShots(prev => [...prev, ...suggestedShots]);
        } catch (error) {
            console.error("Failed to get suggestions from Gemini:", error);
            alert("Sorry, there was an error getting suggestions. Please check your API key and try again.");
        } finally {
            setIsSuggesting(false);
        }
    };

    if (isInitializing) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center">
                <div className="w-12 h-12 text-indigo-400"><FilmIcon /></div>
                <h3 className="text-2xl font-bold mt-4">Crafting Your Scene...</h3>
                <p className="text-gray-400 mt-2">Our AI Creative Team is creating a professional shot list for you.</p>
                <div className="mt-6">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
             {editingShot && <ShotEditor shot={editingShot} onSave={handleSaveShot} onCancel={() => setEditingShot(null)} story={story} directorVision={directorVision} sceneEmotionalCore={sceneEmotionalCore} />}
            <div>
                <h2 className="text-2xl font-bold text-gray-100 mb-4">Design Your Scene</h2>
                <p className="text-gray-400">Start by defining the core emotion, then build your scene shot by shot. Drag and drop to reorder.</p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg">
                <label htmlFor="emotional-core" className="block text-lg font-semibold text-indigo-300">Scene's Emotional Core (The 'Why')</label>
                <p className="text-sm text-gray-400 mt-1 mb-3">Define the central subtext or emotional truth of this scene. This will guide all AI suggestions.</p>
                <input 
                    type="text"
                    id="emotional-core"
                    value={sceneEmotionalCore}
                    onChange={(e) => setSceneEmotionalCore(e.target.value)}
                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-white"
                    placeholder="e.g., A loving lesson in humility, a moment of quiet shame..."
                />
            </div>

            <div className="space-y-4">
                {shots.length > 0 ? (
                    shots.map((shot, index) => (
                        <ShotCard 
                            key={shot.id} 
                            shot={shot} 
                            index={index} 
                            onEdit={() => handleEditShot(shot)} 
                            onDelete={() => handleDeleteShot(shot.id)}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => { e.preventDefault(); handleDragEnter(e, index); }}
                            onDrop={handleDrop}
                            isDragging={isDragging && dragItem.current === index}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 px-6 bg-gray-900/50 rounded-lg">
                        <p className="text-gray-400">Your scene is empty. Add a shot or get AI suggestions to begin.</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                <button onClick={handleAddShot} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    <PlusIcon /> Add Shot Manually
                </button>
                <button onClick={handleGetSuggestions} disabled={isSuggesting || !sceneEmotionalCore} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSuggesting ? (
                         <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Thinking...
                       </>
                    ) : (
                        <> <MagicIcon /> Get AI Scene Suggestions </>
                    )}
                   
                </button>
            </div>

            <div className="flex justify-between pt-8 mt-4 border-t border-gray-700">
                <button onClick={onBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">&larr; Back to Vision</button>
                <button onClick={onNext} disabled={shots.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Generate Prompts &rarr;
                </button>
            </div>
        </div>
    );
};

export default ShotBuilder;