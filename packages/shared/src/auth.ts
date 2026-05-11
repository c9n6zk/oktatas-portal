import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Érvénytelen email cím"),
  password: z.string().min(1, "Jelszó kötelező"),
});

export const registerSchema = z.object({
  email: z.string().email("Érvénytelen email cím"),
  password: z.string().min(6, "Min. 6 karakter"),
  name: z.string().min(1, "Név kötelező"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
