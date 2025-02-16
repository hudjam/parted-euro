import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../trpc";

const currentYear: number = new Date().getFullYear();

export const donorRouter = router({
  createDonor: adminProcedure
    .input(
      z.object({
        vin: z.string().min(5),
        cost: z.number().min(0).max(100000000),
        carId: z.string().min(3),
        year: z.number().min(1930).max(currentYear),
        mileage: z.number().min(0).max(100000000),
        hideFromSearch: z.boolean(),
        dateInStock: z.date(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.donor.create({ data: input });
    }),
  getAll: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.donor.findMany();
  }),
  getAllWithCars: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.donor.findMany({ include: { car: true } });
  }),
  getAllWithParts: adminProcedure.query(async ({ ctx }) => {
    const donors = await ctx.prisma.donor.findMany({
      select: {
        vin: true,
        parts: {
          select: {
            donorVin: true,
            listing: {
              select: {
                id: true,
              },
            },
            id: true,
            partDetails: true,
            variant: true,
          },
        },
      },
    });
    return donors.map((donor) => {
      return {
        label: donor.vin,
        options: donor.parts.map((part) => {
          return {
            label: `${part.donorVin} - ${part.partDetails.name} (${
              part.partDetails.partNo
            }) ${part.variant ? `- ${part.variant}` : ""} `,
            value: part.id,
            tab: donor.vin,
            listing: !!part.listing.length,
          };
        }),
      };
    });
  }),
  getAllCurrentlyWrecking: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.donor.findMany({
      where: {
        hideFromSearch: false,
        parts: {
          some: {
            listing: {
              some: {
                active: true,
              },
            },
          },
        },
      },
      select: {
        vin: true,
        year: true,
        mileage: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
        car: {
          select: {
            series: true,
            generation: true,
            model: true,
          },
        },
      },
    });
  }),
  getSingleWreck: publicProcedure
    .input(
      z.object({
        vin: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.donor.findUnique({
        where: {
          vin: input.vin,
        },
        select: {
          vin: true,
          year: true,
          mileage: true,
          imageUrl: true,
          car: {
            select: {
              series: true,
              generation: true,
              model: true,
            },
          },
          parts: {
            select: {
              partDetails: {
                select: {
                  partNo: true,
                },
              },
              listing: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                },
              },
            },
          },
        },
      });
    }),
  getFourWrecks: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.donor.findMany({
      take: 4,
      where: {
        imageUrl: {
          not: undefined,
        },
      },
      select: {
        vin: true,
        year: true,
        imageUrl: true,
        car: {
          select: {
            series: true,
            generation: true,
            model: true,
          },
        },
      },
    });
  }),
  getAllDashboard: adminProcedure.query(({ ctx }) => {
    return ctx.prisma.donor.findMany({
      select: {
        vin: true,
        year: true,
        mileage: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
        car: {
          select: {
            series: true,
            generation: true,
            model: true,
            id: true,
          },
        },
        cost: true,
        parts: {
          select: {
            sold: true,
            soldPrice: true,
            listing: {
              select: {
                id: true,
                price: true,
                active: true,
              },
            },
          },
        },
        createdAt: true,
      },
    });
  }),
  deleteDonor: adminProcedure
    .input(
      z.object({
        vin: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.donor.delete({
        where: {
          vin: input.vin,
        },
      });
    }),
  updateDonor: adminProcedure
    .input(
      z.object({
        vin: z.string(),
        cost: z.number().min(0).max(100000000),
        carId: z.string().min(3),
        year: z.number().min(1930).max(currentYear),
        mileage: z.number().min(0).max(100000000),
        hideFromSearch: z.boolean(),
        dateInStock: z.date(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.donor.update({
        where: {
          vin: input.vin,
        },
        data: {
          cost: input.cost,
          carId: input.carId,
          year: input.year,
          mileage: input.mileage,
          hideFromSearch: input.hideFromSearch,
          dateInStock: input.dateInStock,
        },
      });
    }),
  getByVin: publicProcedure
    .input(
      z.object({
        vin: z.string(),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.donor.findUnique({
        where: {
          vin: input.vin,
        },
        include: {
          car: true,
          images: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    }),
  getAllPublic: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.donor.findMany({
      where: {
        hideFromSearch: false,
      },
      include: {
        car: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
});
