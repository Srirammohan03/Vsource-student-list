import { prisma } from "@/lib/prisma";

export const checkLockOut = async (user: any) => {
  if (user?.isLocked === true) {
    return {
      locked: true,
      message: "Account is locked",
    };
  }

  return { locked: false };
};

export async function handleFailedAttempt(user: any) {
  const nextAttempts = (user?.failedAttempts || 0) + 1;

  if (nextAttempts >= 5) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isLocked: true,
        failedAttempts: 5,
      },
    });

    return {
      locked: true,
      message: "Too many failed attempts. Account has been locked.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: nextAttempts,
    },
  });

  return {
    locked: false,
    attemptsLeft: 5 - nextAttempts,
  };
}

export async function resetAttempts(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedAttempts: 0,
      isLocked: false,
    },
  });
}
