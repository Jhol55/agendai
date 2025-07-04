import { api } from "./api"


export const getServices = async ({ test = false, name }: { test?: boolean, name?: string }) => {
  try {
    const response = await api(test).get(`get-services?name=${name}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os serviços: ', error);
  }
}

export const getAllServices = async ({ test = false, page }: { test?: boolean, page?: number }) => {
  try {
    const response = await api(test).get(`get-services?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os serviços: ', error);
  }
}

export const getCalendarServices = async ({ test = false, name, id }: { test?: boolean, name?: string, id?: string }) => {
  try {
    const response = await api(test).get(`get-calendar-services?name=${name}&id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os serviços: ', error);
  }
}

export const AddService = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post("add-service", data);
    return response.data;
  } catch (error) {
    console.error('Erro ao salvar os serviços: ', error);
  }
}

export const updateService = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post("update-service", data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar o serviço: ', error);
  }
}

export const deleteServices = async ({ test = false, data }: { test?: boolean, data: object }) => {
  try {
    const response = await api(test).post("delete-services", data);
    return response.data;
  } catch (error) {
    console.error('Erro ao deletar os serviços: ', error);
  }
}