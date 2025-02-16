import { Appointment } from "@/models/Appointment";
import { api } from "../api";


export class AppointmentService {
  private appointments: Appointment[] = [];

  constructor(initialAppointments: Appointment[]) {
    this.appointments = initialAppointments
  }

  async createAppointment({ test = false, appointment }: { test?: boolean, appointment: Appointment }) {
    try {
      const response = await api(test).post("create-appointment", appointment);
      this.appointments.push({ ...appointment, id: response.data.id });
      return this.appointments;
    } catch (error) {
      console.error('Erro ao criar o agendamento: ', error);
    }
  }

  async updateAppointment({ test = false, updatedAppointment }: { test?: boolean, updatedAppointment: Appointment }) {
    const index = this.appointments.findIndex(a => a.id === updatedAppointment.id);
    if (index !== -1) {
      try {   
        await api(test).post("update-appointment", { old: this.appointments[index], new: updatedAppointment });
        this.appointments[index] = { ...this.appointments[index], ...updatedAppointment };     
        return this.appointments;
      } catch (error) {
        console.error('Erro ao atualizar o agendamento: ', error);
      }
    }
  }

  async deleteAppointment({ test = false, id }: { test?: boolean, id: string }) {
    this.appointments = this.appointments.filter(a => a.id !== id);
    try {
      const response = await api(test).post("delete-appointment", { id });
      return response.data;
    } catch (error) {
      console.error('Erro ao remover o agendamento: ', error);
    }
    return this.appointments;
  }


  async getInitialAppointments({ test = false, from, to }: { test?: boolean, from: string | undefined, to: string | undefined }) {
    try {
      const response = await api(test).get(`get-appointments?from=${from}&to=${to}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar os agendamentos: ', error);
    }
  }
}
