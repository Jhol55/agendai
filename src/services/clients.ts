import { api } from "./api";


export const getClients = async ({ test = false, name }: { test?: boolean, name: string }) => {
  try {
    const response = await api(test).get(`get-clients?name=${name}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os clientes: ', error);
  }
}