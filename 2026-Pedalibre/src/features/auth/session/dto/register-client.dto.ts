export interface RegisterClientDto {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  document_type: string;
  document_number: string;
  phone?: string | null;
}
