'use server';
/**
 * @fileOverview Un chatbot con IA que asiste a los pacientes con consultas sobre citas.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EsquemaEntradaAsistente = z.object({
  pacienteId: z.string().describe('El identificador único del paciente.'),
  consulta: z.string().describe('La pregunta o solicitud.'),
});
export type EntradaAsistenteCitas = z.infer<typeof EsquemaEntradaAsistente>;

const EsquemaSalidaAsistente = z.object({
  respuesta: z.string().describe('La respuesta del chatbot.'),
});
export type SalidaAsistenteCitas = z.infer<typeof EsquemaSalidaAsistente>;

const obtenerCitasTool = ai.defineTool(
  {
    name: 'obtenerCitasPaciente',
    description: 'Recupera una lista de citas próximas para un paciente.',
    inputSchema: z.object({ pacienteId: z.string() }),
    outputSchema: z.array(z.any()),
  },
  async (input) => {
    // Simulación de base de datos
    return [
      { id: 'c-1', fecha: '2024-05-20', hora: '10:00 AM', motivo: 'Limpieza' }
    ];
  }
);

const asistenteCitasPrompt = ai.definePrompt({
  name: 'asistenteCitasPrompt',
  input: { schema: EsquemaEntradaAsistente },
  output: { schema: EsquemaSalidaAsistente },
  tools: [obtenerCitasTool],
  prompt: `Eres DentaSync, un asistente dental virtual. Responde SIEMPRE en ESPAÑOL.
Ayuda al paciente con ID {{{pacienteId}}} con su consulta: {{{consulta}}}`,
});

const flujoAsistenteCitas = ai.defineFlow(
  {
    name: 'flujoAsistenteCitas',
    inputSchema: EsquemaEntradaAsistente,
    outputSchema: EsquemaSalidaAsistente,
  },
  async (input) => {
    const { output } = await asistenteCitasPrompt(input);
    return output!;
  }
);

export async function asistenteCitasPaciente(input: EntradaAsistenteCitas): Promise<SalidaAsistenteCitas> {
  return flujoAsistenteCitas(input);
}
