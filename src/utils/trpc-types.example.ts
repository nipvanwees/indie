/**
 * Example usage of trpc-types utility
 * 
 * This file demonstrates how to use the type utilities to extract and reuse
 * types from tRPC query outputs in your components.
 */

import type {
    // Generic utility types
    GetRouterOutput,
    GetRouterOutputItem,
    GetNestedType,
    GetDeepNestedType,
    // Pre-defined type aliases
    WorkoutPlanWithRelations,
    WorkoutBlockWithRelations,
    ExercisePlanningWithRelations,
    TrainingSessionWithRelations,
    ExerciseWithRelations,
} from "./trpc-types";

// ============================================================================
// Example 1: Using pre-defined type aliases (Recommended)
// ============================================================================

// ✅ Best practice: Use pre-defined types for common queries
interface WorkoutDisplayProps {
    workout: WorkoutPlanWithRelations;
}

function WorkoutDisplay({ workout }: WorkoutDisplayProps) {
    // workout has all relations: WorkoutBlock, location, etc.
    return <div>{ workout.name } </div>;
}

interface BlockDisplayProps {
    block: WorkoutBlockWithRelations;
}

function BlockDisplay({ block }: BlockDisplayProps) {
    // block has exercisePlanning relation included
    return <div>{ block.name } </div>;
}

// ============================================================================
// Example 2: Using generic utility types for custom queries
// ============================================================================

// Extract the full output type of a query
type MyWorkout = GetRouterOutput<'workoutPlan', 'getWorkout'>;

// Extract a single item from an array query
type WorkoutFromList = GetRouterOutputItem<'workoutPlan', 'getAll'>;

// Extract a nested property (array)
type AllBlocks = GetNestedType<'workoutPlan', 'getWorkout', 'WorkoutBlock'>;

// Extract a nested property (single item from array)
type SingleBlock = GetNestedType<'workoutPlan', 'getWorkout', 'WorkoutBlock', true>;

// Extract a deeply nested property
type ExerciseFromBlock = GetDeepNestedType<
    'workoutPlan',
    'getWorkout',
    ['WorkoutBlock', 'exercisePlanning', 'exercise'],
    true
>;

// ============================================================================
// Example 3: Component props with extracted types
// ============================================================================

interface ExercisePlanningProps {
    planning: ExercisePlanningWithRelations;
}

function ExercisePlanningDisplay({ planning }: ExercisePlanningProps) {
    // planning has exercise relation included
    return <div>{ planning.exercise.name } </div>;
}

// ============================================================================
// Example 4: Using with other routers
// ============================================================================

interface TrainingSessionProps {
    session: TrainingSessionWithRelations;
}

function TrainingSessionDisplay({ session }: TrainingSessionProps) {
    // session has location and logs relations included
    return (
        <div>
        <div>{ session.name } </div>
      { session.location && <div>Location: { session.location.name } </div> }
    {
        session.logs.map((log) => (
            <div key= { log.id } > { log.exercise.name } </div>
        ))
    }
    </div>
  );
}

// ============================================================================
// Example 5: Creating custom type aliases for your specific use cases
// ============================================================================

// You can create your own type aliases in your component files or a shared types file
type WorkoutWithMinimalRelations = GetRouterOutput<'workoutPlan', 'getAll'>[number];

// Or extract specific nested types
type LocationType = GetNestedType<'workoutPlan', 'getWorkout', 'location'>;

