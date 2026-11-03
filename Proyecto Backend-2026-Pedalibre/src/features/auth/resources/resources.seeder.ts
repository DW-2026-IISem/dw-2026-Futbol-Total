import { Resource } from "./resource.model";
import { RESOURCE_CATALOG } from "./resource-catalog";

export async function seedResources(): Promise<number> {
  let created = 0;

  for (const item of RESOURCE_CATALOG) {
    const [resource, wasCreated] = await Resource.findOrCreate({
      where: { method: item.method, path: item.path },
      defaults: {
        method: item.method,
        path: item.path,
        description: item.description,
        is_active: true,
      },
    });

    if (wasCreated) {
      created++;
      continue;
    }
    if (resource.status !== "active") {
      await resource.update({ is_active: true });
    }
  }

  console.log(
    `resources: catálogo reconciliado (${RESOURCE_CATALOG.length} recursos, ${created} nuevos)`,
  );
  return created;
}
