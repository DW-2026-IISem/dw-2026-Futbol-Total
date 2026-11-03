import { Resource, ResourceI } from "../resource.model";

export type ResourceResponseDto = ResourceI;

export function toResourceResponse(resource: Resource): ResourceResponseDto {
  return {
    id: resource.id,
    method: resource.method,
    path: resource.path,
    description: resource.description,
    status: resource.status,
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
  };
}
