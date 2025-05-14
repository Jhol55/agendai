import { AdditionalSettingsProps } from "@/models/AdditionalSettings";

export type SettingItem = {
  type: string;
  value?: string | number | undefined;
};

export type SettingsState = Record<string, SettingItem[]> | undefined;

export interface SettingsContextProps {
  settings: SettingsState;
  updateSettings: ({ data }: { data: SettingsState }) => Promise<SettingsState>;
  zoom: number;
}