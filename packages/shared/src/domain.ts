import { z } from "zod";

// SchoolClass
export const schoolClassSchema = z.object({
  startYear: z.number().int().min(1990).max(2100),
  identifier: z.string().min(1).max(10),
});
export type SchoolClassInput = z.infer<typeof schoolClassSchema>;

// Subject
export const subjectSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  bookTitle: z.string().optional().nullable(),
  lessons: z.array(z.string()).default([]),
});
export type SubjectInput = z.infer<typeof subjectSchema>;

// SubjectAssignment
export const subjectAssignmentSchema = z.object({
  year: z.number().int().min(1990).max(2100),
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  teacherId: z.string().min(1),
});
export type SubjectAssignmentInput = z.infer<typeof subjectAssignmentSchema>;

// Grade types — must match Prisma enum GradeType.
export const GRADE_TYPES = ["ORAL", "TEST", "HOMEWORK", "MID_YEAR", "YEAR_END"] as const;
export type GradeType = (typeof GRADE_TYPES)[number];

export const GRADE_TYPE_LABEL: Record<GradeType, string> = {
  ORAL: "Felelés",
  TEST: "Témazáró",
  HOMEWORK: "Házi",
  MID_YEAR: "Féléves",
  YEAR_END: "Év végi",
};

// Default weight by type (the seed uses these, the UI can override).
export const DEFAULT_GRADE_WEIGHT: Record<GradeType, number> = {
  ORAL: 1,
  TEST: 3,
  HOMEWORK: 1,
  MID_YEAR: 1,
  YEAR_END: 1,
};

export const gradeSchema = z.object({
  studentId: z.string().min(1),
  assignmentId: z.string().min(1),
  value: z.number().int().min(1).max(5),
  type: z.enum(GRADE_TYPES).default("ORAL"),
  weight: z.number().int().min(1).max(10).optional(),
  comment: z.string().optional().nullable(),
});
export type GradeInput = z.infer<typeof gradeSchema>;

// User update (admin function)
export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["SUPERADMIN", "ADMIN", "INSTRUCTOR", "STUDENT"]).optional(),
  classId: z.string().nullable().optional(),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

// Event (optional feature)
export const eventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
});
export type EventInput = z.infer<typeof eventSchema>;
