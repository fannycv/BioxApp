export const isRequired = (v: any) =>
  !!v?.toString() || "Este campo es requerido";

export const totalPage = (count: number, size: number) =>
  Math.ceil(count / size);

export const totalSkip = (page: number, size: number) => (page - 1) * size;
