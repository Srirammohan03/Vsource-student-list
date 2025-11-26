import { z } from "zod";

export const studentRegistrationSchema = z.object({
  // PERSONAL
  studentName: z.string().min(2, "Student name is required"),

  nationality: z.string().min(1, "Nationality required"),

  fathersName: z.string().min(1, "Father's name is required"),

  dateOfBirth: z
    .string()
    .min(1, "DOB required")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Invalid date",
    })
    .refine((value) => {
      const d = new Date(value);
      const today = new Date();
      return d < today;
    }, "DOB must be in the past"),

  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),

  email: z.string().email("Invalid email"),

  parentMobile: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[6-9]\d{9}$/.test(v),
      "Enter a valid 10-digit parent mobile number"
    ),

  gender: z.string().min(1, "Gender is required"),

  registrationDate: z.string().min(1, "Registration date is required"),

  status: z.string().min(1, "status required").optional(),

  // ADDRESS
  addressLine1: z.string().min(1, "Address line 1 required"),
  addressLine2: z.string().optional(),

  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),

  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),

  // COURSE
  abroadMasters: z.string().min(1, "Abroad Masters is required"),
  courseName: z.string().min(1, "Course name is required"),

  serviceCharge: z
    .number()
    .refine((v) => !Number.isNaN(v), {
      message: "Service charge is required",
    })
    .nonnegative("Service charge cannot be negative"),

  academicYear: z.string().min(1, "Academic year is required"),

  processedBy: z.string().min(1, "Processed By is required"),
  counselorName: z.string().min(1, "Counselor name is required"),
  officeCity: z.string().min(1, "Office city is required"),
  assigneeName: z.string().min(1, "Assignee name is required"),

  passportNumber: z.string().optional(),
});

export type StudentRegistrationForm = z.infer<typeof studentRegistrationSchema>;
