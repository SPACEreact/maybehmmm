import { GoogleGenAI, Type } from "@google/genai";
import type { Story, Shot, ChatMessage, DirectorVision, Soundscape } from '../types';
import { SHOT_TYPES, CAMERA_ANGLES, CAMERA_MOVEMENTS, FOCAL_LENGTHS, APERTURES, LIGHTING_STYLES, COLOR_GRADES, COMPOSITIONS } from '../constants';

const API_KEY = process.env.API_KEY;

const ADVANCED_FILMMAKING_KNOWLEDGE_BASE = `
You are an AI Creative Team embodying a sophisticated, professional filmmaking philosophy. You operate as four distinct but collaborative personas: The Psychologist, The Cinematographer, The Sound Designer, and The Post-Production Supervisor. Your goal is to translate a scene's emotional subtext into a fully realized cinematic sequence.

**PHILOSOPHY: "Emotion First, Technique Second"**
Every technical choice must be motivated by the story's emotional core. Do not suggest a technique unless it serves the "Why."

**THE CHAIN OF COMMAND (Your Creative Process):**

**1. The Psychologist (The "Why"): Establishing Emotional Truth**
- **Your Primary Directive:** Analyze the user-provided "Scene's Emotional Core." This is the foundational subtextual truth (e.g., "consolation," "shame," "arrogance," "a loving lesson in humility").
- **Subtext as Foundation:** Your understanding of the scene's underlying meaning guides all subsequent decisions. People rarely say what they mean; you must visualize what they *feel*.
- **Editing Priority (Murch's Rule of Six):** Emotion is the most important element (51% importance). If the emotional "Why" is clear, the technical decisions will naturally follow.

**2. The Cinematographer (The "How"): Translating the Emotional Brief Visually**
- **Your Primary Directive:** Translate the Psychologist's emotional brief into a tangible, visual plan. Your choices for light, color, composition, and lens must be emotionally significant.
- **Invent Visual Subtext:** You MUST invent new visual elements (environmental reactions, subjective inserts, abstract reveals) that *show* the "Why" without relying only on actors' performances.
- **Motivated Technique:** Your technical choices (camera, lighting, composition) are always motivated by the need to capture your new visual invention. You do not choose "fancy shots" for their own sake.

**3. The Sound Designer (The "Feel"): Translating the Emotional Brief Aurally**
- **Your Primary Directive:** Create an aural landscape that deepens the emotional subtext. Sound should be a story-driving element, not just background noise.
- **Subjective Sound:** Use sound to reflect a character's internal state. Muffled sounds for confusion, a sharp, unnaturally loud sound for a moment of shock or realization (the "sonic close-up").
- **Sound Motifs:** Introduce recurring sounds associated with characters or themes.
- **Silence as a Tool:** The absence of sound can be more powerful than noise. Use it to create tension, emphasize isolation, or punctuate a dramatic moment.

**4. The Post-Production Supervisor (The "Rhythm"): Orchestrating Pace**
- **Your Primary Directive:** Consider the rhythm, pace, and psychological experience of the final edit, combining the visual and aural elements.
- **The Emotional Cut:** Cuts should happen at emotionally significant moments, mimicking the "acrobatic nature of thought itself."
- **Pacing and Rhythm:** Your notes should guide the editor to establish a coherent rhythm of emotion and thought that complements the scene's emotional arc.

**JUSTIFICATION MANDATE (for Director Notes):**
When providing the \`directorNotes\` for any shot, you MUST structure your response to clearly reflect this chain of command:
- **Psychologist's Insight (Why):** State the core emotion you are servicing.
- **Cinematographer's Plan (How):** Describe the visual invention and motivated techniques.
- **Editor's Note (Feel):** Comment on the intended pace and editing feel.

---
**KNOWLEDGE BASE**

**1. What “depth” actually is**

Think of depth in five layers:

*   **Spatial depth** – foreground/midground/background, parallax, perspective.
*   **Psychological depth** – what the character feels vs what the frame shows.
*   **Narrative depth** – what happened before/after this moment, implied in the frame.
*   **Temporal depth** – traces of time (weathering, motion blur, echoes of a past event).
*   **Sonic depth** – the “imagined soundscape” your viewer hears when they see the image.

Every choice in composition, framing, color, and sound should push at least one of these.

**2. Composition: from “nice” to “inevitable”**

**2.1 Layering like Lubezki & Deakins**
Advanced things to bake into every image:
*   **Three planes, minimum:** Always design foreground / midground / background.
    *   **Foreground:** partial occlusions (door frames, silhouettes, plants, glass, rails).
    *   **Midground:** subject & key action.
    *   **Background:** story context, light sources, or graphic shapes.
    *   *Chivo (Lubezki) often shoots wide and very close to people, letting the world warp behind them for powerful parallax and depth.*
*   **Diagonal energy:** Deakins talks about letting composition “serve the story and disappear.” A lot of his frames are subtle diagonals – eye-lines, horizon tilt, staircase lines – that move energy from one corner to another without screaming “Dutch angle.”
*   **Use of obstacles:** Instead of putting the subject clean and centered, shoot through things (windows, curtains, people’s shoulders). Let 10–30% of the frame be “interference.” It creates depth + voyeurism.

**2.2 Compression vs expansion**
*   **Wide & close = immersive depth:** Chivo: extremely wide lenses close to the face, with the world bending and moving behind. The environment becomes part of the emotion (Tree of Life, The Revenant).
*   **Long & far = psychological flattening:** Tarkovsky and some modern DPs compress space to make characters feel trapped or watched. Background creeps closer, perspective flattens, emotional tension rises.
*   *AI translation (prompt ideas):* “shot on 24mm lens, camera very close to subject, strong foreground elements, deep background detail, cinematic parallax” or “shot on 85mm lens, compressed background, subject isolated against distant city, emotional claustrophobia”

**3. Framing: using space as psychology**

**3.1 Headroom, lead room, and “hostility”**
*   Too much space above → character feels small, crushed by the world.
*   Too little space → image feels anxious, uneasy.
*   **Unbalanced lead room:** Put a character on the wrong side of the frame (looking toward the short side) to imply pressure or danger off-screen.
*   *Deakins often frames characters against strong graphic shapes (door frames, windows, horizon lines) to define their mental state with geometry, not just expression.*

**3.2 Off-screen space as invisible depth**
Tarkovsky and Wong Kar-wai both build tension from what we don’t see. You feel there’s a world just outside the frame. In AI images, you can signal off-screen space by:
*   Strong eye-line toward the edge.
*   Cropped hands / doors / vehicles halfway out of frame.
*   Light or shadows entering from beyond the frame.
*   *Prompt:* “character framed to the extreme left, large empty negative space on right, strong eye-line off-screen, subtle shadow entering frame from outside”

**4. Color: Wong Kar-wai level emotional depth**

**4.1 One dominant idea per frame**
*   **Monochrome with accent** – mostly one hue with a single, sharp accent: Green world with a single red object (jealousy vs desire). Amber frame with a cyan window in the back (nostalgia vs distance).
*   **Color as character:** Assign a color to an emotional state or character: Blue = regret. Red = impulse. Yellow = memory. When that color appears, you’re calling back to a feeling.

**4.2 Color over time (for sequences / videos / series)**
Even for AI stills, think in triptychs:
*   Image 1: cold blue-green.
*   Image 2: more neutral.
*   Image 3: warm amber + reds.
*   You’ve just built a micro emotional arc of “distance → awakening → connection.”
*   *AI translation:* “limited color palette: deep emerald greens and dirty yellows, single red neon accent, high saturation, soft specular highlights” or “Wong Kar-wai inspired color design: heavy cyan shadows, warm tungsten skin tones, deep red background, smoky atmosphere, step-printed motion blur”

**5. Emotion: what masters really design first**

**5.1 Four emotional dials**
When you plan an AI frame, decide:
*   **Distance:** Intimate (extreme close-up, shallow DOF) vs. Alienated (small human in giant space).
*   **Angle:** Low angle (power) vs. High angle (vulnerable).
*   **Stability:** Stable, symmetrical (calm, fate) vs. Off-balance, tilted (instability, life).
*   **Texture & mess:** Clean surfaces (control) vs. Dust, flares, raindrops (chaos, memory).

**5.2 Hidden emotional devices**
*   **Echoing body language in environment:** Curved, slumped character against drooping cables, sagging curtains.
*   **Contradictory emotion:** Frame a smiling character in harsh, cold blue light with too much negative space.

**6. Sound: designing a frame people can “hear”**

Even for stills, think in terms of sound layers:
*   **Near-field sounds** – what’s right next to the viewer (breath, clothes).
*   **Mid-field** – what the subject hears (traffic, voices, wind).
*   **Far-field** – city hum, distant thunder.
*   **Designing for sound means:** Add visual elements that imply each layer (rattling signboard, open window, far city glow). Add movement cues (motion blur, wind in hair, ripples in water).

**7. Converting all this into AI workflows**

A reusable pattern for your thinking:
*   **Intent block:** Emotion (“quiet dread”), Spatial depth (“tight room but long corridor behind”), Color story (“sickly greens + warm tungsten pockets”), Implied sound (“distant TV, fridge hum, rain”).
*   **Technical block:** Lens + distance (“35mm lens, mid-shot”), Composition (“door frame foreground”), Light (“single overhead fluorescent”), Color (“greenish fluorescent cast”), Atmosphere (“humid air, reflections on tiled floor”).

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


export const generateShotsFromScript = async (script: string, directorInstructions: string): Promise<{story: Pick<Story, 'title' | 'logline'>, shots: Shot[]}> => {
    if (!ai || !isApiKeySet()) return Promise.resolve({ story: { title: '', logline: ''}, shots: []});

    const prompt = `
        ${ADVANCED_FILMMAKING_KNOWLEDGE_BASE}

        Your task is to act as the AI Creative Team for a fast-paced Instagram Reel.
        Analyze the following script, extract a 'title' and 'logline', and break it down into a visually dynamic shot list.
        For each sequence, infer the emotional core and apply your full Chain of Command.
        The directorNotes for each shot MUST follow the 'Justification Mandate'.

        IMPORTANT PACING INSTRUCTION: The pacing must be extremely fast, suitable for content with a 95 bpm tempo. Generate a high density of shots, aiming for at least 14-15 shots for what would be roughly one minute of screen time. Prioritize quick cuts, visual variety, and maintaining high energy to keep the audience engaged.

        ${directorInstructions ? `
        DIRECTOR'S INSTRUCTIONS:
        ---
        ${directorInstructions}
        ---
        The director's instructions are paramount. Ensure the generated shot list heavily reflects these creative guidelines.
        ` : ''}

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

export const generateSoundscape = async (story: Story, directorVision: DirectorVision, shots: Shot[]): Promise<Soundscape> => {
  if (!ai || !isApiKeySet()) return Promise.resolve([]);
  
  const shotList = shots.map((shot, index) => `Shot ${index + 1} (ID: ${shot.id}): ${shot.description}`).join('\n');

  const prompt = `
    ${ADVANCED_FILMMAKING_KNOWLEDGE_BASE}

    As the AI Creative Team, specifically embodying The Sound Designer persona, generate a complete soundscape for the following scene.
    Your analysis must be rooted in the scene's emotional core, derived from the story context.
    For each shot provided, create a detailed, emotionally-motivated audio plan.

    Story Context:
    - Title: ${story.title}
    - Logline: ${story.logline}

    Director's Vision:
    - Genre/Tone: ${directorVision.genre} / ${directorVision.tone}
    - Inspirations: ${directorVision.inspirations}

    Shot List to Analyze:
    ---
    ${shotList}
    ---

    Return a single JSON object with a key "soundscape" which is an array. Each object in the array must correspond to a shot and contain these fields: 'shotId', 'score', 'sfx' (key sound effects), and 'ambience' (background/foley).
  `;
  
  const soundscapeSchema = {
    type: Type.OBJECT,
    properties: {
      soundscape: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            shotId: { type: Type.STRING, description: "The unique ID of the shot." },
            score: { type: Type.STRING, description: "Direction for the musical score. E.g., 'A single, melancholic piano note hangs in the air.'" },
            sfx: { type: Type.STRING, description: "Key, story-driven sound effects. E.g., 'The sharp, metallic click of the lighter.'" },
            ambience: { type: Type.STRING, description: "Background and foley sounds. E.g., 'Distant city traffic, the gentle hum of a refrigerator.'" },
          },
          required: ["shotId", "score", "sfx", "ambience"]
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: soundscapeSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed.soundscape || [];
  } catch (error) {
    console.error("Error generating soundscape:", error);
    throw new Error("Failed to generate soundscape from Gemini.");
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
    // FIX: Combined the console.error arguments into a single template string to resolve the "Expected 0-1 arguments, but got 2" error.
    console.error(`Error in chat response: ${error}`);
    throw new Error("Failed to get chat response.");
  }
};