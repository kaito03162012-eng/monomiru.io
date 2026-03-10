import { GoogleGenAI, Type } from "@google/genai";

export interface AIResult {
  identifiedItem: {
    brand: string;
    name: string;
    estimatedPrice: string;
    description: string;
    advice: string;
  };
  alternativeItem?: {
    brand: string;
    name: string;
    estimatedPrice: string;
    reason: string;
  };
  nearbyStores: {
    name: string;
    reason: string;
    searchQuery: string;
  }[];
}

export async function analyzeImage(
  base64Image: string,
  lat: number | null,
  lng: number | null,
  savingsMode: boolean,
): Promise<AIResult> {
  // Netlifyでの環境変数設定を回避するため、教えていただいたキーを直接プログラムに埋め込んでいます
  const apiKey = "AIzaSyD1npjIkSeCB1VJfIvAzddjjfb9BU0gA7I";
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert personal shopper and visual search assistant.
    I have provided an image of an item (clothing, furniture, etc.).
    ${lat && lng ? `My current location is Latitude: ${lat}, Longitude: ${lng}.` : ""}

    1. Identify the item in the image. Provide the likely Brand, Model/Name, an estimated price, a short description, and a useful piece of advice (e.g., styling tips, maintenance, or buying guide).
    ${savingsMode ? `2. The user wants to save money. Suggest a highly-rated, cheaper alternative (generic or affordable brand) that has a very similar design. Provide the Brand, Model/Name, estimated price, and why it's a good alternative.` : ""}
    3. Based on my location and the identified item (or the alternative if Savings Mode is on), suggest 2-3 physical retail stores within walking distance or a short transit ride where I might find this item in stock. Provide the store name, a brief reason why they might carry it, and a search query for Google Maps (e.g. "Store Name near me").

    IMPORTANT: ALL text in the JSON response MUST be in Japanese (except for brand names if they are usually written in English).
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1],
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identifiedItem: {
            type: Type.OBJECT,
            properties: {
              brand: { type: Type.STRING },
              name: { type: Type.STRING },
              estimatedPrice: { type: Type.STRING },
              description: { type: Type.STRING },
              advice: { type: Type.STRING },
            },
            required: ["brand", "name", "estimatedPrice", "description", "advice"],
          },
          alternativeItem: {
            type: Type.OBJECT,
            properties: {
              brand: { type: Type.STRING },
              name: { type: Type.STRING },
              estimatedPrice: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
          },
          nearbyStores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING },
                searchQuery: { type: Type.STRING },
              },
              required: ["name", "reason", "searchQuery"],
            },
          },
        },
        required: ["identifiedItem", "nearbyStores"],
      },
    },
  });

  return JSON.parse(response.text || "{}") as AIResult;
}
