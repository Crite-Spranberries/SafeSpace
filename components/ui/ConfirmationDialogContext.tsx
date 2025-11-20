import React, { createContext, useContext, useState, ReactNode } from 'react';
import ConfirmationDialog from './ConfirmationDialog';

type Options = {
  title: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
};

type ContextType = {
  showConfirmation: (opts: Options) => Promise<boolean>;
};

const ConfirmationContext = createContext<ContextType | undefined>(undefined);

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [opts, setOpts] = useState<(Options & { resolve?: (v: boolean) => void }) | null>(null);

  const showConfirmation = (o: Options) => {
    return new Promise<boolean>((resolve) => {
      setOpts({ ...o, resolve });
    });
  };

  const handleClose = (result: boolean) => {
    if (opts?.resolve) opts.resolve(result);
    setOpts(null);
  };

  return (
    <ConfirmationContext.Provider value={{ showConfirmation }}>
      {children}
      <ConfirmationDialog
        isOpen={!!opts}
        title={opts?.title ?? ''}
        description={opts?.description}
        cancelText={opts?.cancelText}
        confirmText={opts?.confirmText}
        onCancel={() => handleClose(false)}
        onConfirm={() => handleClose(true)}
      />
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => {
  const ctx = useContext(ConfirmationContext);
  if (!ctx) throw new Error('useConfirmation must be used within ConfirmationProvider');
  return ctx;
};
