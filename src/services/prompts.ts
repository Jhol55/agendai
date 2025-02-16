import { api } from "./api"

export const getPrompts = async ({ test = false }: { test?: boolean }) => {
  try {
    const response = await api(test).get('get-prompt');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os documentos: ', error);
  }
}

export const updatePrompt = async ({ test = false, data }: { test?: boolean, data: FormData }) => {
  try {
    const response = await api(test).post('update-prompt', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar o arquivo: ', error);
  }
}
