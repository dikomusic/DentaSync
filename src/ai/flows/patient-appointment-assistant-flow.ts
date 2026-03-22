'use server';
/**
 * @fileOverview Un chatbot con IA que asiste a los pacientes con consultas sobre citas, reprogramaciones y preguntas comunes.
 *
 * - patientAppointmentAssistant - Función que maneja las consultas de los pacientes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PatientAppointmentAssistantInputSchema = z.object({
  patientId: z.string().describe('El identificador único del paciente.'),
  query: z.string().describe('La pregunta o solicitud del paciente.'),
});
export type PatientAppointmentAssistantInput = z.infer<typeof PatientAppointmentAssistantInputSchema>;

const PatientAppointmentAssistantOutputSchema = z.object({
  response: z.string().describe('La respuesta del chatbot al paciente.'),
});
export type PatientAppointmentAssistantOutput = z.infer<typeof PatientAppointmentAssistantOutputSchema>;

// Datos simulados
const MOCK_APPOINTMENTS: Record<string, any[]> = {
  'patient-123': [
    { appointmentId: 'appt-001', date: '2024-08-15', time: '10:00 AM', doctor: 'Dr. Rivera', reason: 'Limpieza Rutinaria' },
    { appointmentId: 'appt-002', date: '2024-09-01', time: '02:30 PM', doctor: 'Dr. Rivera', reason: 'Tratamiento de Caries' },
  ],
  'patient-456': [
    { appointmentId: 'appt-003', date: '2024-08-20', time: '11:00 AM', doctor: 'Dr. Rivera', reason: 'Limpieza Dental' },
  ],
};

const getPatientAppointmentsTool = ai.defineTool(
  {
    name: 'getPatientAppointments',
    description: 'Recupera una lista de citas próximas para un paciente dado por su ID.',
    inputSchema: z.object({
      patientId: z.string().describe('El identificador único del paciente.'),
    }),
    outputSchema: z.array(z.object({
      appointmentId: z.string().describe('ID único de la cita.'),
      date: z.string().describe('Fecha (AAAA-MM-DD).'),
      time: z.string().describe('Hora (HH:MM AM/PM).'),
      doctor: z.string().describe('Nombre del doctor.'),
      reason: z.string().describe('Motivo de la cita.'),
    })),
  },
  async (input) => {
    console.log(`Llamada a herramienta: getPatientAppointments para patientId: ${input.patientId}`);
    return MOCK_APPOINTMENTS[input.patientId] || [];
  }
);

const rescheduleAppointmentTool = ai.defineTool(
  {
    name: 'rescheduleAppointment',
    description: 'Reprograma una cita existente para un paciente a una nueva fecha y hora.',
    inputSchema: z.object({
      patientId: z.string().describe('ID único del paciente.'),
      appointmentId: z.string().describe('ID de la cita a reprogramar.'),
      newDate: z.string().describe('Nueva fecha deseada (AAAA-MM-DD).'),
      newTime: z.string().describe('Nueva hora deseada (HH:MM AM/PM).'),
    }),
    outputSchema: z.object({
      success: z.boolean().describe('Verdadero si se reprogramó con éxito.'),
      message: z.string().describe('Mensaje detallando el resultado.'),
    }),
  },
  async (input) => {
    console.log(`Llamada a herramienta: rescheduleAppointment para patientId: ${input.patientId}`);
    const patientAppointments = MOCK_APPOINTMENTS[input.patientId];
    const appointment = patientAppointments?.find(app => app.appointmentId === input.appointmentId);

    if (appointment) {
      appointment.date = input.newDate;
      appointment.time = input.newTime;
      return { success: true, message: `Cita ${input.appointmentId} reprogramada con éxito para el ${input.newDate} a las ${input.newTime}.` };
    } else {
      return { success: false, message: `No se encontró la cita ${input.appointmentId} para el paciente.` };
    }
  }
);

const patientAppointmentAssistantPrompt = ai.definePrompt({
  name: 'patientAppointmentAssistantPrompt',
  input: { schema: PatientAppointmentAssistantInputSchema },
  output: { schema: PatientAppointmentAssistantOutputSchema },
  tools: [getPatientAppointmentsTool, rescheduleAppointmentTool],
  prompt: `Eres DentaSync, un asistente de IA amable y servicial para la Clínica Dental DentaSync.
Tu objetivo es ayudar a los pacientes con sus consultas sobre citas, solicitudes de reprogramación y preguntas comunes sobre la clínica. TODAS tus respuestas deben ser en ESPAÑOL.

Información General de la Clínica:
- Horarios: Lunes a Viernes, 9 AM - 6 PM. Sábados, 10 AM - 2 PM. Domingo Cerrado.
- Ubicación: Calle Principal 123, Ciudad Salud.
- Servicios: Odontología General, Limpiezas, Resinas, Extracciones, Endodoncia, Estética.
- Política: Reprogramar requiere al menos 24 horas de antelación.

Cuando un paciente pregunte por sus citas, usa 'getPatientAppointments'. Si pide reprogramar, usa 'rescheduleAppointment'. Confirma siempre los detalles antes de realizar la acción.

ID del Paciente: {{{patientId}}}
Consulta del Paciente: {{{query}}}

Responde de forma clara y concisa en español.`,
});

const patientAppointmentAssistantFlow = ai.defineFlow(
  {
    name: 'patientAppointmentAssistantFlow',
    inputSchema: PatientAppointmentAssistantInputSchema,
    outputSchema: PatientAppointmentAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await patientAppointmentAssistantPrompt(input);
    return output!;
  }
);

export async function patientAppointmentAssistant(input: PatientAppointmentAssistantInput): Promise<PatientAppointmentAssistantOutput> {
  return patientAppointmentAssistantFlow(input);
}
