import { CreateResourceDto } from "./create-resource.dto";

export type UpdateResourceDto = Pick<
  CreateResourceDto,
  "method" | "path" | "description"
>;
