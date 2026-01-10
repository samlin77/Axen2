import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log('Gemini API Key loaded:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');

if (!API_KEY) {
  console.error('VITE_GEMINI_API_KEY is not set in .env file');
  throw new Error('VITE_GEMINI_API_KEY is not set in .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: any;
}

export class GeminiService {
  private model;
  private chat;
  private availableTools: MCPTool[] = [];

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview'
    });
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });
  }

  setAvailableTools(tools: MCPTool[]) {
    // Only update if tools actually changed
    const toolsChanged = JSON.stringify(this.availableTools) !== JSON.stringify(tools);
    if (!toolsChanged) {
      return;
    }

    this.availableTools = tools;

    // Convert MCP tools to Gemini function declarations
    const functionDeclarations = tools.map(tool => ({
      name: tool.name,
      description: tool.description || `Execute ${tool.name}`,
      parameters: {
        type: "object",
        properties: tool.inputSchema.properties || {},
        required: tool.inputSchema.required || [],
      },
    }));

    console.log(`[Gemini] Updating tools (${tools.length} tools):`, functionDeclarations);

    // Recreate model with tools
    this.model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] as any : undefined,
    });

    // DON'T restart chat - keep conversation history
    // Only recreate chat if it doesn't exist
    if (!this.chat) {
      this.chat = this.model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 2000,
        },
      });
    }

    console.log(`[Gemini] Configured with ${tools.length} MCP tools`);
  }

  async sendMessage(message: string): Promise<string> {
    try {
      console.log('Sending message to Gemini:', message);
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      console.log('Gemini response received:', text.substring(0, 50) + '...');
      return text;
    } catch (error) {
      console.error('Gemini API error details:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get response from Gemini');
    }
  }

  async *sendMessageStream(
    message: string,
    onToolCall?: (toolName: string, args: any) => Promise<any>
  ): AsyncGenerator<string> {
    try {
      console.log('[Gemini] Sending message with tool support:', message.substring(0, 100));
      const result = await this.chat.sendMessageStream(message);

      for await (const chunk of result.stream) {
        // Debug: log the entire chunk structure
        console.log('[Gemini] Raw chunk:', JSON.stringify(chunk, null, 2));

        // Try to get text first
        let chunkText = '';
        try {
          chunkText = chunk.text();
          console.log('[Gemini] chunk.text():', chunkText);
        } catch (e) {
          console.log('[Gemini] chunk.text() failed:', e);
          // text() might fail if there are function calls
        }

        // Check if the response contains function calls
        let functionCalls: any = undefined;
        try {
          functionCalls = chunk.functionCalls();
          console.log('[Gemini] chunk.functionCalls():', functionCalls);
        } catch (e) {
          console.log('[Gemini] chunk.functionCalls() failed:', e);
        }

        console.log('[Gemini] Chunk received - text:', chunkText ? 'yes' : 'no', 'functionCalls:', functionCalls?.length || 0);

        if (functionCalls && functionCalls.length > 0 && onToolCall) {
          for (const call of functionCalls) {
            console.log('[Gemini] Function call detected:', call.name, call.args);
            yield `\n\n🔧 **Calling tool: ${call.name}**\n`;
            yield `Arguments: \`${JSON.stringify(call.args)}\`\n\n`;

            try {
              // Execute the tool
              const toolResult = await onToolCall(call.name, call.args);
              console.log('[Gemini] Tool result:', toolResult);

              // Extract and display the actual file content if available
              let fileContent = '';
              if (toolResult && typeof toolResult === 'object') {
                if ('content' in toolResult) {
                  fileContent = toolResult.content as string;
                }
              }

              if (fileContent) {
                yield `✅ **File Content:**\n\n${fileContent}\n\n`;
                yield `---\n\n**Summary:** Successfully read the file. The content is displayed above.\n`;
              } else {
                yield `✅ **Result:**\n\`\`\`json\n${JSON.stringify(toolResult, null, 2)}\n\`\`\`\n\n`;
              }
            } catch (toolError) {
              console.error('[Gemini] Tool execution error:', toolError);
              yield `❌ **Error executing tool:**\n${toolError}\n\n`;
            }
          }
        } else if (chunkText) {
          // Regular text response
          yield chunkText;
        }
      }

      console.log('[Gemini] Stream complete');
    } catch (error) {
      console.error('Gemini API streaming error:', error);
      throw new Error('Failed to stream response from Gemini');
    }
  }

  resetChat() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview'
    });
    this.chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });
  }
}

// Export a singleton instance
export const geminiService = new GeminiService();
