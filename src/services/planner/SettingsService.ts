import { SettingsState } from "@/contexts/settings/SettingsContext.type";
import { api } from "../api";


export class SettingsService {

    async getSettings({ test = false, id }: { test?: boolean, id?: string }) {
        try {
            const response = await api(test).get(`get-settings?id=${id}`);
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

export async function getSettings({ test = false, id }: { test?: boolean, id?: string }) {
    try {
        const response = await api(test).get(`get-settings?id=${id}`);
        return response.data
    } catch (error) {
        console.error('Erro ao carregar as configurações: ', error);
    }
}

export async function updateSettings({ test = false, data }: { test?: boolean, data: SettingsState }): Promise<SettingsState> {
    try {
        const response = await api(test).post('update-settings', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar as configurações: ', error);
    }
}