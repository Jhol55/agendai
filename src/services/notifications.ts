import { api } from "./api";

export const getNotifications = async ({ test = false, page = 1 }: { test?: boolean, page: number }) => {
  try {
    const response = await api(test).get(`get-notifications?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar as notificações: ', error);
  }
}