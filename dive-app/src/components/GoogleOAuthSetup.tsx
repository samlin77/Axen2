import { useState } from 'react';
import './GoogleOAuthSetup.css';

interface GoogleOAuthSetupProps {
  onComplete: (clientId: string, clientSecret: string) => void;
  onCancel: () => void;
}

export function GoogleOAuthSetup({ onComplete, onCancel }: GoogleOAuthSetupProps) {
  const [step, setStep] = useState<'welcome' | 'instructions' | 'credentials'>('welcome');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Validate credentials
    if (!clientId.trim()) {
      setError('Please enter Client ID');
      return;
    }
    if (!clientSecret.trim()) {
      setError('Please enter Client Secret');
      return;
    }
    if (!clientId.includes('.apps.googleusercontent.com')) {
      setError('Client ID format looks incorrect. Should end with .apps.googleusercontent.com');
      return;
    }
    if (!clientSecret.startsWith('GOCSPX-')) {
      setError('Client Secret format looks incorrect. Should start with GOCSPX-');
      return;
    }

    // All good!
    onComplete(clientId, clientSecret);
  };

  return (
    <div className="oauth-setup-overlay">
      <div className="oauth-setup-dialog">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <>
            <div className="oauth-setup-header">
              <h2>🔐 Connect Google Account</h2>
            </div>

            <div className="oauth-setup-content">
              <p>To access your Google Calendar, Gmail, Drive, Docs, and Sheets, you need to set up Google OAuth authentication.</p>

              <div className="oauth-info-box">
                <strong>What you'll need:</strong>
                <ul>
                  <li>A Google account</li>
                  <li>5 minutes to set up</li>
                  <li>Google Cloud Console access (free)</li>
                </ul>
              </div>

              <div className="oauth-security-note">
                <span className="oauth-security-icon">🛡️</span>
                <div>
                  <strong>Your data is secure</strong>
                  <p>OAuth credentials are stored locally on your device and encrypted. We never see your Google data.</p>
                </div>
              </div>
            </div>

            <div className="oauth-setup-actions">
              <button className="oauth-button oauth-button-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button className="oauth-button oauth-button-primary" onClick={() => setStep('instructions')}>
                Get Started →
              </button>
            </div>
          </>
        )}

        {/* Instructions Step */}
        {step === 'instructions' && (
          <>
            <div className="oauth-setup-header">
              <h2>📋 Setup Instructions</h2>
            </div>

            <div className="oauth-setup-content oauth-instructions">
              <div className="oauth-step">
                <div className="oauth-step-number">1</div>
                <div className="oauth-step-content">
                  <h3>Create Google Cloud Project</h3>
                  <p>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></p>
                  <p>Click "New Project" → Name it "Axen Desktop" → Click "Create"</p>
                </div>
              </div>

              <div className="oauth-step">
                <div className="oauth-step-number">2</div>
                <div className="oauth-step-content">
                  <h3>Enable Google Calendar API</h3>
                  <p>Go to "APIs & Services" → "Library"</p>
                  <p>Search for "Google Calendar API" → Click "Enable"</p>
                  <p><em>(Repeat for Gmail, Drive, Docs, Sheets if needed)</em></p>
                </div>
              </div>

              <div className="oauth-step">
                <div className="oauth-step-number">3</div>
                <div className="oauth-step-content">
                  <h3>Create OAuth Credentials</h3>
                  <p>Go to "APIs & Services" → "Credentials"</p>
                  <p>Click "Create Credentials" → "OAuth client ID"</p>
                  <p>Application type: <strong>Desktop app</strong></p>
                  <p>Name: "Axen Desktop Client" → Click "Create"</p>
                </div>
              </div>

              <div className="oauth-step">
                <div className="oauth-step-number">4</div>
                <div className="oauth-step-content">
                  <h3>Copy Your Credentials</h3>
                  <p>You'll see a dialog with:</p>
                  <ul>
                    <li><strong>Client ID</strong> (ends with .apps.googleusercontent.com)</li>
                    <li><strong>Client Secret</strong> (starts with GOCSPX-)</li>
                  </ul>
                  <p>Keep this window open - you'll paste them in the next step!</p>
                </div>
              </div>
            </div>

            <div className="oauth-setup-actions">
              <button className="oauth-button oauth-button-secondary" onClick={() => setStep('welcome')}>
                ← Back
              </button>
              <button className="oauth-button oauth-button-primary" onClick={() => setStep('credentials')}>
                I Have My Credentials →
              </button>
            </div>
          </>
        )}

        {/* Credentials Entry Step */}
        {step === 'credentials' && (
          <>
            <div className="oauth-setup-header">
              <h2>🔑 Enter Credentials</h2>
            </div>

            <div className="oauth-setup-content">
              <p>Paste the credentials from Google Cloud Console:</p>

              <div className="oauth-form-group">
                <label htmlFor="clientId">Client ID</label>
                <input
                  id="clientId"
                  type="text"
                  className="oauth-input"
                  placeholder="123456789-abc123.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setError('');
                  }}
                />
                <span className="oauth-input-hint">Ends with .apps.googleusercontent.com</span>
              </div>

              <div className="oauth-form-group">
                <label htmlFor="clientSecret">Client Secret</label>
                <input
                  id="clientSecret"
                  type="password"
                  className="oauth-input"
                  placeholder="GOCSPX-abc123xyz"
                  value={clientSecret}
                  onChange={(e) => {
                    setClientSecret(e.target.value);
                    setError('');
                  }}
                />
                <span className="oauth-input-hint">Starts with GOCSPX-</span>
              </div>

              {error && (
                <div className="oauth-error">
                  ⚠️ {error}
                </div>
              )}

              <div className="oauth-info-box">
                <strong>💡 Tip:</strong> These credentials will be saved securely on your device and used for all Google Workspace services (Calendar, Gmail, Drive, Docs, Sheets).
              </div>
            </div>

            <div className="oauth-setup-actions">
              <button className="oauth-button oauth-button-secondary" onClick={() => setStep('instructions')}>
                ← Back
              </button>
              <button
                className="oauth-button oauth-button-primary"
                onClick={handleSubmit}
                disabled={!clientId.trim() || !clientSecret.trim()}
              >
                Save & Connect
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
