export interface AdminUser {
  id: number;
  role_id: number;
  username: string;
  email: string | null;
  status: 'active' | 'inactive';
}

export interface AdminRole {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
}

export interface AdminResource {
  id: number;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string | null;
  status: 'active' | 'inactive';
}

export interface RoleGrant {
  id: number;
  role_id: number;
  resource_id: number;
  is_allowed: boolean;
  status: 'active' | 'inactive';
  role?: { id: number; name: string } | null;
  resource?: { id: number; method: string; path: string; description: string | null } | null;
}
