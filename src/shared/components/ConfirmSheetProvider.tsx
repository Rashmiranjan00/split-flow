import React, { createContext, useCallback, useState } from 'react';
import { ConfirmSheet, type ConfirmSheetConfig } from './ConfirmSheet';

interface ConfirmSheetContextValue {
  show: (config: ConfirmSheetConfig) => void;
}

export const ConfirmSheetContext = createContext<ConfirmSheetContextValue>({
  show: () => {},
});

export const ConfirmSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ConfirmSheetConfig | null>(null);

  const show = useCallback((cfg: ConfirmSheetConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setConfig(null);
  }, []);

  return (
    <ConfirmSheetContext.Provider value={{ show }}>
      {children}
      <ConfirmSheet visible={visible} config={config} onDismiss={handleDismiss} />
    </ConfirmSheetContext.Provider>
  );
};
