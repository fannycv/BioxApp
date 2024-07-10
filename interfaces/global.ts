export type Item = {
  icon: string;
  title: string | any;
  to: string;
  name: string;

  submenu?: SubmenuItem[];
};

interface SubmenuItem {
  icon: string;
  title: string;
  to: string;
  name: string;
}

export type Cliente = {
  id?: number;
  nombres_razonsocial?: string;
  tipo_documento?: string;
  nro_documento?: string;
  telefono?: string;
  distrito?: string;
  direccion?: string;
};

export type Categoria = {
  id?: number;
  nombre?: string;
};

export type Producto = {
  id?: number;
  id_categoria?: number;
  categoria?: Categoria;
  nombre?: string;
  descripcion?: string;
  imagen?: string;
  precio_venta?: string;
  stock?: string;
};

export type Pagination = {
  descending: boolean;
  page: number;
  rowsNumber: number;
  rowsPerPage: number;
  skip: number;
  sortBy?: any;
  total: number;
};
