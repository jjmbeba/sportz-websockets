import { z } from 'zod';

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
} as const;

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const isValidISODate = (val: string) => !isNaN(Date.parse(val));

export const createMatchSchema = z.object({
  sport: z.string().min(1),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  startTime: z.string().refine(isValidISODate, { message: 'Invalid startTime ISO date string' }),
  endTime: z.string().refine(isValidISODate, { message: 'Invalid endTime ISO date string' }),
  homeScore: z.coerce.number().int().nonnegative().optional(),
  awayScore: z.coerce.number().int().nonnegative().optional(),
}).superRefine((data, ctx) => {
  const start = new Date(data.startTime).getTime();
  const end = new Date(data.endTime).getTime();
  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'endTime must be chronologically after startTime',
      path: ['endTime'],
    });
  }
});

export const matchSchema = createMatchSchema.extend({
  id: z.string().min(1),
  status: typeof MATCH_STATUS
});

export type Match = z.infer<typeof matchSchema>;

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
