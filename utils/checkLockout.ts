import { prisma } from "@/lib/prisma";

export const checkLockOut = async (user: any) => {
  if (user?.isLocked) {
    if (user?.failedAttempts === 5) {
      return {
        locked: true,
        message: `Account locked`,
        redirect: "/account-locked",
      };
    }
  }

  return { locked: false };
};

export async function handleFailedAttempt(user: any) {
  const attempts = user?.failedAttempts + 1;

  if (attempts >= 5) {
    await prisma.user.update({
      where: { id: user?.id },
      data: {
        isLocked: true,
        failedAttempts: attempts,
      },
    });

    return {
      locked: true,
      message: `Too many failed attempts. Account locked .`,
      redirect: "/account-locked",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: attempts },
  });

  return {
    locked: false,
    attemptsLeft: 5 - attempts,
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
