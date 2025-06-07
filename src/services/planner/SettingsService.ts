import { SettingsState } from "@/contexts/settings/SettingsContext.type";
import { api } from "../api";


export class SettingsService {

    async getSettings({ test = false }: { test?: boolean }) {
        try {
            const response = await api(test).get('get-settings');
            return response.data
        } catch (error) {
            console.error('Erro ao carregar as configurações: ', error);
        }
    }

    async updateSettings({ test = false, data }: { test?: boolean, data: SettingsState }): Promise<SettingsState> {
        try {
            const response = await api(test).post('update-settings', data);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar as configurações: ', error);
        }
    }
}