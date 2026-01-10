/**
 * Agent Flow Service
 *
 * Implements autonomous agentic flow architecture with:
 * - Reasoning loops (Thought → Action → Observation → Evaluation → Decision)
 * - Tool chain orchestration
 * - Self-correction and retry logic
 * - Confirmation gates for sensitive operations
 */

import { mcpService } from './mcp';

/**
 * Tool call interface
 */
export interface ToolCall {
  serverId: string;
  toolName: string;
  args: Record<string, unknown>;
}

/**
 * Agent step in reasoning loop
 */
export interface AgentStep {
  iteration: number;
  thought: string;           // Agent's reasoning
  action: ToolCall | 'DONE'; // Tool to call or completion
  observation: any;           // Tool result
  evaluation: string;         // Assessment of result
  timestamp: Date;
  error?: string;             // Error if tool failed
}

/**
 * Agent task status
 */
export type AgentTaskStatus = 'planning' | 'executing' | 'evaluating' | 'paused' | 'complete' | 'failed' | 'cancelled';

/**
 * Agent task
 */
export interface AgentTask {
  id: string;
  goal: string;
  context: Record<string, any>;
  steps: AgentStep[];
  status: AgentTaskStatus;
  maxIterations: number;
  currentIteration: number;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  retryable: boolean;
}

/**
 * Confirmation requirement
 */
export interface ConfirmationGate {
  required: boolean;
  message: string;
  action: ToolCall;
  risk: 'low' | 'medium' | 'high';
}

/**
 * Agent Flow Service
 */
export class AgentFlowService {
  private tasks: Map<string, AgentTask> = new Map();
  private pausedTasks: Set<string> = new Set();

  /**
   * Create a new agent task
   */
  createTask(goal: string, context: Record<string, any> = {}, maxIterations: number = 10): AgentTask {
    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      goal,
      context,
      steps: [],
      status: 'planning',
      maxIterations,
      currentIteration: 0,
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Execute an agent task with reasoning loop
   */
  async executeTask(
    task: AgentTask,
    reasoningCallback: (task: AgentTask) => Promise<AgentStep>,
    confirmationCallback?: (gate: ConfirmationGate) => Promise<boolean>
  ): Promise<AgentTask> {
    task.status = 'executing';

    try {
      while (task.currentIteration < task.maxIterations && task.status === 'executing') {
        // Check if task is paused
        if (this.pausedTasks.has(task.id)) {
          task.status = 'paused';
          break;
        }

        // Increment iteration
        task.currentIteration++;

        // Generate next step (reasoning callback generates Thought + Action)
        const step = await reasoningCallback(task);
        step.iteration = task.currentIteration;
        step.timestamp = new Date();

        // Check if task is done
        if (step.action === 'DONE') {
          task.status = 'complete';
          task.completedAt = new Date();
          task.result = step.observation;
          task.steps.push(step);
          break;
        }

        // Check if confirmation is required
        const confirmationGate = this.requiresConfirmation(step.action as ToolCall);
        if (confirmationGate.required && confirmationCallback) {
          const approved = await confirmationCallback(confirmationGate);
          if (!approved) {
            task.status = 'cancelled';
            task.error = 'User cancelled operation';
            task.completedAt = new Date();
            task.steps.push({
              ...step,
              observation: null,
              evaluation: 'User cancelled the operation',
              error: 'User cancelled',
            });
            break;
          }
        }

        // Execute action (tool call)
        const toolCall = step.action as ToolCall;
        const executionResult = await this.executeToolWithRetry(toolCall, 3);

        // Update observation
        step.observation = executionResult.result;
        step.error = executionResult.error;

        // Evaluate result
        if (executionResult.success) {
          step.evaluation = `Tool ${toolCall.toolName} executed successfully`;
        } else {
          step.evaluation = `Tool ${toolCall.toolName} failed: ${executionResult.error}`;

          // If error is not retryable, mark task as failed
          if (!executionResult.retryable) {
            task.status = 'failed';
            task.error = executionResult.error;
            task.completedAt = new Date();
          }
        }

        // Add step to task
        task.steps.push(step);

        // Check if task should continue (based on evaluation)
        const shouldContinue = await this.shouldContinue(task);
        if (!shouldContinue) {
          task.status = 'complete';
          task.completedAt = new Date();
          break;
        }

        // Prevent infinite loops
        if (task.currentIteration >= task.maxIterations) {
          task.status = 'failed';
          task.error = 'Maximum iterations reached';
          task.completedAt = new Date();
        }
      }
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = new Date();
    }

    return task;
  }

  /**
   * Execute tool with retry logic
   */
  private async executeToolWithRetry(
    toolCall: ToolCall,
    maxRetries: number = 3
  ): Promise<ToolExecutionResult> {
    let lastError: string | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await mcpService.callTool(
          toolCall.serverId,
          toolCall.toolName,
          toolCall.args
        );

        return {
          success: true,
          result,
          retryable: false,
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`Tool execution failed (attempt ${attempt}/${maxRetries}):`, lastError);

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: lastError,
      retryable: false,
    };
  }

  /**
   * Check if action requires user confirmation
   */
  private requiresConfirmation(action: ToolCall): ConfirmationGate {
    const sensitiveTools = {
      // Gmail
      'gmail_send': { risk: 'high' as const, message: 'Send email' },
      'gmail_delete': { risk: 'high' as const, message: 'Delete email' },

      // Calendar
      'event_delete': { risk: 'medium' as const, message: 'Delete calendar event' },
      'event_create': { risk: 'low' as const, message: 'Create calendar event' },

      // Drive
      'drive_delete': { risk: 'high' as const, message: 'Delete file' },
      'drive_share': { risk: 'medium' as const, message: 'Share file' },
      'drive_upload': { risk: 'low' as const, message: 'Upload file' },

      // Docs/Sheets
      'docs_update': { risk: 'medium' as const, message: 'Update document' },
      'sheets_update': { risk: 'medium' as const, message: 'Update spreadsheet' },
    };

    const toolConfig = sensitiveTools[action.toolName as keyof typeof sensitiveTools];

    if (toolConfig) {
      return {
        required: true,
        message: `${toolConfig.message}: ${JSON.stringify(action.args, null, 2)}`,
        action,
        risk: toolConfig.risk,
      };
    }

    return {
      required: false,
      message: '',
      action,
      risk: 'low',
    };
  }

  /**
   * Evaluate if task should continue
   */
  private async shouldContinue(task: AgentTask): Promise<boolean> {
    // If task is in failed/complete state, don't continue
    if (task.status === 'failed' || task.status === 'complete' || task.status === 'cancelled') {
      return false;
    }

    // If max iterations reached, don't continue
    if (task.currentIteration >= task.maxIterations) {
      return false;
    }

    // Check last step
    const lastStep = task.steps[task.steps.length - 1];
    if (!lastStep) {
      return true;
    }

    // If last action was DONE, don't continue
    if (lastStep.action === 'DONE') {
      return false;
    }

    // If last step had non-retryable error, don't continue
    if (lastStep.error && !lastStep.evaluation.includes('retry')) {
      return false;
    }

    return true;
  }

  /**
   * Pause a running task
   */
  pauseTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.status === 'executing') {
      this.pausedTasks.add(taskId);
    }
  }

  /**
   * Resume a paused task
   */
  resumeTask(taskId: string): void {
    this.pausedTasks.delete(taskId);
    const task = this.tasks.get(taskId);
    if (task && task.status === 'paused') {
      task.status = 'executing';
    }
  }

  /**
   * Cancel a task
   */
  cancelTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'cancelled';
      task.error = 'Cancelled by user';
      task.completedAt = new Date();
      this.pausedTasks.delete(taskId);
    }
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): AgentTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Clear completed tasks
   */
  clearCompletedTasks(): void {
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.status === 'complete' || task.status === 'failed' || task.status === 'cancelled') {
        this.tasks.delete(taskId);
      }
    }
  }

  /**
   * Determine if user request should use agentic flow
   */
  async shouldUseAgenticFlow(userMessage: string, availableTools: any[]): Promise<boolean> {
    // Keywords that suggest multi-step workflow
    const agenticKeywords = [
      'schedule',
      'create event',
      'send email',
      'update spreadsheet',
      'summarize',
      'find and',
      'search and',
      'then',
      'after that',
    ];

    const lowerMessage = userMessage.toLowerCase();
    const hasAgenticKeyword = agenticKeywords.some(keyword => lowerMessage.includes(keyword));

    // Only use agentic flow if we have tools and the message suggests multi-step
    return availableTools.length > 0 && hasAgenticKeyword;
  }
}

// Export singleton instance
export const agentFlowService = new AgentFlowService();
