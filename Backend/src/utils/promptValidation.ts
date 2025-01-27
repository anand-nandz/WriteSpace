import { BlogCategories } from "../interfaces/commonInterface";
import { CustomError } from "./customError";
import HTTP_statusCode from "./enums/httpStatusCode";

export function validate(prompt: string, category: BlogCategories) {
    try {
        if (!prompt || prompt.trim() === '') {
            throw new CustomError("Prompts can't be empty", HTTP_statusCode.BadRequest)
        }
        if (!Object.values(BlogCategories).includes(category)) {
            throw new CustomError("Invalid blog category. Only blog-related content can be generated.", HTTP_statusCode.BadRequest)
        }

        const invalidPatterns = [
            /^[a-z]+$/i,  
            /^\d+$/,      
            /^[^\w\s]+$/  
        ];
        const isInvalidPrompt = 
        invalidPatterns.some(pattern => pattern.test(prompt)) || 
        prompt.split(' ').length <= 2;

        if (isInvalidPrompt) {
            throw new CustomError(`${irrelevantPromptResponses[Math.floor(Math.random() * irrelevantPromptResponses.length)]}`,HTTP_statusCode.BadRequest)
        }

    } catch (error) {

    }
}


const irrelevantPromptResponses = [
    'The prompt does not appear to be suitable for generating blog content.',
    'Please provide a meaningful blog topic within a specific category.',
    'The input seems random or unrelated to blog writing.',
    'Only coherent, topic-focused prompts are accepted for blog content generation.'
];