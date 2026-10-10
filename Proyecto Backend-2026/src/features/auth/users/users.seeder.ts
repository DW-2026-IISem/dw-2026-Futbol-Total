import { hashPassword } from "../../../shared/auth/password";
import { User } from "./user.model";

const canonicalUsers = [
  {
    username: "admin",
    email: "admin@storelab.local",
    passwordEnv: "SEED_ADMIN_PASSWORD",
  },
  {
    username: "seller",
    email: "seller@storelab.local",
    passwordEnv: "SEED_SELLER_PASSWORD",
  },
] as const;

export async function seedUsers(): Promise<number> {
  const usersWithPasswords = canonicalUsers.map((canonicalUser) => {
    const password = process.env[canonicalUser.passwordEnv];
    if (!password || password.length < 12) {
      throw new Error(
        `${canonicalUser.passwordEnv} must be set to a password of at least 12 characters`,
      );
    }

    return { ...canonicalUser, password };
  });

  let created = 0;
  let reactivated = 0;
  let unchanged = 0;

  for (const canonicalUser of usersWithPasswords) {
    const [user, wasCreated] = await User.findOrCreate({
      where: { username: canonicalUser.username },
      defaults: {
        username: canonicalUser.username,
        email: canonicalUser.email,
        password: await hashPassword(canonicalUser.password),
        avatar: null,
        status: "active",
      },
    });

    if (wasCreated) {
      created++;
    } else if (user.status !== "active") {
      await user.update({ status: "active" });
      reactivated++;
    } else {
      unchanged++;
    }
  }

  console.log(
    `users: ${created} created, ${reactivated} reactivated, ${unchanged} already active`,
  );
  return created;
}
