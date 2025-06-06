import { api } from "./api"

export const getUsers = async ({ test = false }: { test?: boolean }) => {
  try {
    const response = await api(test).get('get-users');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os usuários: ', error);
  }
}