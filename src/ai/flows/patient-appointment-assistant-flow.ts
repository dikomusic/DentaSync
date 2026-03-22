'use server';
/**
 * @fileOverview An AI-powered chatbot that assists patients with appointment inquiries, rescheduling, and common questions about the dental practice.
 *
 * - patientAppointmentAssistant - A function that handles patient inquiries and appointment management.
 * - PatientAppointmentAssistantInput - The input type for the patientAppointmentAssistant function.
 * - PatientAppointmentAssistantOutput - The return type for the patientAppointmentAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PatientAppointmentAssistantInputSchema = z.object({
  patientId: z.string().describe('The unique identifier for the patient.'),
  query: z.string().describe('The patient\u0027s question or request.'),
});
export type PatientAppointmentAssistantInput = z.infer<typeof PatientAppointmentAssistantInputSchema>;

const PatientAppointmentAssistantOutputSchema = z.object({
  response: z.string().describe('The chatbot\u0027s response to the patient.'),
});
export type PatientAppointmentAssistantOutput = z.infer<typeof PatientAppointmentAssistantOutputSchema>;

// Dummy data for simulation
const MOCK_APPOINTMENTS: Record<string, typeof PatientAppointmentAssistantOutputSchema.deepPartial()._type> = {
  'patient-123': [
    { appointmentId: 'appt-001', date: '2024-08-15', time: '10:00 AM', doctor: 'Dr. Smith', reason: 'Routine Checkup' },
    { appointmentId: 'appt-002', date: '2024-09-01', time: '02:30 PM', doctor: 'Dr. Jones', reason: 'Cavity Filling' },
  ],
  'patient-456': [
    { appointmentId: 'appt-003', date: '2024-08-20', time: '11:00 AM', doctor: 'Dr. Smith', reason: 'Teeth Cleaning' },
  ],
};

const getPatientAppointmentsTool = ai.defineTool(
  {
    name: 'getPatientAppointments',
    description: 'Retrieves a list of upcoming appointments for a given patient by their ID.',
    inputSchema: z.object({
      patientId: z.string().describe('The unique identifier of the patient.'),
    }),
    outputSchema: z.array(z.object({
      appointmentId: z.string().describe('The unique identifier for the appointment.'),
      date: z.string().describe('The date of the appointment (YYYY-MM-DD).'),
      time: z.string().describe('The time of the appointment (HH:MM AM/PM).'),
      doctor: z.string().describe('The doctor for the appointment.'),
      reason: z.string().describe('The reason for the appointment.'),
    })),
  },
  async (input) => {
    // In a real application, this would fetch data from a database.
    console.log(`Tool call: getPatientAppointments for patientId: ${input.patientId}`);
    return MOCK_APPOINTMENTS[input.patientId] || [];
  }
);

const rescheduleAppointmentTool = ai.defineTool(
  {
    name: 'rescheduleAppointment',
    description: 'Reschedules an existing appointment for a patient to a new date and time.',
    inputSchema: z.object({
      patientId: z.string().describe('The unique identifier of the patient.'),
      appointmentId: z.string().describe('The ID of the appointment to reschedule.'),
      newDate: z.string().describe('The new desired date for the appointment (YYYY-MM-DD).'),
      newTime: z.string().describe('The new desired time for the appointment (HH:MM AM/PM).'),
    }),
    outputSchema: z.object({
      success: z.boolean().describe('True if the appointment was successfully rescheduled, false otherwise.'),
      message: z.string().describe('A message detailing the outcome of the reschedule attempt.'),
    }),
  },
  async (input) => {
    // In a real application, this would update the database.
    console.log(`Tool call: rescheduleAppointment for patientId: ${input.patientId}, appointmentId: ${input.appointmentId} to ${input.newDate} at ${input.newTime}`);
    const patientAppointments = MOCK_APPOINTMENTS[input.patientId];
    const appointment = patientAppointments?.find(app => app.appointmentId === input.appointmentId);

    if (appointment) {
      // Simulate successful reschedule
      appointment.date = input.newDate;
      appointment.time = input.newTime;
      return { success: true, message: `Appointment ${input.appointmentId} successfully rescheduled to ${input.newDate} at ${input.newTime}.` };
    } else {
      return { success: false, message: `Appointment ${input.appointmentId} not found for patient ${input.patientId}.` };
    }
  }
);

const patientAppointmentAssistantPrompt = ai.definePrompt({
  name: 'patientAppointmentAssistantPrompt',
  input: { schema: PatientAppointmentAssistantInputSchema },
  output: { schema: PatientAppointmentAssistantOutputSchema },
  tools: [getPatientAppointmentsTool, rescheduleAppointmentTool],
  prompt: `You are DentaSync, a helpful and friendly AI assistant for DentaSync Dental Clinic.
Your goal is to assist patients with their appointment inquiries, reschedule requests, and common questions about the clinic.

Here is some general information about DentaSync Dental Clinic:
- **Hours**: Monday-Friday, 9 AM - 6 PM. Saturday, 10 AM - 2 PM. Closed Sunday.
- **Location**: 123 Main Street, Anytown, USA.
- **Services**: General Dentistry, Cleanings, Fillings, Extractions, Root Canals, Cosmetic Dentistry.
- **Appointment Policy**: Patients can view, reschedule, or cancel appointments via this chat or the mobile app. Rescheduling requires a minimum of 24-hour notice.

When a patient asks about their appointments, use the 'getPatientAppointments' tool to retrieve their upcoming appointments. If the patient explicitly asks to reschedule an appointment, use the 'rescheduleAppointment' tool. Always confirm details with the patient before attempting to reschedule.

Patient ID: {{{patientId}}}
Patient Query: {{{query}}}

Respond clearly and concisely. If you need more information to perform an action (like rescheduling), ask the patient for it.`,
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
