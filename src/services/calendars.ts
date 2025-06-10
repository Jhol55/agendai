import { api } from "./api"


export const getCalendars = async ({ test = false, id }: { test?: boolean, id?: string }) => {
  try {
    const response = await api(test).get(`get-calendars?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os calendários: ', error);
  }
}


export const createCalendar = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post("create-calendar", data);
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar calendário: ', error);
  }
}

export const updateCalendar = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post("update-calendar", data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar calendário: ', error);
  }
}


export const deleteCalendar = async ({ test = false, id }: { test?: boolean, id: string | number }) => {
  try {
    const response = await api(test).post("delete-calendar", { id });
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar calendário: ', error);
  }
}