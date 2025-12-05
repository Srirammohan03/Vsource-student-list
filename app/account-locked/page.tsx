"use client";

export default function AccountLockedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <h1 className="text-2xl font-bold text-red-600">Account Locked</h1>
      <p className="mt-4 text-gray-700">
        Your account has been locked due to too many unsuccessful login
        attempts.
      </p>
      <p className="mt-2 text-gray-500">Please contact administrator.</p>
    </div>
  );
}
