export interface SessionTokensDto {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

export interface ProfileDto {
  id: number;
  role_id: number;
  username: string;
  email: string | null;
  status: "active" | "inactive";
}
