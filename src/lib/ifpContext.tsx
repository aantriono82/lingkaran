import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { bacaPreferensiModeIfp, simpanPreferensiModeIfp } from './storage';

export interface IfpContextValue {
  modeIfp: boolean;
  skalaGaris: number;
  toggleModeIfp: () => void;
  setModeIfp: (aktif: boolean) => void;
}

const defaultIfpValue: IfpContextValue = {
  modeIfp: false,
  skalaGaris: 1,
  toggleModeIfp: () => {},
  setModeIfp: () => {}
};

const IfpContext = createContext<IfpContextValue>(defaultIfpValue);

export function IfpProvider({ children }: { children: ReactNode }) {
  const [modeIfp, setModeIfpState] = useState<boolean>(() => bacaPreferensiModeIfp());

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('mode-ifp', modeIfp);
      document.documentElement.style.setProperty('--skala-garis', modeIfp ? '1.3' : '1');
    }
  }, [modeIfp]);

  const toggleModeIfp = useCallback(() => {
    setModeIfpState((sebelumnya) => {
      const baru = !sebelumnya;
      simpanPreferensiModeIfp(baru);
      return baru;
    });
  }, []);

  const setModeIfp = useCallback((aktif: boolean) => {
    setModeIfpState(aktif);
    simpanPreferensiModeIfp(aktif);
  }, []);

  const skalaGaris = modeIfp ? 1.3 : 1;

  const value = useMemo<IfpContextValue>(() => ({
    modeIfp,
    skalaGaris,
    toggleModeIfp,
    setModeIfp
  }), [modeIfp, skalaGaris, toggleModeIfp, setModeIfp]);

  return (
    <IfpContext.Provider value={value}>
      {children}
    </IfpContext.Provider>
  );
}

export function useIfp(): IfpContextValue {
  return useContext(IfpContext);
}
