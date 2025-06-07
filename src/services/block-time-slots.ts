import { api } from "./api";


export const AddBlockedTimeSlot = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post('add-blocked-time-slot', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar compromisso: ', error);
  }
}

export const updateBlockedTimeSlot = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post('update-blocked-time-slot', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar compromisso: ', error);
  }
}

export const getBlockedTimeSlots = async ({ test = false }: { test?: boolean }) => {
  try {
    const response = await api(test).get('get-blocked-time-slot');
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar compromissos: ', error);
  }
}

export const deleteBlockedTimeSlot = async ({ test = false, id }: { test?: boolean, id: number | string }) => {
  try {
    const response = await api(test).post('delete-blocked-time-slot', { id });
    return response.data;
  } catch (error) {
    console.error('Erro ao excluir compromisso: ', error);
  }
}