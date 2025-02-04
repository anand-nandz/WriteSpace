import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Spinner, Select, SelectItem, Divider } from "@nextui-org/react";
import { axiosInstance } from "../../config/api/axiosInstance";
import { BlogCategories } from "../../utils/types/types";
import ReactMarkdown from 'react-markdown';
import { showToastMessage } from "../../utils/toast";
import { AxiosError } from "axios";
import { MoonIcon, SunIcon } from "lucide-react";

interface AIModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddContent?: (title: string, description: string) => void;
}
interface AIConversation {
    prompt: string;
    category: string;
    suggestion: string;
}

export default function AIModal({ isOpen, onClose, onAddContent }: AIModalProps) {
    const [isDark, setIsDark] = useState(true)
    const [promptInput, setPromptInput] = useState<string>('');
    const [aiSuggestion, setAiSuggestion] = useState<string>('');
    const [conversations, setConversations] = useState<AIConversation[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractTitleAndContent = (input: string) => {
        const titleMatch = input.match(/Title:\s*(.+?)(\n|$)/);
        const contentMatch = input.match(/Content:\s*(.+)/s); // Match everything after 'Content:' including line breaks

        const title = titleMatch ? titleMatch[1].trim() : 'No Title Found';
        const content = contentMatch ? contentMatch[1].trim() : 'No Content Found';

        return { title, content };
    };

    const irrelevantPromptResponses = [
        'The prompt does not appear to be suitable for generating blog content.',
        'Please provide a meaningful blog topic within a specific category.',
        'The input seems random or unrelated to blog writing.',
        'Only coherent, topic-focused prompts are accepted for blog content generation.'
    ];

    const validatePrompt = () => {
        const trimmedPrompt = promptInput.trim();

        if (!trimmedPrompt) {
            setError('Prompt cannot be empty');
            return false;
        }
        const invalidPatterns = [
            /^[a-z]+$/i,
            /^\d+$/,
            /^[^\w\s]+$/
        ];

        const isInvalidPrompt =
            invalidPatterns.some(pattern => pattern.test(promptInput)) ||
            promptInput.split(' ').length <= 2;

        if (isInvalidPrompt) {
            const randomErrorMessage = irrelevantPromptResponses[
                Math.floor(Math.random() * irrelevantPromptResponses.length)
            ];
            setError(randomErrorMessage);
            return false;
        }


        if (!selectedCategory) {
            setError('Please select a blog category');
            return false;
        }

        setError(null);
        return true;
    };

    const handlePromptSubmit = async () => {
        setAiSuggestion('');
        setIsLoading(false);
        if (!validatePrompt()) {
            return;
        }
        try {
            setIsLoading(true)
            const response = await axiosInstance.post('/ai-suggestion', {
                prompt: promptInput,
                category: selectedCategory,
            });

            const suggestion = response.data.suggestion;
            setAiSuggestion(suggestion);

            const newConversation: AIConversation = {
                prompt: promptInput,
                category: selectedCategory || '',
                suggestion: suggestion
            };
            setConversations([...conversations, newConversation]);
            setPromptInput('')
            setSelectedCategory(null);

        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Error fetching AI suggestion:', error);
                const errorMessage = error.response?.data?.message || 'Failed to generate content';
                setError(errorMessage);
            } else {
                setError('Failed to generate content');
            }
        } finally {
            setIsLoading(false)
            setSelectedCategory(null)
        }
    };

    const handleCopyContent = (suggestion: string) => {
        const data = extractTitleAndContent(suggestion);

        Promise.all([
            navigator.clipboard.writeText(data.title),
            navigator.clipboard.writeText(data.content)
        ]).then(() => {
            showToastMessage('Content copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            showToastMessage('Failed to copy content', 'error');
        });
    };

    const handleAddContent = (suggestion: string) => {
        if (onAddContent) {
            const data = extractTitleAndContent(suggestion);
            onAddContent(data.title, data.content);
            showToastMessage('Content added', 'success');
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => !open && onClose()}
            size="full"
            scrollBehavior="inside"
            classNames={{
                base: isDark ? "bg-[#1a1a1a]" : "bg-white",
                closeButton:
                    "absolute top-[15px] right-3 z-50 bg-gray-100 text-black hover:bg-gray-800 hover:text-white rounded-full p-1.5",
            }}
            hideCloseButton={false}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex relative justify-between items-center">
                            <span className={isDark ? "text-white" : "text-black"}>AI Assistant</span>
                            <Button
                                isIconOnly
                                variant="light"
                                onPress={() => setIsDark(!isDark)}
                                className={`absolute right-12 ${isDark ? "text-white" : "text-black"} `}
                            >
                                {isDark ? <SunIcon /> : <MoonIcon />}
                            </Button>
                        </ModalHeader>
                        <Divider className={`${!isDark ? "bg-[#1a1a1a] " : "bg-white"}`} />

                        <ModalBody className={`${isDark ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
                            {conversations.length === 0 ? (
                                <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
                                    <h2 className="text-2xl font-semibold mb-8">What can I help with?</h2>
                                    <div className="w-full max-w-2xl flex flex-col gap-4">
                                        <Input
                                            label="Prompt"
                                            value={promptInput}
                                            onChange={(e) => setPromptInput(e.target.value)}
                                            className="w-full"
                                        />
                                        <Select
                                            isRequired
                                            selectedKeys={selectedCategory ? [selectedCategory] : []}
                                            label="Category"
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            placeholder="Select category type"
                                            className="w-full"
                                        >
                                            {Object.values(BlogCategories)
                                                .filter((type) => type !== BlogCategories.ALL)
                                                .map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                        </Select>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {conversations.map((conversation, index) => (
                                        <div key={index} className={`p-4 rounded-lg ${isDark ? "bg-[#1a1a1a]" : "bg-gray-100"}`}>
                                            <div className="mb-2">
                                                <strong>Prompt:</strong> {conversation.prompt}
                                                <span className="ml-2 text-gray-500">(Category: {conversation.category})</span>
                                            </div>
                                            <ReactMarkdown>
                                                {conversation.suggestion
                                                    .replace(/^AI Suggestion:\s*.*?\n/, "")
                                                    .replace(/^Okay,\s*.*?\n/, "")
                                                    .trim()}
                                            </ReactMarkdown>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <Button size="sm" onClick={() => handleCopyContent(conversation.suggestion)}>
                                                    Copy Content
                                                </Button>
                                                <Button size="sm" color="primary" onClick={() => handleAddContent(conversation.suggestion)}>
                                                    Add to Blog
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && <div className="text-red-500 mb-2">{error}</div>}
                        </ModalBody>

                        <ModalFooter className="flex-col gap-4 sm:flex-row">
                            {conversations.length === 0 && !aiSuggestion ? null : (
                                <>
                                    <div className="w-full flex flex-col sm:flex-row gap-4">
                                        <Input
                                            label="Prompt"
                                            value={promptInput}
                                            onChange={(e) => setPromptInput(e.target.value)}
                                            className="w-full sm:flex-grow"
                                        />
                                        <Select
                                            isRequired
                                            selectedKeys={selectedCategory ? [selectedCategory] : []}
                                            label="Category"
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            placeholder="Select category"
                                            className="w-full sm:w-48"
                                        >
                                            {Object.values(BlogCategories)
                                                .filter((type) => type !== BlogCategories.ALL)
                                                .map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                        </Select>
                                    </div>
                                   
                                </>
                            )}
                             <Button
                                        className={`w-full sm:w-auto ${isDark ? "bg-gray-100 text-black" : "bg-gray-800 text-white"}`}
                                        onPress={handlePromptSubmit}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="ml-2">Generating..</span>
                                                <Spinner size="sm" className={isDark ? "black" : "white"} />
                                            </>
                                        ) : 'Generate'}
                                    </Button>
                        </ModalFooter>


                    </>
                )}
            </ModalContent>
        </Modal>
    )
}