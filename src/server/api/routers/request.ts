import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const requestRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;

    return await ctx.db.requests.findMany({
      where: {
        userId,
      },
    });
  }),
  addFeedback: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        feedback: z.string(),
        falsePositive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.requests.update({
        where: {
          id: input.requestId,
        },
        data: {
          feedback: input.feedback,
          falsePositive: input.falsePositive,
        },
      });
    }),
});
