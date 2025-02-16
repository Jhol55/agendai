import { api } from "./api"


export const getServices = async ({ test = false, name } : { test?: boolean, name: string }) => {
  try {
    const response = await api(test).get(`get-services?name=${name}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os serviços: ', error);
  }
}

export const updateServices = async ({ test = false, data } : { test?: boolean, data: object }) => {
    try {
      const response = await api(test).post("update-services", data);
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar os serviços: ', error);
    }
  }