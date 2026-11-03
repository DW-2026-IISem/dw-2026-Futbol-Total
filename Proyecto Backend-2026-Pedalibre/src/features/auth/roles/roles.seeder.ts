import { Role } from "./role.model";

export const SEED_ROLES = [
  {
    name: "ADMIN",
    description: "Administración completa del sistema.",
  },
  {
    name: "OPERACIONES",
    description: "Gestión de estaciones, reservas y alquileres.",
  },
  {
    name: "MANTENIMIENTO",
    description: "Gestión del mantenimiento de bicicletas.",
  },
  {
    name: "SOPORTE",
    description: "Consulta y soporte operativo.",
  },
  {
    name: "CLIENTE",
    description: "Acceso de cliente a sus operaciones.",
  },
] as const;

export async function seedRoles(): Promise<number> {
  let created = 0;

  for (const item of SEED_ROLES) {
    const [role, wasCreated] = await Role.findOrCreate({
      where: { name: item.name },
      defaults: {
        name: item.name,
        description: item.description,
        is_active: true,
      },
    });

    if (wasCreated) {
      created++;
      continue;
    }
    if (role.status !== "active") {
      await role.update({ is_active: true });
    }
  }

  console.log(
    `roles: catálogo reconciliado (${SEED_ROLES.length} roles, ${created} nuevos)`,
  );
  return created;
}
