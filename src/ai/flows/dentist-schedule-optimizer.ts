'use server';
/**
 * @fileOverview Asistente de IA para optimizar la agenda de un dentista.
 *
 * - optimizeDentistSchedule - Función que maneja el proceso de optimización de la agenda.
 * - DentistScheduleOptimizerInput - Tipo de entrada para la función.
 * - DentistScheduleOptimizerOutput - Tipo de retorno para la función.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DentistScheduleOptimizerInputSchema = z.object({
  dentistId: z.string().describe('El identificador único del dentista.'),
  currentSchedule: z.array(
    z.object({
      date: z.string().describe('La fecha de la cita (AAAA-MM-DD).'),
      time: z.string().describe('La hora de inicio de la cita (HH:MM).'),
      patientId: z.string().describe('El identificador único del paciente.'),
      treatmentType: z.string().describe('El tipo de tratamiento programado.'),
      durationMinutes: z.number().optional().describe('La duración real de la cita en minutos, si se conoce.'),
    })
  ).describe('La agenda actual de citas.'),
  patientProfiles: z.array(
    z.object({
      patientId: z.string().describe('El identificador único del paciente.'),
      name: z.string().describe('El nombre del paciente.'),
      preferredTimeSlots: z.array(z.string()).optional().describe('Franjas horarias preferidas (ej. "mañana", "tarde").'),
      historicalTreatmentDurations: z.record(z.string(), z.number()).optional().describe('Duraciones históricas en minutos para diferentes tratamientos de este paciente.'),
      noShowRate: z.number().optional().describe('Tasa de inasistencia del paciente, como porcentaje (0-100).'),
    })
  ).describe('Perfiles de pacientes, incluyendo datos históricos y preferencias.'),
  availableTimeSlots: z.array(
    z.object({
      date: z.string().describe('La fecha del espacio disponible (AAAA-MM-DD).'),
      startTime: z.string().describe('La hora de inicio del espacio disponible (HH:MM).'),
      endTime: z.string().describe('La hora de fin del espacio disponible (HH:MM).'),
    })
  ).describe('Lista de espacios de tiempo actualmente disponibles.'),
  standardTreatmentDurations: z.record(z.string(), z.number()).describe('Duraciones estándar en minutos para varios tipos de tratamiento.'),
});
export type DentistScheduleOptimizerInput = z.infer<typeof DentistScheduleOptimizerInputSchema>;

const DentistScheduleOptimizerOutputSchema = z.object({
  optimizedSchedule: z.array(
    z.object({
      date: z.string().describe('La fecha de la cita optimizada (AAAA-MM-DD).'),
      time: z.string().describe('La hora de inicio de la cita optimizada (HH:MM).'),
      patientId: z.string().describe('El identificador único del paciente.'),
      treatmentType: z.string().describe('El tipo de tratamiento programado.'),
      assignedDurationMinutes: z.number().describe('La duración asignada para la cita en minutos.'),
      notes: z.string().optional().describe('Notas o justificación para esta cita en la agenda optimizada.'),
    })
  ).describe('La agenda optimizada sugerida por la IA.'),
  efficiencyReport: z.string().describe('Un informe textual que resume las mejoras de eficiencia (ej. reducción de tiempo muerto).'),
  suggestions: z.array(z.string()).describe('Recomendaciones adicionales para el dentista basadas en la optimización.'),
});
export type DentistScheduleOptimizerOutput = z.infer<typeof DentistScheduleOptimizerOutputSchema>;

export async function optimizeDentistSchedule(input: DentistScheduleOptimizerInput): Promise<DentistScheduleOptimizerOutput> {
  return dentistScheduleOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dentistScheduleOptimizerPrompt',
  input: {schema: DentistScheduleOptimizerInputSchema},
  output: {schema: DentistScheduleOptimizerOutputSchema},
  prompt: `Eres un experto administrador de clínicas dentales y una IA de optimización de agendas. Tu objetivo es analizar la información proporcionada y optimizar la agenda diaria del dentista para maximizar la eficiencia, minimizar los espacios vacíos y mejorar el flujo de pacientes.

Aquí está la información actual:

ID del Dentista: {{{dentistId}}}

Agenda Actual:
{{#each currentSchedule}}
  - Fecha: {{this.date}}, Hora: {{this.time}}, Paciente: {{this.patientId}}, Tratamiento: {{this.treatmentType}}{{#if this.durationMinutes}}, Duración: {{this.durationMinutes}} minutos{{/if}}
{{/each}}

Perfiles de Pacientes:
{{#each patientProfiles}}
  - Paciente: {{this.name}} (ID: {{this.patientId}})
    {{#if this.preferredTimeSlots}}Preferencias: {{this.preferredTimeSlots}}{{/if}}
    {{#if this.noShowRate}}Tasa de Inasistencia: {{this.noShowRate}}%{{/if}}
{{/each}}

Espacios Disponibles:
{{#each availableTimeSlots}}
  - Fecha: {{this.date}}, Inicio: {{this.startTime}}, Fin: {{this.endTime}}
{{/each}}

Duraciones Estándar (min):
{{json standardTreatmentDurations}}

Basándote en esto, proporciona una agenda optimizada en ESPAÑOL. Intenta:
1. Consolidar citas para reducir el tiempo fragmentado.
2. Llenar espacios vacíos considerando las preferencias de los pacientes.
3. Ajustar duraciones según datos históricos y estándares.
4. Priorizar tratamientos de alto valor o pacientes urgentes.
5. Incluir una nota breve por cada cambio realizado.

También, proporciona un informe de eficiencia que resuma las mejoras y sugerencias adicionales para la práctica clínica.`,
});

const dentistScheduleOptimizerFlow = ai.defineFlow(
  {
    name: 'dentistScheduleOptimizerFlow',
    inputSchema: DentistScheduleOptimizerInputSchema,
    outputSchema: DentistScheduleOptimizerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
