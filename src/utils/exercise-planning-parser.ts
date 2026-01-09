import type { RepStyle } from "@prisma/client";

export interface ParsedExercisePlanningInput {
  repType?: RepStyle;
  minReps?: number;
  maxReps?: number;
  time?: number; // in seconds
  calories?: number;
  useRx?: boolean;
  rxM?: number;
  rxF?: number;
  maxEffort?: boolean;
}

/**
 * Parses a smart input string for exercise planning
 * Examples:
 * - "3-5x" -> { minReps: 3, maxReps: 5, repType: "REPS" }
 * - "rx28/20" -> { useRx: true, rxM: 28, rxF: 20 }
 * - "45s" -> { time: 45, repType: "TIME" }
 * - "m.e. calories" -> { maxEffort: true, repType: "CALORIES" }
 * - "m.e. 10" -> { maxEffort: true, minReps: 10, repType: "REPS" }
 * - "10-15x calories" -> { minReps: 10, maxReps: 15, repType: "CALORIES" }
 */
export function parseExercisePlanningInput(input: string): ParsedExercisePlanningInput {
  const result: ParsedExercisePlanningInput = {};

  if (!input.trim()) {
    return result;
  }

  // Normalize input - replace common variations
  let normalized = input.trim().toLowerCase();

  // Extract max effort (m.e., me, max effort, max effort set)
  const maxEffortRegex = /\b(?:m\.?e\.?|max\s+effort|max\s+effort\s+set)\b/i;
  if (maxEffortRegex.test(normalized)) {
    result.maxEffort = true;
    // Remove max effort from string for further processing
    normalized = normalized.replace(/\b(?:m\.?e\.?|max\s+effort|max\s+effort\s+set)\b/gi, "").trim();
  }

  // Extract RX (rx28/20, rx 28/20, rx28 20, etc.)
  const rxRegex = /rx\s*(\d+)\s*\/?\s*(\d+)?/i;
  const rxMatch = rxRegex.exec(normalized);
  if (rxMatch) {
    result.useRx = true;
    const rxMValue = parseInt(rxMatch[1] ?? "", 10);
    const rxFValue = rxMatch[2] ? parseInt(rxMatch[2], 10) : undefined;
    if (!isNaN(rxMValue) && rxMValue > 0) {
      result.rxM = rxMValue;
    }
    if (rxFValue !== undefined && !isNaN(rxFValue) && rxFValue > 0) {
      result.rxF = rxFValue;
    }
    // Remove RX from string
    normalized = normalized.replace(/rx\s*\d+\s*\/?\s*\d*/gi, "").trim();
  }

  // Extract rep range (3-5x, 3-5, 10-15x, etc.)
  const repRangeRegex = /(\d+)\s*-\s*(\d+)\s*x?/i;
  const repRangeMatch = repRangeRegex.exec(normalized);
  if (repRangeMatch) {
    const minValue = parseInt(repRangeMatch[1] ?? "", 10);
    const maxValue = parseInt(repRangeMatch[2] ?? "", 10);
    if (!isNaN(minValue) && minValue > 0) {
      result.minReps = minValue;
    }
    if (!isNaN(maxValue) && maxValue > 0 && maxValue >= minValue) {
      result.maxReps = maxValue;
    }
    // Remove rep range from string
    normalized = normalized.replace(/\d+\s*-\s*\d+\s*x?/gi, "").trim();
  }

  // Extract calories (cal, calories, cals) - check for number before calories
  const caloriesRegex = /(\d+\.?\d*)\s*(?:cal|calories?|cals?)\b/i;
  const caloriesMatch = caloriesRegex.exec(normalized);
  if (caloriesMatch) {
    const caloriesValue = parseFloat(caloriesMatch[1] ?? "");
    if (!isNaN(caloriesValue) && caloriesValue > 0) {
      result.repType = "CALORIES";
      result.calories = Math.round(caloriesValue);
    } else {
      // If calories keyword is found but no valid number, just set repType
      result.repType = "CALORIES";
    }
    // Remove calories from string
    normalized = normalized.replace(/(\d+\.?\d*)\s*(?:cal|calories?|cals?)\b/gi, "").trim();
  }

  // Check if "calories" is mentioned without a preceding number (for m.e. calories, 10-15x calories, etc.)
  if (normalized.includes("calories") || normalized.includes("cal") || normalized.includes("cals")) {
    if (!result.repType) {
      result.repType = "CALORIES";
    }
    // Remove calories from string
    normalized = normalized.replace(/\b(?:cal|calories?|cals?)\b/gi, "").trim();
  }

  // Extract time (s, sec, seconds, min, minutes)
  const timeRegex = /(\d+\.?\d*)\s*(?:s|sec|seconds?|min|minutes?)\b/i;
  const timeMatch = timeRegex.exec(normalized);
  if (timeMatch) {
    const timeValue = parseFloat(timeMatch[1] ?? "");
    const unit = timeMatch[0]?.toLowerCase();
    if (!isNaN(timeValue) && timeValue > 0) {
      result.repType = "TIME";
      // Convert minutes to seconds
      if (unit?.includes("min")) {
        result.time = Math.round(timeValue * 60);
      } else {
        result.time = Math.round(timeValue);
      }
    }
    return result;
  }

  // Extract meters (m, meters, meter)
  const metersRegex = /(\d+\.?\d*)\s*(?:m|meters?|meter)\b/i;
  const metersMatch = metersRegex.exec(normalized);
  if (metersMatch) {
    const metersValue = parseFloat(metersMatch[1] ?? "");
    if (!isNaN(metersValue) && metersValue > 0) {
      result.repType = "METERS";
    }
    return result;
  }

  // Extract single reps number (if no range was found)
  if (!result.minReps && !result.maxReps) {
    const repsRegex = /(\d+)\s*(?:x|reps?|rep)?\b/i;
    const repsMatch = repsRegex.exec(normalized);
    if (repsMatch) {
      const repsValue = parseInt(repsMatch[1] ?? "", 10);
      if (!isNaN(repsValue) && repsValue > 0) {
        result.minReps = repsValue;
        if (!result.repType) {
          result.repType = "REPS";
        }
      }
    }
  } else if (!result.repType) {
    // If we have rep range but no repType, default to REPS
    result.repType = "REPS";
  }

  return result;
}

