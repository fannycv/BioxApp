export interface Auth {
  email?: any;
  password?: string;
}

export interface Role {
  id?: number;
  name?: string;
}

export interface Company {
  id?: number;
  name?: string;
  db?: string;
  logo?: string;
  address?: string;
  phone?: string;
}

export interface User {
  id?: string;
  first_name?: string;
  short_name?: string;
  role?: Role;
  last_name?: string;
  email?: string;
  is_active?: boolean;
  phone?: string;
  company?: Company;
}
