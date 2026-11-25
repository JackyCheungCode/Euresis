export type AiMessage = { role: "system" | "user" | "assistant"; content: string };
export type AiTextRequest = { messages: AiMessage[]; temperature?: number; maxTokens?: number };
export type AiTextResponse = { text: string; model: string; usage?: { inputTokens: number; outputTokens: number } };
export interface AiProvider { generateText(request: AiTextRequest): Promise<AiTextResponse> }
