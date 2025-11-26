import { GoogleGenAI, Chat } from "@google/genai";

// Initialize Gemini Client
// Note: In a real production app, the API key should be handled via a backend proxy 
// to avoid exposing it in the frontend. For this demo, we use process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Interface for the context data used to generate a roadmap.
 * @interface ContextData
 */
interface ContextData {
  role: string;
  department: string;
  industry: string;
  experience: string;
  orgSize: string;
  archetype: string;
  anxiety: number;
  readiness: number;
  style: string;
}

/**
 * Generates a 30-60-90 day roadmap using the Gemini AI model.
 * @param {ContextData} ctx - The context data for the user.
 * @returns {Promise<any>} A promise that resolves to the generated roadmap.
 */
export const generateRoadmap = async (ctx: ContextData) => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      Je bent een senior AI-transformatie consultant die gespecialiseerd is in de ${ctx.industry} sector.
      Je adviseert een medewerker met het volgende profiel:
      
      --- PROFIEL ---
      Functie: ${ctx.role}
      Afdeling: ${ctx.department}
      Ervaring: ${ctx.experience}
      Organisatiegrootte: ${ctx.orgSize}
      
      --- PSYCHOLOGIE (KAI MODEL) ---
      Archetype: ${ctx.archetype}
      Cognitieve Stijl: ${ctx.style}
      AI Readiness Score: ${ctx.readiness}/100
      Angst Niveau (1-5): ${ctx.anxiety} (Waarbij 5 zeer angstig is)
      
      --- OPDRACHT ---
      Genereer een concreet, uitvoerbaar 30-60-90 dagen plan (in het Nederlands).
      
      RICHTLIJNEN:
      1. Toon empathie voor het angstniveau. Als angst hoog is, focus op veiligheid en kleine stappen.
      2. Pas het advies aan op de ${ctx.industry} sector. Noem specifieke use-cases die relevant zijn (bijv. Compliance voor Finance, Creativiteit voor Marketing).
      3. Houd rekening met de organisatiegrootte (${ctx.orgSize}). Bij een start-up mag het snel gaan, bij een enterprise moet er rekening gehouden worden met policy.
      4. Schrijf in de 'je' vorm, professioneel maar toegankelijk.
      
      Geef het antwoord puur als JSON string (zonder markdown formatting) in dit formaat:
      {
        "day30": { "focus": "Korte titel (max 5 woorden)", "actions": ["Actie 1", "Actie 2", "Actie 3"] },
        "day60": { "focus": "Korte titel (max 5 woorden)", "actions": ["Actie 1", "Actie 2", "Actie 3"] },
        "day90": { "focus": "Korte titel (max 5 woorden)", "actions": ["Actie 1", "Actie 2", "Actie 3"] }
      }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini generation error:", error);
    // Fallback content if AI fails
    return {
      day30: { focus: "Verkenning & Analyse", actions: ["Volg een basiscursus over AI in uw sector", "Breng uw huidige takenpakket in kaart", "Identificeer één veilige taak om te automatiseren"] },
      day60: { focus: "Experiment & Pilot", actions: ["Start een klein experiment met een AI-tool", "Evalueer de kwaliteit van de output kritisch", "Deel uw bevindingen met directe collega's"] },
      day90: { focus: "Integratie & Groei", actions: ["Maak de AI-tool onderdeel van uw vaste workflow", "Onderzoek geavanceerdere use-cases", "Help een collega met uw opgedane kennis"] }
    };
  }
};

/**
 * Creates a new chat instance with the Gemini AI model.
 * @param {any} context - The context data for the chat.
 * @returns {Chat} A new chat instance.
 */
export const createAssessmentChat = (context: any): Chat => {
  const systemInstruction = `
    You are a helpful AI assistant for the KAI-Model Platform. 
    You are chatting with a user who just completed their AI Readiness Assessment.
    
    Here is the user's profile and results:
    - Name: ${context.userName}
    - Role: ${context.role}
    - Department: ${context.department}
    - Industry: ${context.industry}
    - Org Size: ${context.orgSize}
    
    - Archetype: ${context.archetype} (${context.archetypeDescription})
    - AI Readiness Score: ${context.readinessScore}/100
    - Cognitive Style Score: ${context.styleScore} (-10 Adaptor to +10 Innovator)
    - Exposure Score: ${context.exposureScore}/100
    
    - Generated Roadmap Highlights:
    ${context.roadmap ? JSON.stringify(context.roadmap, null, 2) : "No roadmap generated yet."}
    
    Your goal is to help the user understand their results, explain the KAI model concepts (Adaptor vs Innovator), 
    and answer questions about their specific roadmap.
    Be encouraging, professional, and concise.
    Do not hallucinate scores that are not present.
    Answer in the same language the user asks (likely Dutch or English).
  `;

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction,
    }
  });
  
  return chat;
};