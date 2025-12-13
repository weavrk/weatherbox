import React, { useState } from 'react';
import { useDesignSystem } from '../contexts/DesignSystemContext';
import '../styles/design-system.css';

export function DesignSystemPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { tokens, updateTokens, applyTokens } = useDesignSystem();
  const [localTokens, setLocalTokens] = useState(tokens);
  const [showDestructiveConfirm, setShowDestructiveConfirm] = useState(false);

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
                  <h3 className="section-header">Primitive Colors</h3>
                  
                  <div className="color-grid">
                    {/* Neutrals */}
                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.white}
                        onChange={(e) => handleColorChange('white', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">White</span>
                        <input
                          type="text"
                          value={localTokens.white}
                          onChange={(e) => handleColorChange('white', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.grayLight}
                        onChange={(e) => handleColorChange('grayLight', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Gray Light</span>
                        <input
                          type="text"
                          value={localTokens.grayLight}
                          onChange={(e) => handleColorChange('grayLight', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.grayDark}
                        onChange={(e) => handleColorChange('grayDark', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Gray Dark</span>
                        <input
                          type="text"
                          value={localTokens.grayDark}
                          onChange={(e) => handleColorChange('grayDark', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    {/* Cyan Tones */}
                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.cyanLight}
                        onChange={(e) => handleColorChange('cyanLight', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Cyan Light</span>
                        <input
                          type="text"
                          value={localTokens.cyanLight}
                          onChange={(e) => handleColorChange('cyanLight', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.cyanDark}
                        onChange={(e) => handleColorChange('cyanDark', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Cyan Dark</span>
                        <input
                          type="text"
                          value={localTokens.cyanDark}
                          onChange={(e) => handleColorChange('cyanDark', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    {/* Magenta Tones */}
                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.magentaLight}
                        onChange={(e) => handleColorChange('magentaLight', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Magenta Light</span>
                        <input
                          type="text"
                          value={localTokens.magentaLight}
                          onChange={(e) => handleColorChange('magentaLight', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.magentaDark}
                        onChange={(e) => handleColorChange('magentaDark', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Magenta Dark</span>
                        <input
                          type="text"
                          value={localTokens.magentaDark}
                          onChange={(e) => handleColorChange('magentaDark', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    {/* Yellow Tones */}
                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.yellowLight}
                        onChange={(e) => handleColorChange('yellowLight', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Yellow Light</span>
                        <input
                          type="text"
                          value={localTokens.yellowLight}
                          onChange={(e) => handleColorChange('yellowLight', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.yellowDark}
                        onChange={(e) => handleColorChange('yellowDark', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Yellow Dark</span>
                        <input
                          type="text"
                          value={localTokens.yellowDark}
                          onChange={(e) => handleColorChange('yellowDark', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="design-system-section">
                  <h3 className="section-header">Semantic Colors</h3>
                  
                  <div className="color-grid">
                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.brandPrimary}
                        onChange={(e) => handleColorChange('brandPrimary', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Brand Primary</span>
                        <input
                          type="text"
                          value={localTokens.brandPrimary}
                          onChange={(e) => handleColorChange('brandPrimary', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Primary</span>
                        <input
                          type="text"
                          value={localTokens.primary}
                          onChange={(e) => handleColorChange('primary', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Secondary</span>
                        <input
                          type="text"
                          value={localTokens.secondary}
                          onChange={(e) => handleColorChange('secondary', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.tertiary}
                        onChange={(e) => handleColorChange('tertiary', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Tertiary</span>
                        <input
                          type="text"
                          value={localTokens.tertiary}
                          onChange={(e) => handleColorChange('tertiary', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Accent</span>
                        <input
                          type="text"
                          value={localTokens.accent}
                          onChange={(e) => handleColorChange('accent', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.accent2}
                        onChange={(e) => handleColorChange('accent2', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Accent 2</span>
                        <input
                          type="text"
                          value={localTokens.accent2}
                          onChange={(e) => handleColorChange('accent2', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.accent3}
                        onChange={(e) => handleColorChange('accent3', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Accent 3</span>
                        <input
                          type="text"
                          value={localTokens.accent3}
                          onChange={(e) => handleColorChange('accent3', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>

                    <div className="color-swatch-card">
                      <input
                        type="color"
                        value={localTokens.buttonPrimary}
                        onChange={(e) => handleColorChange('buttonPrimary', e.target.value)}
                        className="color-swatch"
                      />
                      <div className="color-info">
                        <span className="color-name">Button Primary</span>
                        <input
                          type="text"
                          value={localTokens.buttonPrimary}
                          onChange={(e) => handleColorChange('buttonPrimary', e.target.value)}
                          className="color-hex"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="design-system-section">
                  <h3 className="section-header">Button Components</h3>
                  
                  <div className="button-components-demo">
                    <div className="button-demo-item">
                      <h4 className="button-demo-label">Primary Button</h4>
                      <button className="ds-button-primary">
                        Save
                      </button>
                      <p className="button-demo-description">Full-width button with neumorphic styling. Used for primary actions like saving profiles.</p>
                    </div>

                    <div className="button-demo-item">
                      <h4 className="button-demo-label">Destructive Button</h4>
                      {!showDestructiveConfirm ? (
                        <button 
                          className="ds-button-destructive"
                          onClick={() => setShowDestructiveConfirm(true)}
                        >
                          Delete Profile
                        </button>
                      ) : (
                        <div className="ds-destructive-confirm">
                          <span className="ds-destructive-confirm-text">Are you sure?</span>
                          <div className="ds-destructive-confirm-buttons">
                            <button 
                              className="ds-button-confirm-destructive"
                              onClick={() => {
                                setShowDestructiveConfirm(false);
                                // In real usage, this would trigger the destructive action
                              }}
                            >
                              Yes
                            </button>
                            <button 
                              className="ds-button-cancel-destructive"
                              onClick={() => setShowDestructiveConfirm(false)}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )}
                      <p className="button-demo-description">Button with built-in "Are you sure?" confirmation. Used for destructive actions like deleting profiles.</p>
                    </div>

                    <div className="button-demo-item">
                      <h4 className="button-demo-label">Secondary Button</h4>
                      <button className="ds-button-secondary">
                        Cancel
                      </button>
                      <p className="button-demo-description">Customizable button with same attributes as primary. Colors can be customized in the future.</p>
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

