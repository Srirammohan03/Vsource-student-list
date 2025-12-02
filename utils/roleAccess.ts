export const roleAccess: Record<string, string[]> = {
  Admin: ["*"],
  SUB_ADMIN: [
    "/student-registration",
    "/student-registration-list",
    "/make-payment",
    "/transactions",
    "/invoice",
  ],
  Accounts: ["/dashboard", "/transactions", "/invoice"],
};
