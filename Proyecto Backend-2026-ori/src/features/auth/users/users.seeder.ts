import { hashPassword } from "../../../shared/auth/password";
import { User } from "./user.model";

const canonicalUsers = [
  {
    username: "admin",
    email: "admin@pedalibre.com",
    passwordEnv: "SEED_ADMIN_PASSWORD",
  },
  {
    username: "seller",
    email: "seller@pedalibre.com",
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
  let updated = 0;
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
    } else {
      const needsReactivation = user.status !== "active";
      const needsEmailUpdate = user.email !== canonicalUser.email;
      if (needsReactivation || needsEmailUpdate) {
        await user.update({ email: canonicalUser.email, status: "active" });
        if (needsReactivation) reactivated++;
        else updated++;
      } else {
        unchanged++;
      }
    }
  }

  console.log(
    `users: ${created} created, ${reactivated} reactivated, ${updated} updated, ${unchanged} unchanged`,
  );
  return created;
}
