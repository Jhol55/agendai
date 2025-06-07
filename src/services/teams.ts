import { api } from "./api"

export const getTeams = async ({ test = false }: { test?: boolean }) => {
  try {
    const response = await api(test).get('get-teams');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os times: ', error);
  }
}