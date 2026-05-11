import { DEFAULT_GRADE_WEIGHT, type GradeType } from "./domain";

export interface GradeLike {
  value: number;
  weight?: number | null;
  type?: GradeType;
}

/**
 * Súlyozott átlag számítás. Ha a weight nincs megadva, a típushoz tartozó
 * default súlyt használja (felelés 1, témazáró 3, stb.).
 * Az év végi (YEAR_END) jegyeket kihagyja az átlagból.
 */
export function calculateWeightedAverage(grades: GradeLike[]): number | null {
  const eligible = grades.filter((g) => g.type !== "YEAR_END");
  if (eligible.length === 0) return null;

  let weightedSum = 0;
  let totalWeight = 0;
  for (const g of eligible) {
    const w = g.weight ?? (g.type ? DEFAULT_GRADE_WEIGHT[g.type] : 1);
    weightedSum += g.value * w;
    totalWeight += w;
  }
  if (totalWeight === 0) return null;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Az év végi (zárójegy) javaslat: a súlyozott átlag kerekítve.
 * 3.5 → 4, 3.49 → 3.
 */
export function suggestedYearEndGrade(grades: GradeLike[]): number | null {
  const avg = calculateWeightedAverage(grades);
  if (avg === null) return null;
  return Math.round(avg);
}
