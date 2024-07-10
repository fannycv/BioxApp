<template>
  <div class="row">
    <div
      v-for="item in items"
      :key="item.nombre"
      class="col-12 col-sm-6 col-md-3"
    >
      <q-card class="no-shadow no-border q-mx-sm q-my-sm" :bordered="false">
        <q-card-section class="bg-teal text-white d-flex">
          <div class="icono q-ma-xs q-mr-lg">
            <q-icon :name="item.icono" class="icon-large" />
          </div>
          <div class="">
            <div class="text-h6">{{ item.nombre }}</div>
            <div class="text-h5">{{ item.cantidad }}</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="col-12 col-sm-6 col-md-12 q-pa-sm">
      <small class="text-bold">Clientes Frecuentes</small>
      <report-top-customers></report-top-customers>
      <!-- <report-columns-chart /> -->
    </div>

    <div class="col-12 col-sm-6 col-md-8 q-pa-sm">
      <small class="text-bold">Productos mas vendidos</small>
      <report-list-client />
    </div>

    <div class="col-12 col-sm-6 col-md-4 q-pa-sm">
      <small class="text-bold">Ventas Mensuales</small>
      <report-demo-chart />
    </div>

    <div class="col-12 q-pa-sm">
      <report-table-ventas />
    </div>
  </div>
</template>
<script setup lang="ts">
const client = useSupabaseClient();

const { data: clientes } = useLazyAsyncData<any>(
  "get_total_clientes",
  async () => await client.rpc("get_total_clientes")
);

const { data: productos } = useLazyAsyncData<any>(
  "get_total_productos",
  async () => await client.rpc("get_total_productos")
);

const { data: ventas } = useLazyAsyncData<any>(
  "get_total_ventas",
  async () => await client.rpc("get_total_ventas")
);

const items = computed(() => {
  return [
    {
      nombre: "Clientes",
      cantidad: clientes.value?.data?.[0]?.total_clientes || 0,
      icono: "group",
    },
    {
      nombre: "Productos",
      cantidad: productos.value?.data?.[0]?.total_productos || 0,
      icono: "category",
    },
    {
      nombre: "Ventas",
      cantidad: ventas?.value?.data?.[0]?.total_ventas || 0,
      icono: "local_mall",
    },
    { nombre: "Otros", cantidad: 0, icono: "inventory" },
  ];
});
</script>
<style>
.icon-large {
  font-size: 48px; /* Tamaño deseado para el ícono */
  margin-right: 10px; /* Espacio entre el ícono y el texto */
}
.d-flex {
  display: flex;
}
.icono {
  align-items: center;
}
</style>
