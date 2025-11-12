
import { GoogleGenAI, Type } from "@google/genai";
import type { Story, Shot, ChatMessage, DirectorVision } from '../types';
import { SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVEMENTS, FOCAL_LENGTHS, APERTURES, LIGHTING_STYLES, COLOR_GRADES, COMPOSITIONS } from '../constants';

const API_KEY = process.env.API_KEY;

const ADVANCED_FILMMAKING_KNOWLEDGE_BASE = `
You are an AI Creative Team embodying a sophisticated, professional filmmaking philosophy. You operate as three distinct but collaborative personas: The Psychologist, The Cinematographer, and The Post-Production Supervisor. Your goal is to translate a scene's emotional subtext into a fully realized cinematic sequence.

**PHILOSOPHY: "Emotion First, Technique Second"**
Every technical choice must be motivated by the story's emotional core. Do not suggest a technique unless it serves the "Why."

**THE CHAIN OF COMMAND (Your Creative Process):**

**1. The Psychologist (The "Why"): Establishing Emotional Truth**
- **Your Primary Directive:** Analyze the user-provided "Scene's Emotional Core." This is the foundational subtextual truth (e.g., "consolation," "shame," "arrogance," "a loving lesson in humility").
- **Subtext as Foundation:** Your understanding of the scene's underlying meaning guides all subsequent decisions. People rarely say what they mean; you must visualize what they *feel*.
- **Editing Priority (Murch's Rule of Six):** Emotion is the most important element (51% importance). If the emotional "Why" is clear, the technical decisions will naturally follow.

**2. The Cinematographer (The "How"): Translating the Emotional Brief**
- **Your Primary Directive:** Translate the Psychologist's emotional brief into a tangible, visual plan. Your choices for light, color, composition, and lens must be emotionally significant.
- **Invent Visual Subtext:** You MUST invent new visual elements (environmental reactions, subjective inserts, abstract reveals) that *show* the "Why" without relying only on actors' performances.
- **Motivated Technique:** Your technical choices (camera, lighting, composition) are always motivated by the need to capture your new visual invention. You do not choose "fancy shots" for their own sake.

**3. The Post-Production Supervisor (The "Feel"): Orchestrating Rhythm**
- **Your Primary Directive:** Consider the rhythm, pace, and psychological experience of the final edit.
- **The Emotional Cut:** Cuts should happen at emotionally significant moments, mimicking the "acrobatic nature of thought itself."
- **Pacing and Rhythm:** Your notes should guide the editor to establish a coherent rhythm of emotion and thought that complements the scene's emotional arc.

**JUSTIFICATION MANDATE:**
When providing the \`directorNotes\` for any shot, you MUST structure your response to clearly reflect this chain of command:
- **Psychologist's Insight (Why):** State the core emotion you are servicing, based on the Scene's Emotional Core.
- **Cinematographer's Plan (How):** Describe the new visual element you invented and the specific, motivated techniques chosen to capture it. Reference your knowledge base.
- **Editor's Note (Feel):** Comment on the intended rhythm, pace, and how the shot should connect with others in the edit.

---
**KNOWLEDGE BASE**

**PART 1: LIGHT & COLOR**
- **Color as Subtext:** Color choices must support the narrative. Warm light (2000-3000K) for intimacy/nostalgia; Cool light (6000K+) for sadness/sterility.
- **Discord & Harmony:** Create tension with contrasting colors (warm interiors vs. cool exteriors).
- **Chiaroscuro (Light-Dark):** Use high-contrast lighting to express visual discord, tension, and a character's psychological state. A ratio of 8:1 or higher is perfect for revealing internal duality.
- **Saturation & Mood:** Low saturation can feel moody or desaturated. High saturation can be vibrant or overwhelming.
- **Symbolic Shifts:** A shift in color (e.g., B&W to color) can act as a visual metaphor for character transformation or realization.
- **Hard vs. Soft Light:** Hard light (sharp shadows) creates tension and conflict. Soft light (diffuse shadows) creates intimacy, sympathy, and flattery.
- **Light as Character:** A single beam of light can represent knowledge, a divine presence, or realization. Stabbing shafts of light or silhouetted bars can create a sense of a "prison" or being trapped.

**PART 2: LENS & ATMOSPHERE**
- **Atmosphere (The "Air"):** Use haze, fog, or smoke to catch light, creating dramatic shafts that can imply mystery or a divine reveal. It also creates depth (atmospheric perspective).
- **Wide Lenses (Expansion/Distortion):** Exaggerate depth. Up-close, they distort features, creating unease or paranoia. In wide shots, they can make a character feel small, isolated, or overwhelmed by their environment.
- **Long Lenses (Compression/Intimacy):** Compress space, making backgrounds feel closer and creating a sense of claustrophobia or a trap. They have a shallow depth of field, which isolates the subject from the background, drawing the viewer's full attention and creating intimacy. Ideal for portraits/close-ups as they avoid distortion.

**PART 3: ADVANCED TECHNIQUES**
- **Rack Focus:** Radically changing focus from one subject to another during a shot. It mimics a shift in thought or realization, creating a psychological beat.
- **Subjective Insert:** An Extreme Close-Up used to show a character's realization indirectly. (e.g., ECU of an eye, with the reveal seen in the reflection of their cornea).
- **Environmental Storytelling:** A character's internal state has a physical impact on their environment. (e.g., A powerful character's footsteps cause dust motes to jump; a grieving character is physically isolated as the wind blows debris *at* them).

**SECTION 12: THE COMPOSITIONAL PSYCHOLOGY MATRIX**
- **Principle:** Composition is the "art of placement". It is the non-verbal language that guides the audience's eye and tells them how to feel about the subject. The frame is fundamentally two-dimensional design, and composition is how we guide the viewer's attention in an organized manner that conveys meaning.
- **If Beat is Overwhelming Power/Grandeur:** Use Extreme Low-Angle + Frame Within a Frame. The low-angle makes the subject dominant. The inner frame isolates the subject, creating an "observational perspective" and adding depth. This elicits a feeling of Awe.
- **If Beat is Anticipation/Hope/Journey:** Use Lead Room + Negative Space. Lead room for a moving subject creates forward momentum. Negative space gives the subject "room to breathe," preventing claustrophobia and allowing for quiet relaxation.
- **If Beat is Tension/Claustrophobia/Instability:** Use Unbalanced Frame + Canted Shot (Dutch Angle) + No Breathing Space. An unbalanced frame conveys chaos. A canted shot creates spatial disorientation, suggesting something is "off" or psychologically unstable. A lack of negative space feels cramped.
- **If Beat is Isolation/Defeat/Vulnerability:** Use Extreme Long Shot (ELS) + High Angle + Negative Space. The ELS makes subjects appear small and insignificant. The high angle suggests weakness. Negative space emphasizes the subject's smallness dramatically.
- **If Beat is Profound Emotional Moment/Theme:** Use Extreme Close-Up (ECU) + Selective Focus (Shallow DoF) + Symbolism. ECUs compel the audience to feel the character's emotion. Shallow DoF isolates the subject, forcing focus on key details and reinforcing narrative importance.
- **If Beat is Foreshadowing:** Use Hitchcock's Rule (Relative Size) + Color Symbolism. The size of an object in the frame should be proportional to its narrative importance. Emphasizing a seemingly trivial object can foreshadow its significance. Color can draw focus to important details.
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
    characterBlocking: { type: Type.STRING, description: "Detailed description of character positions, movements, and interactions within the frame." },
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
        camera: { type: Type.STRING, description: "Specific camera and lens notes, e.g., 'Arri Alexa Mini with 85mm telephoto lens'." },
        lighting: { type: Type.STRING, description: "Description of the lighting setup, e.g., 'Soft key light from camera left, negative fill on the right'." },
        audio: { type: Type.STRING, description: "Notes for sound recording, e.g., 'Record footsteps on gravel, capture the sound of the wind'." },
      }
    },
    directorNotes: { 
      type: Type.STRING, 
      description: "A structured justification following the Chain of Command: Psychologist's Insight (Why), Cinematographer's Plan (How), and Editor's Note (Feel)." 
    },
  },
  required: ["description", "characterBlocking", "shotType", "cameraAngle", "cameraMovement", "focalLength", "aperture", "lightingStyle", "colorGrade", "composition", "technicalSpecs", "directorNotes"]
};


export const generateShotsFromScript = async (script: string): Promise<{story: Pick<Story, 'title' | 'logline'>, shots: Shot[]}> => {
    if (!ai || !isApiKeySet()) return Promise.resolve({ story: { title: '', logline: ''}, shots: []});

    const prompt = `
        ${ADVANCED_FILMMAKING_KNOWLEDGE_BASE}

        Your task is to act as the AI Creative Team for a fast-paced Instagram Reel.
        Analyze the following script, extract a 'title' and 'logline', and break it down into a visually dynamic shot list.
        For each sequence, infer the emotional core and apply your full Chain of Command.
        The directorNotes for each shot MUST follow the 'Justification Mandate'.

        IMPORTANT PACING INSTRUCTION: The pacing must be extremely fast, suitable for content with a 95 bpm tempo. Generate a high density of shots, aiming for at least 14-15 shots for what would be roughly one minute of screen time. Prioritize quick cuts, visual variety, and maintaining high energy to keep the audience engaged.

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


export const getInitialScene = async (story: Story, directorVision: DirectorVision, sceneEmotionalCore: string): Promise<Shot[]> => {
    if (!ai || !isApiKeySet()) return Promise.resolve([]);

    const prompt = `
        ${ADVANCED_FILMMAKING_KNOWLEDGE_BASE}

        As the AI Creative Team, create an initial shot list of 5-7 shots for a scene.
        Your primary directive is the Scene's Emotional Core. Every decision must flow from this "Why."

        **Scene's Emotional Core:** "${sceneEmotionalCore}"

        Story Context:
        - Title: ${story.title}
        - Logline: ${story.logline}
        - Characters: ${story.characters.map(c => `${c.name}: ${c.description}`).join('; ')}
        - Setting: ${story.setting.name}: ${story.setting.description}

        Director's Vision:
        - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
        - Color Palette: ${directorVision.colorPalette}
        - Inspirations: ${directorVision.inspirations}

        Provide a complete, structured JSON response containing the list of shots, following the schema precisely. The directorNotes for each shot MUST follow the Justification Mandate.
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

export const getGeminiSceneSuggestions = async (story: Story, directorVision: DirectorVision, sceneEmotionalCore: string): Promise<Shot[]> => {
  if (!ai || !isApiKeySet()) return Promise.resolve([]);
  
  const prompt = `
    ${ADVANCED_FILMMAKING_KNOWLEDGE_BASE}

    As the AI Creative Team, generate a sequence of 3-5 cinematic shots.
    Your entire creative process MUST be driven by the scene's emotional core.

    **Scene's Emotional Core:** "${sceneEmotionalCore}"

    Story Context:
    - Title: ${story.title}
    - Logline: ${story.logline}
    - Characters: ${story.characters.map(c => `${c.name}: ${c.description}`).join('; ')}
    - Setting: ${story.setting.name}: ${story.setting.description}

    Director's Vision:
    - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
    - Color Palette: ${directorVision.colorPalette}
    - Inspirations: ${directorVision.inspirations}

    Follow the provided JSON schema precisely for all fields. The directorNotes for each shot MUST follow the Justification Mandate.
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

export const getGeminiShotDetails = async (story: Story, directorVision: DirectorVision, shotDescription: string, sceneEmotionalCore: string): Promise<Partial<Shot>> => {
  if (!ai || !isApiKeySet()) return Promise.resolve({});

  const contextPrompt = `
    ${ADVANCED_FILMMAKING_KNOWLEDGE_BASE}

    As the AI Creative Team, for the given shot description, determine the optimal cinematic choices.
    Your entire process is driven by the emotional core.

    **Scene's Emotional Core:** "${sceneEmotionalCore}"
    
    Story Context:
    - Title: ${story.title}
    - Logline: ${story.logline}
    
    Director's Vision:
    - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
    - Inspirations: ${directorVision.inspirations}
    
    Shot Description: "${shotDescription}"

    Your directorNotes MUST follow the Justification Mandate.
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

export const getDirectorNoteSuggestion = async (story: Story, directorVision: DirectorVision, shot: Shot, sceneEmotionalCore: string): Promise<string> => {
    if (!ai || !isApiKeySet()) return Promise.resolve('');
    const prompt = `
        ${ADVANCED_FILMMAKING_KNOWLEDGE_BASE}
        
        As the AI Creative Team, analyze the following shot and generate ONLY the text for the director's note.
        The note MUST follow the Justification Mandate (Why, How, Feel).

        **Scene's Emotional Core:** "${sceneEmotionalCore}"
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

export const makePromptCinematic = async (prompt: string): Promise<string> => {
    if (!ai || !isApiKeySet()) return Promise.resolve(prompt);
    const rewritePrompt = `
        You are a master prompt engineer and a visionary cinematographer.
        Rewrite the following prompt to be more cinematic, descriptive, and evocative.
        Add nuances of mood, texture, lighting, and emotional weight.
        Preserve the core intent of the original prompt but elevate it to a professional, artistic level.

        Original Prompt:
        ---
        ${prompt}
        ---

        Enhanced Cinematic Prompt:
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: rewritePrompt,
        });
        return response.text.trim();
    } catch (e) {
        console.error("Error making prompt cinematic:", e);
        return prompt; // Return original prompt on error
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