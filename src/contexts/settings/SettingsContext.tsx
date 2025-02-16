import { SettingsService } from '@/services/planner';
import { SettingsContextProps, SettingsState, } from './SettingsContext.type';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';


export const SettingsContext = createContext<SettingsContextProps | null>(null);

export const SettingsProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {

  const [settings, setSettings] = useState<SettingsState | undefined>(undefined);

  const [trigger, setTrigger] = useState(false);
  const handleUpdate = () => setTrigger(!trigger); // simple state toggle to trigger re-render

  const settingsService = new SettingsService();

  useEffect(() => {    
     settingsService.getSettings({}).then(setSettings);
  }, [trigger])

  const contextValue = {
    settings: settings,
    updateSettings: async ({ data }: { data: SettingsState }) => {
      const response = await settingsService.updateSettings({ data });
      handleUpdate();
      return response;
    }
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};
