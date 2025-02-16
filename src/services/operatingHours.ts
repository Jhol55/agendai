import { api } from "./api"

export const getOperatingHours = async ({ test = false }: { test?: boolean }) => {
  try {
    const response = await api(test).get('get-operating-hours');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os horários: ', error);
  }
}

export const updateOperatingHours = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post('update-operating-hours', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar os horários: ', error);
  }
}