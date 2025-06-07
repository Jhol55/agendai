import { api } from "./api"


export const getDecodedAppointmentId = async ({ test = false, encoded }: { test?: boolean, encoded: string }) => {
  try {
    const response = await api(test).get(`get-decode-confirmation?appointment=${encoded}`);
    return response.data;
  } catch (error) {
    console.error('Falha ao decodificar o ID do compromisso:', error);
  }
}

export const setAppointmentStatus = async ({ test = false, data }: { test?: boolean, data: { encoded: string, status: string } }) => {
  try {
    const response = await api(test).patch(`update-appointment-status`, data);
    return response.data;
  } catch (error) {
    console.error('Falha ao atualizar o status do compromisso:', error);
  }
}

