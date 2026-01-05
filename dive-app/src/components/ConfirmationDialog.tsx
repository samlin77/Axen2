import { useState } from 'react';
import type { ConfirmationGate } from '../services/agent-flow';
import './ConfirmationDialog.css';

interface ConfirmationDialogProps {
  gate: ConfirmationGate;
  onApprove: () => void;
  onReject: () => void;
}

export function ConfirmationDialog({ gate, onApprove, onReject }: ConfirmationDialogProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return '#b54a35';
      case 'medium':
        return '#d4a574';
      case 'low':
        return '#6fa372';
      default:
        return '#7d6b56';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog">
        {/* Header */}
        <div className="confirmation-header">
          <span className="confirmation-risk-icon">{getRiskIcon(gate.risk)}</span>
          <h3 className="confirmation-title">Action Confirmation Required</h3>
        </div>

        {/* Risk Badge */}
        <div className="confirmation-risk-badge" style={{ backgroundColor: getRiskColor(gate.risk) }}>
          {gate.risk.toUpperCase()} RISK
        </div>

        {/* Message */}
        <div className="confirmation-message">
          <p>The agent wants to perform the following action:</p>
          <div className="confirmation-action-preview">
            {gate.message.split('\n')[0]}
          </div>
        </div>

        {/* Details Toggle */}
        <button
          className="confirmation-details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '▼ Hide Details' : '▶ Show Details'}
        </button>

        {/* Details (Expandable) */}
        {showDetails && (
          <div className="confirmation-details">
            <div className="confirmation-detail-section">
              <div className="confirmation-detail-label">Server</div>
              <div className="confirmation-detail-value">{gate.action.serverId}</div>
            </div>
            <div className="confirmation-detail-section">
              <div className="confirmation-detail-label">Tool</div>
              <div className="confirmation-detail-value">{gate.action.toolName}</div>
            </div>
            <div className="confirmation-detail-section">
              <div className="confirmation-detail-label">Arguments</div>
              <pre className="confirmation-detail-args">
                {JSON.stringify(gate.action.args, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="confirmation-actions">
          <button className="confirmation-button confirmation-reject" onClick={onReject}>
            Cancel
          </button>
          <button className="confirmation-button confirmation-approve" onClick={onApprove}>
            Approve & Continue
          </button>
        </div>

        {/* Warning for High Risk */}
        {gate.risk === 'high' && (
          <div className="confirmation-warning">
            ⚠️ This action cannot be undone. Please review carefully before approving.
          </div>
        )}
      </div>
    </div>
  );
}
