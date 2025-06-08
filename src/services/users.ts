import { api } from "./api"

export const getUsers = async ({ test = false, email }: { test?: boolean, email?: string }) => {
  try {
    const response = await api(test).get(`get-users?email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar os usuários: ', error);
  }
}

export const getCookie = async () => {
  try {
    const response = await fetch('/api/session', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const sessionData = await response.json();
    return sessionData;

  } catch (error) {
    console.error("Failed to fetch session data:", error);
    throw error;
  }
};