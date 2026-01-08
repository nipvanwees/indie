import { RepStyle } from "@prisma/client";

export const repStyleToUnit = (repType: RepStyle) => {
    switch (repType) {
        case RepStyle.REPS:
            return "x";
        case RepStyle.TIME:
            return "s";
        case RepStyle.METERS:
            return "m";
        case RepStyle.CALORIES:
            return "cal";
        default:
            return "x";
    }
}