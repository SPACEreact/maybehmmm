import { GoogleGenAI, Type } from "@google/genai";
import type { Story, Shot, ChatMessage, DirectorVision } from '../types';
import { SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVEMENTS, FOCAL_LENGTHS, APERTURES, LIGHTING_STYLES, COLOR_GRADES, COMPOSITIONS } from '../constants';

const API_KEY = process.env.API_KEY;

const VISIONARY_DIRECTOR_KNOWLEDGE_BASE = `
You are a Visionary Director and Visual Storyteller. Your primary goal is to translate the script's subtext and psychology into new, cinematic actions. Do not just film what is written; film what is felt. You must invent new visual elements (like environmental reactions, subjective inserts, or abstract reveals) that amplify the scene's core emotion.

Your Chain of Thought MUST be:
1. Parse Element: Read the script beat or scene description.
2. Analyze Beat: Determine the core emotional purpose (e.g., "Arrogance," "Realization", "Fear").
3. Invent Visual Subtext: Before consulting the matrix, ask: "How can I show this subtext without the actor? How does the world react to this emotion? What new visual element can I invent?"
4. Consult Matrix & Knowledge Base: Select a cinematic technique (shot size, angle, movement) to capture that new invention.
5. Justify: In the directorNotes, you MUST first state the subtext, then the new visual element you invented, and finally the shot you chose to capture it.

--- KNOWLEDGE BASE ---

SECTION 6: ENVIRONMENTAL STORYTELLING (THE 'BHIM'S TREMOR' EFFECT)
Principle: A character's internal state (power, pride, fear) should have a physical, external impact on their environment. The world itself becomes a character that reacts to them.
Technique: When analyzing a beat, generate consequence shots.
- If Beat is "Power/Arrogance": Invent shots of the environment yielding or reacting (e.g., dust motes jump with each step, birds explode from a tree).
- If Beat is "Fear/Grief": Invent shots of the environment closing in (e.g., wind blows debris *at* the character).

SECTION 7: PLANTING & PAYOFF (THE 'HANUMAN'S TAIL' PRINCIPLE)
Principle: If an object or detail is critical to the scene's climax, it must be visually planted with intent before its purpose is known.
Technique: Use "Subjective Focus" or "Distraction" techniques (e.g., Rack Focus to the object, or a Distraction Pan that starts on it).

SECTION 8: ABSTRACT & SUBJECTIVE REVEALS (THE 'EYE REFLECTION' INSERT)
Principle: A character's realization or a divine reveal is often more powerful when shown indirectly or subjectively.
Technique: Use a "Subjective Insert" or "Abstract Insert" instead of a standard Reaction Shot (e.g., ECU of an eye, showing the reveal in the reflection; a "Lens Whack" effect with light leaks for a divine transformation).

--- Cinematic-Narrative Translation Matrix ---

Part 1: Synthesized Matrix (Standard Narrative Beats)
- Character's Moment of Indecision: Side-lit close-up shot (visual representation of the split).
- Establishing Location & Scale: Long Shot or Establishing Shot (emphasizes body language and location).
- Ambiguous or Uncertain Future: Character framed half in light and half in shadow (visual metaphor for uncertainty).
- Powerlessness / Surveillance: Wide frame with the subject small and distant (creates a vibe of surveillance).
- Audience Focus on a Minor Detail: Insert Shot (draws attention to a small object of narrative significance).
- Tension/Chaos in the Scene: Unbalanced Composition or macro shots (visually conveys chaos).
- Growing Character Confidence: Progressively Low-Angle Shots (depict a growing sense of power).
- Revealing Emotional Intoxication: Playing with focus, going quickly in and out of focus (shows character's state).
- The Need to Advance the Narrative: A "Good Cut" based on the "Rule of Six" (advances the story).
- High Emotional Impact of a Scene: A "Good Cut" based on the "Rule of Six" (Emotion feels right).
- Clarity and Consistency: Aligning every visual element with the emotional core (ensures narrative coherence).
- Revealing Unspoken Tension (Subtext): Character action implying more than words (emphasizes the hidden layer).

Part 2: Expanded Matrix (Abstract Concepts / Video Essay & Director's Eye Insights)
- Character’s Arrogance: Dolly shot combined with a slightly Low Angle (suggests dominance or elevation).
- Unspoken Fear: Rack Focus from the character's face to an insignificant object (guides focus to what the character is silently noticing).
- Divine Realization (Epiphany): A sudden cut (blink-like timing) combined with a transition to rich color grading (visual metaphor for knowledge).
- Internal Conflict / Split Self: Split diopter or Split-Screen composition (embodying the psychological split).
- Isolation / Alienation: Telephoto Lens use on the subject to compress depth (visually separating the character).
- Hidden Betrayal / Secret Agenda: Dialogue with strong Subtext where the visual action contradicts the spoken word.
- Sense of Overwhelming Authority: Static Frame (Locked-off Camera) with centered Symmetry (illustrates dependence under a grander structure).
- Shift in Narrative Structure: Montage Sequence with varied shots and a driving tempo/score (condenses narrative information).
- Focus on Abstract Theme over Plot: Use of Leitmotif (recurring visual, sound, or idea to unify the film).
- Unavoidable Confrontation (Unity of Opposites): Framing two characters in opposition using the 180° Rule line with high visual tension.
`;


const isApiKeySet = () => {
    if (!API_KEY) {
        console.warn("API_KEY environment variable not set. AI features will be disabled.");
        alert("Please set your Gemini API key in the environment variables (API_KEY) to use AI features.");
        return false;
    }
    return true;
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const shotSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING, description: "A detailed description of the action and subject in the shot." },
    shotType: { type: Type.STRING, enum: SHOT_TYPES, description: "The type of shot." },
    cameraAngle: { type: Type.STRING, enum: CAMERA_ANGLES, description: "The angle of the camera." },
    cameraMovement: { type: Type.STRING, enum: CAMERA_MOVEMENTS, description: "The movement of the camera." },
    focalLength: { type: Type.STRING, enum: FOCAL_LENGTHS, description: "The lens focal length." },
    aperture: { type: Type.STRING, enum: APERTURES, description: "The lens aperture setting." },
    lightingStyle: { type: Type.STRING, enum: LIGHTING_STYLES, description: "The overall lighting style." },
    colorGrade: { type: Type.STRING, enum: COLOR_GRADES, description: "The color grading style." },
    composition: { type: Type.STRING, enum: COMPOSITIONS, description: "The compositional rule used." },
    technicalSpecs: {
      type: Type.OBJECT,
      properties: {
        camera: { type: Type.STRING, description: "Specific camera and lens notes, e.g., 'Arri Alexa Mini with 50mm Signature Prime'." },
        lighting: { type: Type.STRING, description: "Description of the lighting setup, e.g., 'Key light (softbox), fill light, backlight'." },
        audio: { type: Type.STRING, description: "Notes for sound recording, e.g., 'Capture clean dialogue, record ambient sound'." },
      }
    },
    directorNotes: { type: Type.STRING, description: "The justification for the shot, following the Chain of Thought: Subtext, Invention, Shot choice." },
  },
  required: ["description", "shotType", "cameraAngle", "cameraMovement", "focalLength", "aperture", "lightingStyle", "colorGrade", "composition", "technicalSpecs", "directorNotes"]
};


export const generateShotsFromScript = async (script: string): Promise<{story: Pick<Story, 'title' | 'logline'>, shots: Shot[]}> => {
    if (!ai || !isApiKeySet()) return Promise.resolve({ story: { title: '', logline: ''}, shots: []});

    const prompt = `
        ${VISIONARY_DIRECTOR_KNOWLEDGE_BASE}

        Your task is to act as a Visionary Director for a fast-paced Instagram Reel.
        Analyze the following script, extract a 'title' and 'logline', and break it down into a visually dynamic shot list.
        Apply your full knowledge base, especially inventing visual subtext to make the reel engaging.
        The directorNotes for each shot MUST follow the 'Justify' step in your Chain of Thought.

        Script to analyze:
        ---
        ${script}
        ---

        Return a single, complete JSON object containing the 'title', 'logline', and a 'shots' array. The shots array must strictly follow the provided JSON schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        logline: { type: Type.STRING },
                        shots: { type: Type.ARRAY, items: shotSchema }
                    },
                    required: ["title", "logline", "shots"]
                },
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);

        const story = {
            title: parsed.title || 'Untitled Story',
            logline: parsed.logline || 'A story generated from script.'
        };

        const shots = (parsed.shots && Array.isArray(parsed.shots)) 
            ? parsed.shots.map((shotData: any) => ({
                ...shotData,
                id: `gemini-script-${new Date().toISOString()}-${Math.random()}`,
            }))
            : [];
            
        return { story, shots };

    } catch (error) {
        console.error("Error generating shots from script:", error);
        throw new Error("Failed to generate shots from script via Gemini.");
    }
};


export const getInitialScene = async (story: Story, directorVision: DirectorVision): Promise<Shot[]> => {
    if (!ai || !isApiKeySet()) return Promise.resolve([]);

    const prompt = `
        ${VISIONARY_DIRECTOR_KNOWLEDGE_BASE}

        As a Visionary Director, create an initial shot list of 5-7 shots for a scene based on the provided Story Context and Director's Vision.
        Your goal is to establish the scene not just physically, but emotionally. Invent visual subtext and use your knowledge base to create a powerful opening sequence.
        The directorNotes for each shot MUST follow the 'Justify' step in your Chain of Thought.

        Story Context:
        - Title: ${story.title}
        - Logline: ${story.logline}
        - Characters: ${story.characters.map(c => `${c.name}: ${c.description}`).join('; ')}
        - Setting: ${story.setting.name}: ${story.setting.description}

        Director's Vision:
        - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
        - Color Palette: ${directorVision.colorPalette}
        - Inspirations: ${directorVision.inspirations}

        Provide a complete, structured JSON response containing the list of shots, following the schema precisely.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { shots: { type: Type.ARRAY, items: shotSchema } }
                },
                thinkingConfig: { thinkingBudget: 32768 },
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        
        if (parsed.shots && Array.isArray(parsed.shots)) {
            return parsed.shots.map((shotData: any) => ({
                ...shotData,
                id: `gemini-initial-${new Date().toISOString()}-${Math.random()}`,
            }));
        }
        return [];
    } catch (error) {
        console.error("Error generating initial scene:", error);
        throw new Error("Failed to generate initial scene from Gemini.");
    }
};

export const getGeminiSceneSuggestions = async (story: Story, directorVision: DirectorVision, sceneDescription: string): Promise<Shot[]> => {
  if (!ai || !isApiKeySet()) return Promise.resolve([]);
  
  const prompt = `
    ${VISIONARY_DIRECTOR_KNOWLEDGE_BASE}

    As a Visionary Director, generate a sequence of 3-5 cinematic shots for a scene about: "${sceneDescription}".
    Use the provided Story Context and Director's Vision. Your primary goal is to invent visual subtext that elevates the scene beyond the literal description.
    The directorNotes for each shot MUST follow the 'Justify' step in your Chain of Thought.

    Story Context:
    - Title: ${story.title}
    - Logline: ${story.logline}
    - Characters: ${story.characters.map(c => `${c.name}: ${c.description}`).join('; ')}
    - Setting: ${story.setting.name}: ${story.setting.description}

    Director's Vision:
    - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
    - Color Palette: ${directorVision.colorPalette}
    - Inspirations: ${directorVision.inspirations}

    Follow the provided JSON schema precisely for all fields. The shot sequence should have a clear beginning, middle, and end, driven by the emotional arc you create through your visual inventions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shots: {
              type: Type.ARRAY,
              items: shotSchema
            }
          }
        },
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed.shots && Array.isArray(parsed.shots)) {
      return parsed.shots.map((shotData: any) => ({
        ...shotData,
        id: `gemini-${new Date().toISOString()}-${Math.random()}`,
      }));
    }
    
    return [];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to parse suggestions from Gemini.");
  }
};

export const getGeminiShotDetails = async (story: Story, directorVision: DirectorVision, shotDescription: string): Promise<Partial<Shot>> => {
  if (!ai || !isApiKeySet()) return Promise.resolve({});

  const contextPrompt = `
    ${VISIONARY_DIRECTOR_KNOWLEDGE_BASE}

    You are a Visionary Director. For the given shot description, invent visual subtext and determine the optimal cinematic choices based on the story and vision.

    Story Context:
    - Title: ${story.title}
    - Logline: ${story.logline}
    
    Director's Vision:
    - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
    - Inspirations: ${directorVision.inspirations}
    
    Shot Description: "${shotDescription}"

    Your directorNotes MUST follow the 'Justify' step in your Chain of Thought.
    Return a single JSON object that strictly follows the provided schema for all cinematic and technical fields.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: contextPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: shotSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error getting shot details from Gemini:", error);
    throw new Error("Failed to get shot details from Gemini.");
  }
}

export const getDirectorNoteSuggestion = async (story: Story, directorVision: DirectorVision, shot: Shot): Promise<string> => {
    if (!ai || !isApiKeySet()) return Promise.resolve('');
    const prompt = `
        ${VISIONARY_DIRECTOR_KNOWLEDGE_BASE}
        
        As a Visionary Director, analyze the following shot within the full context and generate ONLY the text for the director's note.
        The note MUST follow the 'Justify' step of your Chain of Thought: State the subtext, describe the visual element you invent, and justify the shot choice to capture it.

        Story: ${story.logline}
        Vision: ${directorVision.genre}, ${directorVision.tone}, inspired by ${directorVision.inspirations}
        Shot Description: ${shot.description}
        Current Cinematic Choices: ${shot.shotType}, ${shot.cameraAngle}, ${shot.cameraMovement}
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using Pro for more nuanced creative insight
            contents: prompt,
        });
        return response.text.trim();
    } catch (e) {
        console.error("Error suggesting director's note:", e);
        return "Could not generate a suggestion.";
    }
};

export const enrichWithSearch = async (subject: string, existingDescription: string): Promise<string> => {
    if (!ai || !isApiKeySet()) return Promise.resolve(existingDescription);

    const prompt = `Enrich the following description for a fictional story by incorporating real-world details using Google Search.
    Subject: "${subject}"
    Existing Description: "${existingDescription}"
    
    Find interesting, accurate, and evocative details about the subject (or things related to it) and weave them into a more detailed and compelling paragraph. If the existing description is empty, create a new one from scratch based on the subject.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error enriching with search:", error);
        throw new Error("Failed to enrich content with Google Search.");
    }
};

export const getSuggestionForField = async (field: 'logline' | 'character' | 'setting', context: Story): Promise<string> => {
    if (!ai || !isApiKeySet()) return Promise.resolve('');

    let prompt = '';
    switch(field) {
        case 'logline':
            prompt = `Based on the story title "${context.title}", write a compelling and concise logline.`;
            break;
        case 'character':
            prompt = `Based on the story context (Title: ${context.title}, Logline: ${context.logline}), write a short, intriguing description for a character.`;
            break;
        case 'setting':
             prompt = `Based on the story context (Title: ${context.title}, Logline: ${context.logline}), write a short, atmospheric description for a setting.`;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error suggesting ${field}:`, error);
        throw new Error(`Failed to suggest ${field}.`);
    }
};

export const generateChatResponse = async (history: ChatMessage[]): Promise<string> => {
  if (!ai || !isApiKeySet()) return Promise.resolve("AI features are currently disabled.");

  const formattedHistory = history.map(m => `${m.sender}: ${m.text}`).join('\n');
  const prompt = `You are a helpful AI assistant for filmmakers. Your tone is knowledgeable and encouraging.
  Continue the following conversation:
  ${formattedHistory}
  gemini:`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error in chat response:", error);
    throw new Error("Failed to get chat response.");
  }
};