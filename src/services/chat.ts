import { api } from "./api";

export const getChats = async ({ test = false }: { test?: boolean }) => {
  try {
    const response = await api(test).get('get-chats');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar as conversas: ', error);
  }
}

export const getChat = async ({ test = false, id }: { test?: boolean, id: string }) => {
  try {
    const response = await api(test).get(`get-chat?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar a conversa: ', error);
  }
}