import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { WorkoutBlock } from "@prisma/client";
import { BlockPurpose, BlockStyle } from "@prisma/client";

export const blockRouter = createTRPCRouter({
    updateBlock: publicProcedure
    .input(z.object({
        id: z.string(),
        name: z.string().min(1, "Block name is required"),
        notes: z.string().nullable().default(""),
        style: z.nativeEnum(BlockStyle),
        rounds: z.number().nullable(),
        maxDurationMin: z.number().nullable(),
        specifyRepsPerRound: z.boolean().optional(),
        blockPurpose: z.nativeEnum(BlockPurpose),
    }))
    .mutation(async ({ input, ctx }) => {
        console.log("update block data", input)
        const block = await ctx.db.workoutBlock.update({
            where: {
                id: input.id
            },
            data: {
                name: input.name,
                blockPurpose: input.blockPurpose,
                rounds: input.rounds ? input.rounds : null,
                notes: input.notes ? input.notes : "",
                maxDurationMin: input.maxDurationMin ? input.maxDurationMin : null,
                style: input.style ? input.style : BlockStyle.TOPDOWN,
                specifyRepsPerRound: input.specifyRepsPerRound ? input.specifyRepsPerRound : false,
            }
        });
        return block;
    }
    ),

    rearrangeExercises: publicProcedure
    .input(z.object({
        blockId: z.string(),
        exercises: z.array(z.object({
            id: z.string(),
            order: z.number()
        }))
    }))
    .mutation(async ({ input, ctx }) => {
        // await all
        for (const exercise of input.exercises) {
            await ctx.db.exercisePlanning.update({
                where: {
                    id: exercise.id
                },
                data: {
                    blockOrder: exercise.order
                }
            });
        }

        return "done"
    }),

    duplicateBlock: publicProcedure
    .input(z.object({
        workoutId: z.string(),
        blockId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
        // fetch the workout block
        const block = await ctx.db.workoutBlock.findFirstOrThrow({
            where: {
                id: input.blockId
            },
            include: {
                exercisePlanning: {
                    include: {
                        exercise: true,
                        planningAlternative: true
                    }
                }
            }
        });

        const newBlock = await ctx.db.workoutBlock.create({
            data: {
                name: block.name,
                style: block.style,
                notes: block.notes,
                workoutPlanId: input.workoutId,         
                rounds: block.rounds,
                maxDurationMin: block.maxDurationMin,
                blockPurpose: block.blockPurpose,
                specifyRepsPerRound: block.specifyRepsPerRound,
                exercisePlanning: {
                    createMany: {
                        data: block.exercisePlanning.map((exercise) => ({
                            exerciseId: exercise.exerciseId,
                            minReps: exercise.minReps,
                            maxReps: exercise.maxReps,
                            maxEffort: exercise.maxEffort,
                            repStyle: exercise.repStyle,
                            notes: exercise.notes,
                            useTempo: exercise.useTempo,
                            tempoEccentric: exercise.tempoEccentric,
                            tempoIsometricBottom: exercise.tempoIsometricBottom,
                            tempoConcentric: exercise.tempoConcentric,
                            tempoIsometricTop: exercise.tempoIsometricTop,
                            blockOrder: exercise.blockOrder,
                            useAsBuyIn: exercise.useAsBuyIn,
                            unilateralExecution: exercise.unilateralExecution,
                            repType: exercise.repType,
                            timeStyle: exercise.timeStyle,
                            rxDouble: exercise.rxDouble,
                            rxF: exercise.rxF,
                            rxM: exercise.rxM,
                        }))
                    }
                   }
            }
        });

        return newBlock;

    }),
       

    removeBlock: publicProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
        const block = await ctx.db.workoutBlock.delete({
            where: {
                id: input.id
            }
        });

        return block;
    }
    ),

    completeBlock: publicProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
        const block = await ctx.db.workoutBlock.update({
            where: {
                id: input.id
            },
            data: {
                completed: true
            }
        });

        return block;
    }
    ),

    uncompleteBlock: publicProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
        const block = await ctx.db.workoutBlock.update({
            where: {
                id: input.id
            },
            data: {
                completed: false
            }
        });

        return block;
    }
    ),

addBlockToWorkout: publicProcedure
    .input(z.object({ workoutId: z.string(), blockId: z.string() }))
    .mutation(async ({ input, ctx }) => {

        // get the block and exercises
        const block = await ctx.db.workoutBlock.findFirstOrThrow({
            where: {
                id: input.blockId
            },
            include: {
                exercisePlanning: {
                }
            }
        });

        if(!block) {
            throw new Error("Block not found");
        }

        return await ctx.db.workoutBlock.create({
            data: {
                name: block.name,
                style: block.style,
                notes: block.notes,
                workoutPlanId: input.workoutId,
                rounds: block.rounds, 
                blockPurpose: block.blockPurpose,

                exercisePlanning: {
                    createMany: {
                        data: block.exercisePlanning.map((exercise) => ({
                            exerciseId: exercise.exerciseId,
                            minReps: exercise.minReps,
                            maxReps: exercise.maxReps,
                            repStyle: exercise.repStyle,
                            notes: exercise.notes,
                            useTempo: exercise.useTempo,
                            tempoEccentric: exercise.tempoEccentric,
                            tempoIsometricBottom: exercise.tempoIsometricBottom,
                            tempoConcentric: exercise.tempoConcentric,
                            tempoIsometricTop: exercise.tempoIsometricTop
                        }))
                    }
                }


            }
        })

   }),


      getSuggestedBlocks: publicProcedure
       .input(z.object({ workoutId: z.string() }))
       .query(async ({ input, ctx }) => {
           // get the workout
           const workout = await ctx.db.workoutPlan.findFirstOrThrow({
               where: {
                   id: input.workoutId,
               },
               include: {
                   WorkoutBlock: {
                       include: {
                           exercisePlanning: {
                               include: {
                                   exercise: true
                               }
                           },
                           
                       }
                   },
                   location: true,
               },
           });
   
           // get similar workouts
           const similarWorkouts = await ctx.db.workoutPlan.findMany({
               where: {
                   name: workout.name,
                   completed: true,
                   id: {
                       not: input.workoutId
                   }
               },
               include: {
                   WorkoutBlock: {
                    //    where: {
                    //        name: {
                    //            notIn: workout.WorkoutBlock.map((block) => block.name)
                    //        },
                    //        completed:true
                    //    },
                       include: {
                           exercisePlanning: {
                               include: {
                                   exercise: true
                               }
                           },
                       }
                   },
                //    location: true,
               },
           });

           const res : typeof similarWorkouts[0]["WorkoutBlock"] = []

           similarWorkouts.forEach((workout) => {
            workout.WorkoutBlock.forEach((block) => {
                res.push(block)
            })
           })

           return res
   
        //flatmap of the blocks
        

   
       }),

          // block stuff
   addBlock: publicProcedure
    .input(z.object({
        workoutId: z.string(),
        name: z.string().min(1, "Block name is required"),
        notes: z.string().nullable(),
        style: z.nativeEnum(BlockStyle).nullable(),
        maxDurationMin: z.number().nullable(),
        rounds: z.number().nullable(),
        blockPurpose: z.nativeEnum(BlockPurpose).nullable(),
        specifyRepsPerRound: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
        const block = await ctx.db.workoutBlock.create({
            data: {
                name: input.name,
                style: input.style ? input.style : BlockStyle.TOPDOWN,
                notes: input.notes ? input.notes : "",
                workoutPlanId: input.workoutId,
                rounds: input.rounds ? input.rounds : null,
                maxDurationMin: input.maxDurationMin ? input.maxDurationMin : null,
                blockPurpose: input.blockPurpose ? input.blockPurpose : BlockPurpose.INTENSITY,
                specifyRepsPerRound: input.specifyRepsPerRound ? input.specifyRepsPerRound : false,
            }
        });

        return block;
    }
    ),


})