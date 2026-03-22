'use server';
/**
 * @fileOverview Asistente de IA para optimizar la agenda de un dentista.
 *
 * - optimizarAgendaDentista - Función que maneja el proceso de optimización de la agenda.
 * - EntradaOptimizadorAgenda - Tipo de entrada para la función.
 * - SalidaOptimizadorAgenda - Tipo de retorno para la función.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EsquemaEntradaOptimizador = z.object({
  dentistaId: z.string().describe('El identificador único del dentista.'),
  agendaActual: z.array(
    z.object({
      fecha: z.string().describe('La fecha de la cita (AAAA-MM-DD).'),
      hora: z.string().describe('La hora de inicio de la cita (HH:MM).'),
      pacienteId: z.string().describe('El identificador único del paciente.'),
      tipoTratamiento: z.string().describe('El tipo de tratamiento programado.'),
      duracionMinutos: z.number().optional().describe('La duración real de la cita en minutos.'),
    })
  ).describe('La agenda actual de citas.'),
  perfilesPacientes: z.array(
    z.object({
      pacienteId: z.string().describe('El identificador único del paciente.'),
      nombre: z.string().describe('El nombre del paciente.'),
      franjasPreferidas: z.array(z.string()).optional().describe('Franjas horarias preferidas (ej. "mañana", "tarde").'),
      tasaInasistencia: z.number().optional().describe('Tasa de inasistencia (0-100).'),
    })
  ).describe('Perfiles de pacientes.'),
  espaciosDisponibles: z.array(
    z.object({
      fecha: z.string().describe('La fecha (AAAA-MM-DD).'),
      horaInicio: z.string().describe('Hora inicio (HH:MM).'),
      horaFin: z.string().describe('Hora fin (HH:MM).'),
    })
  ).describe('Lista de espacios disponibles.'),
  duracionesEstandar: z.record(z.string(), z.number()).describe('Duraciones estándar por tratamiento.'),
});
export type EntradaOptimizadorAgenda = z.infer<typeof EsquemaEntradaOptimizador>;

const EsquemaSalidaOptimizador = z.object({
  agendaOptimizada: z.array(
    z.object({
      fecha: z.string().describe('La fecha optimizada (AAAA-MM-DD).'),
      hora: z.string().describe('La hora optimizada (HH:MM).'),
      pacienteId: z.string().describe('El ID del paciente.'),
      tipoTratamiento: z.string().describe('El tratamiento.'),
      duracionAsignada: z.number().describe('Duración en minutos.'),
      notas: z.string().optional().describe('Justificación del cambio.'),
    })
  ).describe('La agenda sugerida.'),
  informeEficiencia: z.string().describe('Resumen de mejoras.'),
  sugerencias: z.array(z.string()).describe('Recomendaciones adicionales.'),
});
export type SalidaOptimizadorAgenda = z.infer<typeof EsquemaSalidaOptimizador>;

export async function optimizarAgendaDentista(input: EntradaOptimizadorAgenda): Promise<SalidaOptimizadorAgenda> {
  return flujoOptimizadorAgenda(input);
}

const prompt = ai.definePrompt({
  name: 'prompOptimizadorAgenda',
  input: {schema: EsquemaEntradaOptimizador},
  output: {schema: EsquemaSalidaOptimizador},
  prompt: `Eres un experto administrador de clínicas dentales. Optimiza la agenda diaria para maximizar la eficiencia.

ID Dentista: {{{dentistaId}}}

Agenda Actual:
{{#each agendaActual}}
  - {{this.fecha}} {{this.hora}}, Paciente: {{this.pacienteId}}, Tratamiento: {{this.tipoTratamiento}}
{{/each}}

Perfiles:
{{#each perfilesPacientes}}
  - {{this.nombre}} (ID: {{this.pacienteId}}), Preferencias: {{this.franjasPreferidas}}
{{/each}}

Espacios:
{{#each espaciosDisponibles}}
  - {{this.fecha}} de {{this.horaInicio}} a {{this.horaFin}}
{{/each}}

Basándote en esto, genera una agenda optimizada en ESPAÑOL.`,
});

const flujoOptimizadorAgenda = ai.defineFlow(
  {
    name: 'flujoOptimizadorAgenda',
    inputSchema: EsquemaEntradaOptimizador,
    outputSchema: EsquemaSalidaOptimizador,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
