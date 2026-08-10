import { z } from "zod";

// Mirrors the backend's SignupRequest validator (app/schemas/user.py) so
// the user gets instant client-side feedback, while the backend remains
// the source of truth and re-validates independently — never trust the
// client alone.
export const signupSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
