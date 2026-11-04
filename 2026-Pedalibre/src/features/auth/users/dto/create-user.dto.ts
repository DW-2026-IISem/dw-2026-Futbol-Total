export interface CreateUserDto {
  role_id: number;
  username: string;
  email: string;
  password: string;
  status?: "active" | "inactive";
}
