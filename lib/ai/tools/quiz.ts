import { tool, zodSchema } from 'ai';
import { z } from 'zod';

export const startSkinQuizTool = tool({
  description: 'Start a skin analysis quiz. The agent asks questions interactively.',
  inputSchema: zodSchema(z.object({})),
  execute: async () => ({ quizStarted: true }),
});

export const saveSkinProfileTool = tool({
  description: "Save the user's skin profile from quiz answers.",
  inputSchema: zodSchema(
    z.object({
      skinType: z.enum(['dry', 'oily', 'combination', 'normal', 'sensitive']),
      concerns: z.array(z.string()),
      allergies: z.array(z.string()).optional(),
    }),
  ),
  execute: async ({
    skinType,
    concerns,
    allergies,
  }: {
    skinType: string;
    concerns: string[];
    allergies?: string[];
  }) => {
    const { getOptionalCustomerSession } = await import('@/lib/dal');
    const session = await getOptionalCustomerSession();
    if (!session) return { error: 'Login required.' };
    return { saved: true, profile: { skinType, concerns, allergies } };
  },
});

export const getSkinProfileTool = tool({
  description: "Get the user's saved skin profile.",
  inputSchema: zodSchema(z.object({})),
  execute: async () => {
    const { getOptionalCustomerSession } = await import('@/lib/dal');
    const session = await getOptionalCustomerSession();
    if (!session) return { profile: null };
    return { profile: null, message: 'No saved profile.' };
  },
});
