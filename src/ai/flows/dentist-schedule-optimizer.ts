'use server';
/**
 * @fileOverview An AI assistant flow for optimizing a dentist's schedule.
 *
 * - optimizeDentistSchedule - A function that handles the dentist schedule optimization process.
 * - DentistScheduleOptimizerInput - The input type for the optimizeDentistSchedule function.
 * - DentistScheduleOptimizerOutput - The return type for the optimizeDentistSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DentistScheduleOptimizerInputSchema = z.object({
  dentistId: z.string().describe('The unique identifier for the dentist.'),
  currentSchedule: z.array(
    z.object({
      date: z.string().describe('The date of the appointment (YYYY-MM-DD).'),
      time: z.string().describe('The start time of the appointment (HH:MM).'),
      patientId: z.string().describe('The unique identifier for the patient.'),
      treatmentType: z.string().describe('The type of treatment scheduled.'),
      durationMinutes: z.number().optional().describe('The actual duration of the appointment in minutes, if known.'),
    })
  ).describe('The current schedule of appointments.'),
  patientProfiles: z.array(
    z.object({
      patientId: z.string().describe('The unique identifier for the patient.'),
      name: z.string().describe('The name of the patient.'),
      preferredTimeSlots: z.array(z.string()).optional().describe('Preferred time slots for appointments (e.g., "morning", "afternoon").'),
      historicalTreatmentDurations: z.record(z.string(), z.number()).optional().describe('Historical durations in minutes for different treatment types for this patient.'),
      noShowRate: z.number().optional().describe('The no-show rate for the patient, as a percentage (0-100).'),
    })
  ).describe('Profiles of patients, including historical data and preferences.'),
  availableTimeSlots: z.array(
    z.object({
      date: z.string().describe('The date of the available slot (YYYY-MM-DD).'),
      startTime: z.string().describe('The start time of the available slot (HH:MM).'),
      endTime: z.string().describe('The end time of the available slot (HH:MM).'),
    })
  ).describe('List of currently available time slots for scheduling new or re-assigning appointments.'),
  standardTreatmentDurations: z.record(z.string(), z.number()).describe('Standard durations in minutes for various treatment types.'),
});
export type DentistScheduleOptimizerInput = z.infer<typeof DentistScheduleOptimizerInputSchema>;

const DentistScheduleOptimizerOutputSchema = z.object({
  optimizedSchedule: z.array(
    z.object({
      date: z.string().describe('The date of the optimized appointment (YYYY-MM-DD).'),
      time: z.string().describe('The start time of the optimized appointment (HH:MM).'),
      patientId: z.string().describe('The unique identifier for the patient.'),
      treatmentType: z.string().describe('The type of treatment scheduled.'),
      assignedDurationMinutes: z.number().describe('The assigned duration for the appointment in minutes.'),
      notes: z.string().optional().describe('Any specific notes or rationale for this appointment in the optimized schedule.'),
    })
  ).describe('The AI-suggested optimized schedule of appointments.'),
  efficiencyReport: z.string().describe('A textual report summarizing efficiency improvements (e.g., reduced idle time, filled empty slots).'),
  suggestions: z.array(z.string()).describe('Additional recommendations for the dentist based on the optimization.'),
});
export type DentistScheduleOptimizerOutput = z.infer<typeof DentistScheduleOptimizerOutputSchema>;

export async function optimizeDentistSchedule(input: DentistScheduleOptimizerInput): Promise<DentistScheduleOptimizerOutput> {
  return dentistScheduleOptimizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dentistScheduleOptimizerPrompt',
  input: {schema: DentistScheduleOptimizerInputSchema},
  output: {schema: DentistScheduleOptimizerOutputSchema},
  prompt: `You are an expert dental office manager and schedule optimization AI. Your goal is to analyze the provided information and optimize the dentist's daily schedule to maximize efficiency, minimize empty slots, and improve patient flow.

Here is the current information:

Dentist ID: {{{dentistId}}}

Current Schedule:
{{#each currentSchedule}}
  - Date: {{this.date}}, Time: {{this.time}}, Patient ID: {{this.patientId}}, Treatment: {{this.treatmentType}}{{#if this.durationMinutes}}, Duration: {{this.durationMinutes}} minutes{{/if}}
{{/each}}

Patient Profiles (including historical data and preferences):
{{#each patientProfiles}}
  - Patient ID: {{this.patientId}}, Name: {{this.name}}
    {{#if this.preferredTimeSlots}}Preferred Times: {{this.preferredTimeSlots}}{{/if}}
    {{#if this.historicalTreatmentDurations}}Historical Treatment Durations: {{json this.historicalTreatmentDurations}}{{/if}}
    {{#if this.noShowRate}}No-Show Rate: {{this.noShowRate}}%{{/if}}
{{/each}}

Available Time Slots for scheduling new or re-assigned appointments:
{{#each availableTimeSlots}}
  - Date: {{this.date}}, Start: {{this.startTime}}, End: {{this.endTime}}
{{/each}}

Standard Treatment Durations (minutes):
{{json standardTreatmentDurations}}

Based on this information, provide an optimized schedule. Try to:
1. Consolidate appointments where possible to reduce fragmented time.
2. Fill empty slots using available time slots and considering patient preferences.
3. Adjust appointment durations based on historical patient data and standard durations.
4. Prioritize high-value treatments or patients where appropriate.
5. Include a brief note for each appointment in the optimized schedule if there was a change or a specific reason for its placement.

Also, provide an efficiency report summarizing the improvements made (e.g., total idle time reduced, number of filled empty slots, improved patient flow description) and any additional suggestions for the dentist to further optimize their practice.`,
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
