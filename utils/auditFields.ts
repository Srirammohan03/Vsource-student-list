export const STUDENT_ALLOWED_FIELDS = [
  // Personal Information
  "studentName",
  "nationality",
  "fathersName",
  "dateOfBirth",
  "mobileNumber",
  "email",
  "parentMobile",
  "gender",
  "registrationDate",

  // Present Address
  "addressLine1",
  "addressLine2",
  "country",
  "state",
  "city",
  "district",
  "pincode",

  // Course Details
  "abroadMasters",
  "courseName",
  "serviceCharge",
  "academicYear",
  "processedBy",
  "counselorName",
  "officeCity",
  "assigneeName",
  "passportNumber",

  // Status
  "status",
];

export const USER_ALLOWED_FIELDS = [
  "employeeId",
  "name",
  "email",
  "loginType",
  "phone",
  "password",
  "branch",
  "role",
];

export const PAYMENT_ALLOWED_FIELDS = [
  "feeType",
  "subFeeType",
  "paymentMethod",
  "amount",
  "invoiceNumber",
  "status",
  "bankDetails",
  "gst",
  "gstAmount",
  "referenceNo",
];

function normalize(value: any) {
  if (value instanceof Date) return value.toISOString().split("T")[0];
  if (typeof value === "string" && !isNaN(Date.parse(value)))
    return new Date(value).toISOString().split("T")[0];
  if (typeof value === "number") return Number(value);
  return value;
}

export function getChangedFields(
  oldData: Record<string, any>,
  newData: Record<string, any>,
  allowedFields: string[]
) {
  const oldValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};

  for (const field of allowedFields) {
    const oldVal = normalize(oldData[field]);
    const newVal = normalize(newData[field]);

    if (oldVal !== newVal) {
      oldValues[field] = oldData[field]; // keep original formats
      newValues[field] = newData[field];
    }
  }

  return { oldValues, newValues };
}
