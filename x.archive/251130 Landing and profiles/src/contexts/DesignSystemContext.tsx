import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DesignTokens {
  accent: string;
  primary: string;
  secondary: string;
  accent2: string;
  buttonPrimary: string;
}

interface DesignSystemContextType {
  tokens: DesignTokens;
  updateTokens: (tokens: Partial<DesignTokens>) => void;
  applyTokens: () => void;
}

const defaultTokens: DesignTokens = {
  accent: '#e91e63',
  primary: '#ffffff',
  secondary: '#b3b3b3',
  accent2: '#f06292',
  buttonPrimary: '#2a2a2a',
};

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(undefined);

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<DesignTokens>(defaultTokens);
  const [pendingTokens, setPendingTokens] = useState<DesignTokens>(defaultTokens);

  // Load saved tokens from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('designTokens');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTokens(parsed);
        setPendingTokens(parsed);
        applyTokensToDOM(parsed);
      } catch (e) {
        console.error('Failed to load design tokens:', e);
      }
    } else {
      applyTokensToDOM(defaultTokens);
    }
  }, []);

  const applyTokensToDOM = (tokensToApply: DesignTokens) => {
    const root = document.documentElement;
    root.style.setProperty('--accent', tokensToApply.accent);
    root.style.setProperty('--accent-hover', tokensToApply.accent2);
    root.style.setProperty('--text-primary', tokensToApply.primary);
    root.style.setProperty('--text-secondary', tokensToApply.secondary);
    root.style.setProperty('--accent-secondary', tokensToApply.accent2);
    root.style.setProperty('--button-primary', tokensToApply.buttonPrimary);
  };

  const updateTokens = (newTokens: Partial<DesignTokens>) => {
    setPendingTokens(prev => ({ ...prev, ...newTokens }));
  };

  const applyTokens = () => {
    setTokens(pendingTokens);
    applyTokensToDOM(pendingTokens);
    localStorage.setItem('designTokens', JSON.stringify(pendingTokens));
  };

  return (
    <DesignSystemContext.Provider value={{ tokens, updateTokens, applyTokens }}>
      {children}
    </DesignSystemContext.Provider>
  );
}

export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

