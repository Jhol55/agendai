import { api } from "./api";

export const getNotifications = async ({ test = false }: { test?: boolean }) => {
  try {
    const response = await api(test).get('get-notifications');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar as notificações: ', error);
  }
}