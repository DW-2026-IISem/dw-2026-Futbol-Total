import { User, UserI } from "../user.model";

export type UserResponseDto = Omit<UserI, "password">;

export function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    role_id: user.role_id,
    username: user.username,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
  };
}
