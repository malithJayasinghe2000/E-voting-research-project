import React, { createContext, useContext, useState } from 'react';

interface HelpContextType {
  showHelpButton: boolean;
  setShowHelpButton: (value: boolean) => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

interface HelpProviderProps {
  children: React.ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [showHelpButton, setShowHelpButton] = useState(false);

  return (
    <HelpContext.Provider value={{ showHelpButton, setShowHelpButton }}>
      {children}
    </HelpContext.Provider>
  );
};

export const useHelp = (): HelpContextType => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};
