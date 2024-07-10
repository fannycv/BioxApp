<template>
  <q-table
    class="no-shadow my-table"
    :rows="items"
    :columns="columns"
    row-key="nombre_producto"
  />
</template>

<script lang="ts" setup>
const { data: items } = useLazyAsyncData<any>(
  "productos_mas_vendidos",
  async () => {
    const { data } = await client.rpc("productos_mas_vendidos");
    return data;
  },
  { server: false }
);

const columns: any[] = [
  {
    name: "nombre_producto",
    required: true,
    label: "Nombre del Producto",
    align: "left",
    field: "nombre_producto",
    sortable: true,
  },
  {
    name: "total_vendido",
    align: "left",
    label: "Total Vendido - Unid.",
    field: "total_vendido",
    sortable: true,
  },
];

const client = useSupabaseClient();

const { data: productosMasVendidos } = await useAsyncData<any>(
  "productos_mas_vendidos",
  async () => {
    const { data } = await client.rpc("get_productos_mas_vendidos");
    return data;
  }
);
</script>

<style lang="scss" scoped>
.my-table {
  height: 340px;
}
</style>
