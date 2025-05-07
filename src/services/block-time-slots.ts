import { api } from "./api";


export const AddBlockedTimeSlot = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post('add-blocked-time-slot', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar exceção: ', error);
  }
}

export const GetBlockedTimeSlots = async ({ test = false }: { test?: boolean }) => {
  try {
    const response = await api(test).get('get-blocked-time-slot');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar exceções: ', error);
  }
}

export const RemoveBlockedTimeSlot = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post('remove-blocked-time-slot', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir exceção: ', error);
  }
}