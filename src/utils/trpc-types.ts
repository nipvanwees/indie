/**
 * Utility types for extracting and reusing types from tRPC RouterOutputs
 * 
 * This file provides helper types to extract types from tRPC query outputs,
 * making it easy to reuse types in component props without manually defining them.
 * 
 * @example
 * // Get the output type of a specific query
 * type Workout = RouterOutputs['workoutPlan']['getWorkout']
 * 
 * @example
 * // Get a single item from an array query
 * type Workout = RouterOutputs['workoutPlan']['getAll'][number]
 * 
 * @example
 * // Get a nested relation type
 * type WorkoutBlock = RouterOutputs['workoutPlan']['getWorkout']['WorkoutBlock'][number]
 */

import type { RouterOutputs } from "~/trpc/react";

/**
 * Extract the output type of a specific tRPC procedure
 * 
 * @example
 * type Workout = GetRouterOutput<'workoutPlan', 'getWorkout'>
 */
export type GetRouterOutput<
  TRouter extends keyof RouterOutputs,
  TProcedure extends keyof RouterOutputs[TRouter]
> = RouterOutputs[TRouter][TProcedure];

/**
 * Extract a single item from an array query output
 * 
 * @example
 * type Workout = GetRouterOutputItem<'workoutPlan', 'getAll'>
 */
export type GetRouterOutputItem<
  TRouter extends keyof RouterOutputs,
  TProcedure extends keyof RouterOutputs[TRouter]
> = RouterOutputs[TRouter][TProcedure] extends (infer T)[]
  ? T
  : RouterOutputs[TRouter][TProcedure] extends readonly (infer T)[]
  ? T
  : never;

/**
 * Extract a nested property type from a router output
 * 
 * @example
 * type WorkoutBlocks = GetNestedType<'workoutPlan', 'getWorkout', 'WorkoutBlock'>
 * type WorkoutBlock = GetNestedType<'workoutPlan', 'getWorkout', 'WorkoutBlock', true> // single item
 */
export type GetNestedType<
  TRouter extends keyof RouterOutputs,
  TProcedure extends keyof RouterOutputs[TRouter],
  TProperty extends keyof NonNullable<RouterOutputs[TRouter][TProcedure]>,
  TSingleItem extends boolean = false
> = TSingleItem extends true
  ? NonNullable<RouterOutputs[TRouter][TProcedure]>[TProperty] extends (infer T)[]
    ? T
    : NonNullable<RouterOutputs[TRouter][TProcedure]>[TProperty] extends readonly (infer T)[]
    ? T
    : NonNullable<RouterOutputs[TRouter][TProcedure]>[TProperty]
  : NonNullable<RouterOutputs[TRouter][TProcedure]>[TProperty];

/**
 * Extract a deeply nested property type from a router output
 * 
 * @example
 * type Exercise = GetDeepNestedType<'workoutPlan', 'getWorkout', ['WorkoutBlock', 'exercisePlanning', 'exercise'], true>
 */
export type GetDeepNestedType<
  TRouter extends keyof RouterOutputs,
  TProcedure extends keyof RouterOutputs[TRouter],
  TPath extends readonly string[],
  TSingleItem extends boolean = false
> = TPath extends readonly [infer First, ...infer Rest]
  ? First extends keyof NonNullable<RouterOutputs[TRouter][TProcedure]>
    ? Rest extends readonly string[]
      ? GetDeepNestedType<
          TRouter,
          TProcedure,
          Rest,
          TSingleItem
       > extends never
        ? NonNullable<RouterOutputs[TRouter][TProcedure]>[First]
        : GetDeepNestedType<
            TRouter,
            TProcedure,
            Rest,
            TSingleItem
          > extends keyof NonNullable<RouterOutputs[TRouter][TProcedure]>[First]
        ? NonNullable<
            NonNullable<RouterOutputs[TRouter][TProcedure]>[First]
          >[GetDeepNestedType<TRouter, TProcedure, Rest, TSingleItem>]
        : never
      : NonNullable<RouterOutputs[TRouter][TProcedure]>[First]
    : never
  : never;

// ============================================================================
// Pre-defined type aliases for common queries
// ============================================================================

/**
 * WorkoutPlan types
 */
export type WorkoutPlanWithRelations = GetRouterOutput<'workoutPlan', 'getWorkout'>;
export type WorkoutPlanFromGetAll = GetRouterOutputItem<'workoutPlan', 'getAll'>;
export type WorkoutBlockWithRelations = GetNestedType<'workoutPlan', 'getWorkout', 'WorkoutBlock', true>;
export type ExercisePlanningWithRelations = GetDeepNestedType<
  'workoutPlan',
  'getWorkout',
  ['WorkoutBlock', 'exercisePlanning'],
  true
>;
export type ExerciseFromWorkout = GetDeepNestedType<
  'workoutPlan',
  'getWorkout',
  ['WorkoutBlock', 'exercisePlanning', 'exercise'],
  true
>;
export type LocationFromWorkout = GetNestedType<'workoutPlan', 'getWorkout', 'location'>;

/**
 * TrainingSession types
 */
export type TrainingSessionWithRelations = GetRouterOutput<'trainingSession', 'getById'>;
export type TrainingSessionFromGetLatest = GetRouterOutputItem<'trainingSession', 'getLatest'>;
export type LocationFromTrainingSession = GetNestedType<'trainingSession', 'getById', 'location'>;
export type LogFromTrainingSession = GetNestedType<'trainingSession', 'getById', 'logs', true>;

/**
 * Exercise types
 */
export type ExerciseWithRelations = GetRouterOutput<'exercise', 'getById'>;
export type ExerciseFromGetAll = GetRouterOutputItem<'exercise', 'getAll'>;
export type LogFromExercise = GetNestedType<'exercise', 'getById', 'Log', true>;

