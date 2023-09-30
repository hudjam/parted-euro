import { z } from "zod";
import { router, adminProcedure } from "../trpc";

export const partRouter = router({
  createPartDetail: adminProcedure
    .input(
      z.object({
        name: z.string().min(3),
        partNo: z.string().min(3),
        cars: z.array(z.string()),
        partLength: z.number(),
        width: z.number(),
        height: z.number(),
        weight: z.number(),
        partTypes: z.array(z.string()),
        alternatePartNos: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      console.log(`INPUT -----`);
      console.log(input.partTypes);
      return ctx.prisma.partDetail.create({
        data: {
          name: input.name,
          partNo: input.partNo,
          length: input.partLength,
          width: input.width,
          height: input.height,
          weight: input.weight,
          alternatePartNumbers: input.alternatePartNos,
          partTypes: {
            connect: input.partTypes.map((id) => {
              return { id };
            }),
          },
          cars: {
            connect: input.cars.map((id) => {
              return { id };
            }),
          },
        },
      });
    }),
  updatePartDetail: adminProcedure
    .input(
      z.object({
        partNo: z.string().min(3),
        name: z.string().min(3),
        partLength: z.number(),
        width: z.number(),
        height: z.number(),
        weight: z.number(),
        cars: z.array(z.string()),
        partTypes: z.array(z.string()),
        alternatePartNos: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.partDetail.update({
        where: {
          partNo: input.partNo,
        },
        data: {
          name: input.name,
          length: input.partLength,
          width: input.width,
          height: input.height,
          weight: input.weight,
          alternatePartNumbers: input.alternatePartNos,
          partTypes: {
            deleteMany: {
              NOT: {
                id: {
                  in: input.partTypes,
                },
              },
            },
            connect: input.partTypes.map((id) => {
              return { id };
            }),
          },
          cars: {
            connect: input.cars.map((id) => {
              return { id };
            }),
          },
        },
      });
    }),
  createPart: adminProcedure
    .input(
      z.object({
        partDetailsId: z.string(),
        donorVin: z.string(),
        quantity: z.number().min(1),
        inventoryLocationId: z.string(),
        variant: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.part.create({ data: input });
    }),
  updateInventory: adminProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number().min(1),
        inventoryLocationId: z.string(),
        variant: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.part.update({
        where: {
          id: input.id,
        },
        data: {
          quantity: input.quantity,
          variant: input.variant,
          inventoryLocation: {
            connect: {
              id: input.inventoryLocationId,
            },
          },
        },
      });
    }),
  getAll: adminProcedure
    .input(z.object({ vin: z.string().optional() }))
    .query(({ input, ctx }) => {
      if (input.vin) {
        return ctx.prisma.part.findMany({
          where: {
            donorVin: input.vin,
          },
          include: {
            partDetails: true,
            donor: {
              include: {
                car: true,
              },
            },
            inventoryLocation: true,
          },
        });
      }
      return ctx.prisma.part.findMany({
        include: {
          partDetails: true,
          donor: {
            include: {
              car: true,
            },
          },
          inventoryLocation: true,
        },
      });
    }),
  decreaseQuantity: adminProcedure
    .input(
      z.object({
        id: z.string(),
        quantity: z.number().min(1),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.part.update({
        where: {
          id: input.id,
        },
        data: {
          quantity: {
            decrement: input.quantity,
          },
        },
      });
    }),
  deletePart: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.part.delete({ where: { id: input.id } });
    }),
  getInventoryDetailsById: adminProcedure
    .input(z.array(z.object({ id: z.string() })))
    .query(({ ctx, input }) => {
      return ctx.prisma.part.findMany({
        where: {
          id: {
            in: input.map((item) => item.id),
          },
        },
        include: {
          partDetails: true,
          donor: {
            include: {
              car: true,
            },
          },
          inventoryLocation: true,
        },
      });
    }),
});
