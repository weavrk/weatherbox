import React, { useState } from 'react';
import { useDesignSystem } from '../contexts/DesignSystemContext';
import '../styles/design-system.css';

export function DesignSystemPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { tokens, updateTokens, applyTokens } = useDesignSystem();
  const [localTokens, setLocalTokens] = useState(tokens);

  React.useEffect(() => {
    setLocalTokens(tokens);
  }, [tokens]);

  const handleColorChange = (key: keyof typeof tokens, value: string) => {
    const updated = { ...localTokens, [key]: value };
    setLocalTokens(updated);
    updateTokens(updated);
  };

  const handleApply = () => {
    applyTokens();
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="design-system-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open Design System"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="design-system-overlay" onClick={() => setIsOpen(false)} />
          <div className="design-system-panel">
            <div className="design-system-header">
              <h2 className="page-header">Design System</h2>
              <button
                className="design-system-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="design-system-content">
              <div className="design-system-scrollable">
                <section className="design-system-section">
                  <h3 className="section-header">Colors</h3>
                  
                  <div className="color-picker-group">
                    <div className="color-picker-item">
                      <label className="label">Primary Color</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          value={localTokens.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="color-picker"
                        />
                        <input
                          type="text"
                          value={localTokens.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="color-input"
                        />
                      </div>
                    </div>

                    <div className="color-picker-item">
                      <label className="label">Secondary Color</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          value={localTokens.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="color-picker"
                        />
                        <input
                          type="text"
                          value={localTokens.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="color-input"
                        />
                      </div>
                    </div>

                    <div className="color-picker-item">
                      <label className="label">Accent Color</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          value={localTokens.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="color-picker"
                        />
                        <input
                          type="text"
                          value={localTokens.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="color-input"
                        />
                      </div>
                    </div>

                    <div className="color-picker-item">
                      <label className="label">Accent Color 2</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          value={localTokens.accent2}
                          onChange={(e) => handleColorChange('accent2', e.target.value)}
                          className="color-picker"
                        />
                        <input
                          type="text"
                          value={localTokens.accent2}
                          onChange={(e) => handleColorChange('accent2', e.target.value)}
                          className="color-input"
                        />
                      </div>
                    </div>

                    <div className="color-picker-item">
                      <label className="label">Button Primary</label>
                      <div className="color-picker-wrapper">
                        <input
                          type="color"
                          value={localTokens.buttonPrimary}
                          onChange={(e) => handleColorChange('buttonPrimary', e.target.value)}
                          className="color-picker"
                        />
                        <input
                          type="text"
                          value={localTokens.buttonPrimary}
                          onChange={(e) => handleColorChange('buttonPrimary', e.target.value)}
                          className="color-input"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div className="design-system-actions-bottom-sheet">
                <button
                  className="create-button-full"
                  onClick={handleApply}
                >
                  Apply Changes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

