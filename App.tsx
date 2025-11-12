
import React, { useState, useEffect } from 'react';
// FIX: Aliased the DirectorVision type to resolve a name conflict with the DirectorVision component.
import type { Story, Shot, ChatMessage, DirectorVision as DirectorVisionType } from './types';
import { AppStep, AppMode } from './types';
import StoryBuilder from './components/StoryBuilder';
import DirectorVision from './components/DirectorVision';
import ShotBuilder from './components/ShotBuilder';
import PromptViewer from './components/PromptViewer';
import Chatbot from './components/Chatbot';
import StartScreen from './components/StartScreen';
import ScriptProcessor from './components/ScriptProcessor';
import { CameraIcon, FilmIcon, SparklesIcon, ChatIcon, ClipboardListIcon } from './components/Icon';
import { generateChatResponse, getInitialScene } from './services/geminiService';


const App: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>(AppMode.SELECTION);
  const [step, setStep] = useState<AppStep>(AppStep.STORY);
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'gemini', text: "Hello! I'm your AI filmmaking assistant. Ask me anything about scriptwriting, cinematography, or for creative ideas." }
  ]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [isInitializingScene, setIsInitializingScene] = useState(false);

  useEffect(() => {
    const initializeScene = async () => {
      if (appMode === AppMode.CREATOR && step === AppStep.SCENE && shots.length === 0 && (story.title || story.logline)) {
        setIsInitializingScene(true);
        try {
          const initialShots = await getInitialScene(story, directorVision);
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
  }, [step, appMode, story, directorVision]);

  const handleNext = () => {
    if (step === AppStep.STORY) setStep(AppStep.VISION);
    if (step === AppStep.VISION) setStep(AppStep.SCENE);
    if (step === AppStep.SCENE) setStep(AppStep.PROMPTS);
  };

  const handleBack = () => {
    if (step === AppStep.PROMPTS) setStep(AppStep.SCENE);
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

  const handleScriptProcessComplete = (processedStory: Story, processedShots: Shot[]) => {
    setStory({
      ...story,
      title: processedStory.title,
      logline: processedStory.logline,
    });
    setShots(processedShots);
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
        return <ShotBuilder shots={shots} setShots={setShots} story={story} directorVision={directorVision} onBack={handleBack} onNext={handleNext} isInitializing={isInitializingScene} />;
      case AppStep.PROMPTS:
        return <PromptViewer shots={shots} story={story} onBack={handleBack} />;
      default:
        return <div>Invalid Step</div>;
    }
  };

  const steps = [
      { id: AppStep.STORY, name: 'The Story', icon: <SparklesIcon />},
      { id: AppStep.VISION, name: "Director's Vision", icon: <ClipboardListIcon />},
      { id: AppStep.SCENE, name: 'The Scene', icon: <CameraIcon />},
      { id: AppStep.PROMPTS, name: 'The Prompts', icon: <FilmIcon />},
  ];
  
  const renderContent = () => {
    switch(appMode) {
      case AppMode.SELECTION:
        return <StartScreen 
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


  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
            Cinematic Prompt Weaver
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            {appMode === AppMode.CREATOR 
              ? "Craft your narrative, design your shots, and generate AI prompts that bring your vision to life." 
              : "Instantly transform your script into a cinematic shot list for your next viral hit."
            }
          </p>
        </header>
        
        {renderContent()}
        
        <footer className="text-center mt-12 text-gray-500">
            <p>Powered by Gemini & React</p>
        </footer>
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110">
          <ChatIcon />
        </button>
      </div>

      <Chatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isThinking={isBotThinking}
      />
    </div>
  );
};

export default App;