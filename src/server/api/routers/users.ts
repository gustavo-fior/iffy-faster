import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  addGuidelines: protectedProcedure
    .input(
      z.object({
        guidelines: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: {
          id: ctx.session?.user?.id,
        },
        data: {
          guidelines: input.guidelines,
        },
      });
    }),
});
