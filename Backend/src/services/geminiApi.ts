const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
import dotenv from 'dotenv';
import { BlogCategories } from '../interfaces/commonInterface';
import { CustomError } from '../utils/customError';
import HTTP_statusCode from '../utils/enums/httpStatusCode';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

export async function promptApi(prompt: string, category?: BlogCategories): Promise<string> {

    const detailedSystemInstructions = `
    Blog Post Generation Guidelines:
    - Prompt: "${prompt}"
    - Category: "${category}"
    - Title: Generate a compelling, category-specific title
    - Content Requirements:
      * Minimum 1500 words
      * Professional tone
      * Category-relevant content
      * Structured format with clear sections

    Output Format:
    Title: [Engaging Blog Post Title]
    Category: [Selected Category]
    Content: [Comprehensive blog post content]
    `;


    const chatSession = model.startChat({
        generationConfig,
        history: [
        ],
    });
    const result = await chatSession.sendMessage(detailedSystemInstructions);

    const generatedContent = result.response.text();
    const wordCount = generatedContent.split(/\s+/).length;
    if (wordCount < 1000) {
        throw new CustomError('Generated content is too short', HTTP_statusCode.BadRequest);
    }

    return generatedContent;
}

