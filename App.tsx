
import React, { useState, useEffect } from 'react';
// FIX: Aliased the DirectorVision type to resolve a name conflict with the DirectorVision component.
import type { Story, Shot, ChatMessage, Soundscape, DirectorVision as DirectorVisionType } from './types';
import { AppStep, AppMode } from './types';
import StoryBuilder from './components/StoryBuilder';
import DirectorVision from './components/DirectorVision';
import ShotBuilder from './components/ShotBuilder';
import SoundscapeBuilder from './components/SoundscapeBuilder';
import PromptViewer from './components/PromptViewer';
import Chatbot from './components/Chatbot';
import StartScreen from './components/StartScreen';
import ScriptProcessor from './components/ScriptProcessor';
import { CameraIcon, FilmIcon, SparklesIcon, ChatIcon, ClipboardListIcon, HeartIcon, SpeakerIcon } from './components/Icon';
import { generateChatResponse, getInitialScene } from './services/geminiService';


const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.SELECTION);
  const [step, setStep] = useState<AppStep>(AppStep.STORY);
  const [isPastelMode, setIsPastelMode] = useState(false);

  const [story, setStory] = useState<Story>({
    title: '',
    logline: '',
    characters: [{ name: '', description: '' }],
    setting: { name: '', description: '' },
  });
  // FIX: Used the aliased DirectorVisionType for the state's type annotation.
  const [directorVision, setDirectorVision] = useState<DirectorVisionType>({
    genre: '',
    tone: '',
    colorPalette: '',
    inspirations: '',
  });
  const [shots, setShots] = useState<Shot[]>([]);
  const [soundscape, setSoundscape] = useState<Soundscape>([]);
  const [sceneEmotionalCore, setSceneEmotionalCore] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'gemini', text: "Hello! I'm your AI filmmaking assistant. Ask me anything about scriptwriting, cinematography, or for creative ideas." }
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [directorInstructions, setDirectorInstructions] = useState('');
  const [isInitializingScene, setIsInitializingScene] = useState(false);

  useEffect(() => {
    const initializeScene = async () => {
      if (appMode === AppMode.CREATOR && step === AppStep.SCENE && shots.length === 0 && (story.title || story.logline)) {
        setIsInitializingScene(true);
        try {
          const initialShots = await getInitialScene(story, directorVision, sceneEmotionalCore || "The opening of the story.");
          setShots(initialShots);
        } catch (error) {
          console.error("Failed to initialize scene:", error);
          alert("There was an error generating the initial scene. Please try adding shots manually or refresh the page.");
        } finally {
          setIsInitializingScene(false);
        }
      }
    };
    initializeScene();
  }, [step, appMode, story, directorVision, sceneEmotionalCore]);
  
  useEffect(() => {
    if (isPastelMode) {
      setChatMessages([{ sender: 'gemini', text: "Welcome to Pastel Mode! How about we create a whimsical fairytale today?" }]);
    } else {
      setChatMessages([{ sender: 'gemini', text: "Hello! I'm your AI filmmaking assistant. Ask me anything about scriptwriting, cinematography, or for creative ideas." }]);
    }
  }, [isPastelMode]);

  const handleNext = () => {
    if (step === AppStep.STORY) setStep(AppStep.VISION);
    if (step === AppStep.VISION) setStep(AppStep.SCENE);
    if (step === AppStep.SCENE) setStep(AppStep.SOUNDSCAPE);
    if (step === AppStep.SOUNDSCAPE) setStep(AppStep.PROMPTS);
  };

  const handleBack = () => {
    if (step === AppStep.PROMPTS) setStep(AppStep.SOUNDSCAPE);
    if (step === AppStep.SOUNDSCAPE) setStep(AppStep.SCENE);
    if (step === AppStep.SCENE) setStep(AppStep.VISION);
    if (step === AppStep.VISION) setStep(AppStep.STORY);
  };
  
  const handleSendMessage = async (message: string) => {
    const newMessages: ChatMessage[] = [...chatMessages, { sender: 'user', text: message }];
    setChatMessages(newMessages);
    setIsBotThinking(true);
    try {
      const response = await generateChatResponse(newMessages);
      setChatMessages([...newMessages, { sender: 'gemini', text: response }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setChatMessages([...newMessages, { sender: 'gemini', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsBotThinking(false);
    }
  };

  const handleScriptProcessComplete = (processedStory: Story, processedShots: Shot[], instructions: string) => {
    setStory({
      ...story,
      title: processedStory.title,
      logline: processedStory.logline,
    });
    setShots(processedShots);
    setDirectorInstructions(instructions);
    // Skip story and vision steps, go directly to scene editing
    setStep(AppStep.SCENE);
    setAppMode(AppMode.CREATOR);
  };

  const renderCreatorSteps = () => {
    switch (step) {
      case AppStep.STORY:
        return <StoryBuilder story={story} setStory={setStory} onNext={handleNext} />;
      case AppStep.VISION:
        return <DirectorVision vision={directorVision} setVision={setDirectorVision} onBack={handleBack} onNext={handleNext} />;
      case AppStep.SCENE:
        return <ShotBuilder 
                  shots={shots} 
                  setShots={setShots} 
                  story={story} 
                  directorVision={directorVision} 
                  onBack={handleBack} 
                  onNext={handleNext} 
                  isInitializing={isInitializingScene}
                  sceneEmotionalCore={sceneEmotionalCore}
                  setSceneEmotionalCore={setSceneEmotionalCore}
                />;
      case AppStep.SOUNDSCAPE:
        return <SoundscapeBuilder 
                  shots={shots}
                  story={story}
                  directorVision={directorVision}
                  soundscape={soundscape}
                  setSoundscape={setSoundscape}
                  onBack={handleBack}
                  onNext={handleNext}
                />;
      case AppStep.PROMPTS:
        return <PromptViewer shots={shots} story={story} soundscape={soundscape} onBack={handleBack} directorInstructions={directorInstructions} />;
      default:
        return <div>Invalid Step</div>;
    }
  };

  const steps = [
      { id: AppStep.STORY, name: 'The Story', icon: <SparklesIcon />},
      { id: AppStep.VISION, name: "Director's Vision", icon: <ClipboardListIcon />},
      { id: AppStep.SCENE, name: 'The Scene', icon: <CameraIcon />},
      { id: AppStep.SOUNDSCAPE, name: 'The Soundscape', icon: <SpeakerIcon />},
      { id: AppStep.PROMPTS, name: 'The Prompts', icon: <FilmIcon />},
  ];
  
  const renderContent = () => {
    switch(appMode) {
      case AppMode.SELECTION:
        return <StartScreen 
                  isPastelMode={isPastelMode}
                  onSelectCreator={() => setAppMode(AppMode.CREATOR)} 
                  onSelectScript={() => setAppMode(AppMode.SCRIPT_INPUT)} 
               />;
      case AppMode.SCRIPT_INPUT:
        return <ScriptProcessor onProcessComplete={handleScriptProcessComplete} />;
      case AppMode.CREATOR:
        return (
          <>
            <nav className="mb-12">
                <ol className="flex items-center justify-center w-full text-sm font-medium text-center text-gray-500">
                    {steps.map((s, index) => (
                        <li key={s.id} className={`flex md:w-full items-center ${step === s.id ? 'text-blue-500' : ''} ${index < steps.length - 1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-700 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10" : ""}`}>
                            <span className={`flex items-center ${index < steps.length - 1 ? "sm:after:content-['/']" : ""} after:hidden sm:after:inline-block after:mx-2 after:text-gray-500`}>
                                <span className={step === s.id ? "text-blue-500" : ""}>{s.icon}</span>
                                <span className="ml-2">{s.name}</span>
                            </span>
                        </li>
                    ))}
                </ol>
            </nav>
            <main className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-10 min-h-[50vh]">
              {renderCreatorSteps()}
            </main>
          </>
        );
    }
  }

  const appTitle = "Cinematic Prompt Weaver";
  const landingTitle = "well, it creates shot list and prompts while maintaining respect for your creative freedom - by himanshu (made with heart)";
  
  return (
    <div className={`text-white min-h-screen font-sans transition-colors duration-500 ${isPastelMode ? 'bg-pink-200' : 'bg-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
           <h1 className={`font-extrabold tracking-tight transition-colors duration-500 ${appMode === AppMode.SELECTION ? 'text-3xl md:text-4xl leading-tight' : 'text-4xl md:text-5xl'} ${isPastelMode ? 'text-pink-800' : 'bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600'}`}>
            <div className="flex items-center justify-center gap-4">
              {appMode === AppMode.SELECTION ? landingTitle : appTitle}
              {appMode === AppMode.SELECTION && (
                 <button onClick={() => setIsPastelMode(!isPastelMode)} className={`transition-all ${isPastelMode ? 'text-pink-500' : 'text-purple-400'} hover:scale-110`}>
                    <HeartIcon />
                 </button>
              )}
            </div>
          </h1>
        </header>
        
        {renderContent()}
        
        <footer className={`text-center mt-12 transition-colors duration-500 ${isPastelMode ? 'text-pink-600' : 'text-gray-500'}`}>
            <p>Powered by Gemini & React</p>
        </footer>
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 ${isPastelMode ? 'bg-pink-500 hover:bg-pink-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          <ChatIcon />
        </button>
      </div>

      <Chatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isThinking={isBotThinking}
        isPastelMode={isPastelMode}
      />
    </div>
  );
};

export default App;
