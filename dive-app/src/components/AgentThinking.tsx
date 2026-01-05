import { useState } from 'react';
import type { AgentTask, AgentStep } from '../services/agent-flow';
import './AgentThinking.css';

interface AgentThinkingProps {
  task: AgentTask;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

export function AgentThinking({ task, onPause, onResume, onCancel }: AgentThinkingProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (iteration: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(iteration)) {
      newExpanded.delete(iteration);
    } else {
      newExpanded.add(iteration);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning':
        return '🧠';
      case 'executing':
        return '⚡';
      case 'evaluating':
        return '🔍';
      case 'complete':
        return '✅';
      case 'failed':
        return '❌';
      case 'paused':
        return '⏸';
      case 'cancelled':
        return '🚫';
      default:
        return '•';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
      case 'executing':
      case 'evaluating':
        return '#a67c52';
      case 'complete':
        return '#6fa372';
      case 'failed':
      case 'cancelled':
        return '#b54a35';
      case 'paused':
        return '#d4c8aa';
      default:
        return '#7d6b56';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionDisplay = (action: AgentStep['action']) => {
    if (action === 'DONE') {
      return { type: 'Done', details: 'Task completed' };
    }
    return {
      type: 'Tool Call',
      details: `${action.serverId}:${action.toolName}`,
    };
  };

  return (
    <div className="agent-thinking">
      {/* Task Header */}
      <div className="agent-task-header">
        <div className="agent-task-info">
          <span className="agent-status-icon">{getStatusIcon(task.status)}</span>
          <div className="agent-task-details">
            <h3 className="agent-task-goal">{task.goal}</h3>
            <div className="agent-task-meta">
              <span className="agent-task-status" style={{ color: getStatusColor(task.status) }}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </span>
              <span className="agent-task-iterations">
                Iteration {task.currentIteration} / {task.maxIterations}
              </span>
              {task.completedAt && (
                <span className="agent-task-duration">
                  {Math.round((task.completedAt.getTime() - task.createdAt.getTime()) / 1000)}s
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Task Controls */}
        <div className="agent-task-controls">
          {task.status === 'executing' && onPause && (
            <button className="agent-control-button" onClick={onPause}>
              Pause
            </button>
          )}
          {task.status === 'paused' && onResume && (
            <button className="agent-control-button" onClick={onResume}>
              Resume
            </button>
          )}
          {(task.status === 'executing' || task.status === 'paused') && onCancel && (
            <button className="agent-control-button agent-control-cancel" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {task.error && (
        <div className="agent-error">
          <strong>Error:</strong> {task.error}
        </div>
      )}

      {/* Steps Timeline */}
      <div className="agent-steps-timeline">
        {task.steps.map((step) => (
          <div
            key={step.iteration}
            className={`agent-step ${expandedSteps.has(step.iteration) ? 'expanded' : 'collapsed'}`}
          >
            {/* Step Header */}
            <div className="agent-step-header" onClick={() => toggleStep(step.iteration)}>
              <div className="agent-step-summary">
                <span className="agent-step-number">#{step.iteration}</span>
                <span className="agent-step-thought-preview">{step.thought}</span>
              </div>
              <div className="agent-step-meta">
                <span className="agent-step-time">{formatTimestamp(step.timestamp)}</span>
                <span className="agent-step-expand-icon">
                  {expandedSteps.has(step.iteration) ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {/* Step Details (Expanded) */}
            {expandedSteps.has(step.iteration) && (
              <div className="agent-step-details">
                {/* Thought */}
                <div className="agent-step-section">
                  <div className="agent-step-label">💭 Thought</div>
                  <div className="agent-step-content">{step.thought}</div>
                </div>

                {/* Action */}
                <div className="agent-step-section">
                  <div className="agent-step-label">⚡ Action</div>
                  <div className="agent-step-content">
                    <div className="agent-action-type">{getActionDisplay(step.action).type}</div>
                    <div className="agent-action-details">{getActionDisplay(step.action).details}</div>
                    {step.action !== 'DONE' && (
                      <pre className="agent-action-args">
                        {JSON.stringify(step.action.args, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Observation */}
                <div className="agent-step-section">
                  <div className="agent-step-label">👁 Observation</div>
                  <div className="agent-step-content">
                    {step.error ? (
                      <div className="agent-observation-error">{step.error}</div>
                    ) : step.observation !== null && step.observation !== undefined ? (
                      <pre className="agent-observation-result">
                        {typeof step.observation === 'string'
                          ? step.observation
                          : JSON.stringify(step.observation, null, 2)}
                      </pre>
                    ) : (
                      <div className="agent-observation-empty">No result</div>
                    )}
                  </div>
                </div>

                {/* Evaluation */}
                <div className="agent-step-section">
                  <div className="agent-step-label">🔍 Evaluation</div>
                  <div className="agent-step-content">{step.evaluation}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Indicator for Active Tasks */}
      {task.status === 'executing' && (
        <div className="agent-progress">
          <div className="agent-progress-bar">
            <div
              className="agent-progress-fill"
              style={{ width: `${(task.currentIteration / task.maxIterations) * 100}%` }}
            />
          </div>
          <div className="agent-progress-text">Thinking...</div>
        </div>
      )}
    </div>
  );
}
