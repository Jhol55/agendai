import { api } from "./api"


export const getDocuments = async ({ test = false }: { test?: boolean }) => {
  try {
    const response = await api(test).get('get-documents');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os documentos: ', error);
  }
}

export const uploadDocuments = async ({ test = false, data }: { test?: boolean, data: FormData }) => {
  try {
    const response = await api(test).post('upload-documents', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar o arquivo: ', error);
  }
}

export const deleteDocuments = async ({ test = false, data }: { test?: boolean, data: FormData }) => {
  try {
    const response = await api(test).post('delete-documents', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar o arquivo: ', error);
  }
}


