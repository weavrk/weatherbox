import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DesignTokens {
  // Primitive Colors
  white: string;
  grayLight: string;
  grayDark: string;
  cyanLight: string;
  cyanDark: string;
  magentaLight: string;
  magentaDark: string;
  yellowLight: string;
  yellowDark: string;
  
  // Semantic Colors
  brandPrimary: string;
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  accent2: string;
  accent3: string;
  buttonPrimary: string;
}

interface DesignSystemContextType {
  tokens: DesignTokens;
  updateTokens: (tokens: Partial<DesignTokens>) => void;
  applyTokens: () => void;
}

const defaultTokens: DesignTokens = {
  // Primitive Colors
  white: '#FFFFFF',
  grayLight: '#6B6B6B',
  grayDark: '#1A1A1A',
  cyanLight: '#7EC8E3',
  cyanDark: '#4A90E2',
  magentaLight: '#F06292',
  magentaDark: '#D81B60',
  yellowLight: '#FFD54F',
  yellowDark: '#FFA000',
  
  // Semantic Colors (mapped to primitives)
  brandPrimary: '#7EC8E3', // Cyan-Light (Logo & Brand)
  primary: '#FFFFFF',      // White
  secondary: '#6B6B6B',    // Gray-Light
  tertiary: '#1A1A1A',     // Gray-Dark
  accent: '#7EC8E3',       // Cyan-Light
  accent2: '#F06292',      // Magenta-Light
  accent3: '#FFD54F',      // Yellow-Light
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
    
    // Primitive Colors
    root.style.setProperty('--white', tokensToApply.white);
    root.style.setProperty('--gray-light', tokensToApply.grayLight);
    root.style.setProperty('--gray-dark', tokensToApply.grayDark);
    root.style.setProperty('--cyan-light', tokensToApply.cyanLight);
    root.style.setProperty('--cyan-dark', tokensToApply.cyanDark);
    root.style.setProperty('--magenta-light', tokensToApply.magentaLight);
    root.style.setProperty('--magenta-dark', tokensToApply.magentaDark);
    root.style.setProperty('--yellow-light', tokensToApply.yellowLight);
    root.style.setProperty('--yellow-dark', tokensToApply.yellowDark);
    
    // Semantic Colors
    root.style.setProperty('--color-brand-primary', tokensToApply.brandPrimary);
    root.style.setProperty('--color-primary', tokensToApply.primary);
    root.style.setProperty('--color-secondary', tokensToApply.secondary);
    root.style.setProperty('--color-tertiary', tokensToApply.tertiary);
    root.style.setProperty('--color-accent', tokensToApply.accent);
    root.style.setProperty('--color-accent-2', tokensToApply.accent2);
    root.style.setProperty('--color-accent-3', tokensToApply.accent3);
    
    // Legacy mappings for existing CSS
    root.style.setProperty('--accent', tokensToApply.accent);
    root.style.setProperty('--accent-hover', tokensToApply.accent2);
    root.style.setProperty('--text-primary', tokensToApply.primary);
    root.style.setProperty('--text-secondary', tokensToApply.secondary);
    root.style.setProperty('--accent-secondary', tokensToApply.accent2);
    root.style.setProperty('--accent-tertiary', tokensToApply.accent3);
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

