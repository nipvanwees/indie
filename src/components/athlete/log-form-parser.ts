export type RepStyle = "REPS" | "TIME" | "METERS" | "CALORIES";

export interface ParsedLogInput {
  repType: RepStyle;
  reps?: number;
  time?: number; // in seconds
  distance?: number; // in meters
  calories?: number;
  weight?: number; // in kg
  rpe?: number;
}

/**
 * Parses a smart input string like "10m 205kg @7" into structured log data
 * Examples:
 * - "10m 205kg @7" -> { repType: "METERS", distance: 10, weight: 205, rpe: 7 }
 * - "10 100kg" -> { repType: "REPS", reps: 10, weight: 100 }
 * - "30s @8" -> { repType: "TIME", time: 30, rpe: 8 }
 * - "500cal @6" -> { repType: "CALORIES", calories: 500, rpe: 6 }
 */
export function parseLogInput(input: string): ParsedLogInput {
  const result: ParsedLogInput = {
    repType: "REPS", // default
  };

  if (!input.trim()) {
    return result;
  }

  // Normalize input - replace common variations
  let normalized = input.trim().toLowerCase();

  // Extract RPE (@7, @10, rpe 7, etc.)
  const rpeRegex = /@(\d+)|rpe\s*(\d+)/;
  const rpeMatch = rpeRegex.exec(normalized);
  if (rpeMatch) {
    const rpeValue = parseInt(rpeMatch[1] ?? rpeMatch[2] ?? "", 10);
    if (!isNaN(rpeValue) && rpeValue > 0 && rpeValue <= 10) {
      result.rpe = rpeValue;
    }
    // Remove RPE from string for further processing
    normalized = normalized.replace(/@\d+|rpe\s*\d+/g, "").trim();
  }

  // Extract weight (kg, lbs, kgs, etc.)
  const weightRegex = /(\d+\.?\d*)\s*(?:kg|kgs|pounds?|lbs?)\b/;
  const weightMatch = weightRegex.exec(normalized);
  if (weightMatch) {
    const weightValue = parseFloat(weightMatch[1] ?? "");
    if (!isNaN(weightValue) && weightValue > 0) {
      // Convert pounds to kg if needed
      if (normalized.includes("lb") || normalized.includes("pound")) {
        result.weight = Math.round(weightValue * 0.453592);
      } else {
        result.weight = Math.round(weightValue);
      }
    }
    // Remove weight from string
    normalized = normalized.replace(/(\d+\.?\d*)\s*(?:kg|kgs|pounds?|lbs?)\b/g, "").trim();
  }

  // Extract meters (m, meters, meter)
  const metersRegex = /(\d+\.?\d*)\s*(?:m|meters?|meter)\b/;
  const metersMatch = metersRegex.exec(normalized);
  if (metersMatch) {
    const metersValue = parseFloat(metersMatch[1] ?? "");
    if (!isNaN(metersValue) && metersValue > 0) {
      result.repType = "METERS";
      result.distance = metersValue;
    }
    return result;
  }

  // Extract calories (cal, calories, cals)
  const caloriesRegex = /(\d+\.?\d*)\s*(?:cal|calories?|cals?)\b/;
  const caloriesMatch = caloriesRegex.exec(normalized);
  if (caloriesMatch) {
    const caloriesValue = parseFloat(caloriesMatch[1] ?? "");
    if (!isNaN(caloriesValue) && caloriesValue > 0) {
      result.repType = "CALORIES";
      result.calories = Math.round(caloriesValue);
    }
    return result;
  }

  // Extract time (s, sec, seconds, min, minutes)
  const timeRegex = /(\d+\.?\d*)\s*(?:s|sec|seconds?|min|minutes?)\b/;
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

  // Extract reps (r, reps, rep, or just a number)
  const repsRegex = /(\d+\.?\d*)\s*(?:r|reps?|rep)?\b/;
  const repsMatch = repsRegex.exec(normalized);
  if (repsMatch) {
    const repsValue = parseFloat(repsMatch[1] ?? "");
    if (!isNaN(repsValue) && repsValue > 0) {
      result.repType = "REPS";
      result.reps = Math.round(repsValue);
    }
  }

  return result;
}

