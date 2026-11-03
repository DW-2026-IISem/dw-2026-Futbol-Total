import { hashPassword } from "../../../shared/auth/password";
import { Role } from "../roles/role.model";
import { User } from "./user.model";

const canonicalUsers = [
  {
    username: "admin",
    email: "admin@pedalibre.com",
    passwordEnv: "SEED_ADMIN_PASSWORD",
  },
] as const;

export async function seedUsers(): Promise<number> {
  const adminRole = await Role.findOne({ where: { name: "ADMIN", is_active: true } });
  if (!adminRole) throw new Error("Run the roles seeder before the users seeder");

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
        role_id: adminRole.id,
        username: canonicalUser.username,
        email: canonicalUser.email,
        password: await hashPassword(canonicalUser.password),
        is_active: true,
      },
    });

    if (wasCreated) {
      created++;
    } else {
      const needsReactivation = !user.is_active;
      const needsEmailUpdate = user.email !== canonicalUser.email;
      const needsRoleUpdate = user.role_id !== adminRole.id;
      if (needsReactivation || needsEmailUpdate || needsRoleUpdate) {
        await user.update({
          email: canonicalUser.email,
          role_id: adminRole.id,
          is_active: true,
        });
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
