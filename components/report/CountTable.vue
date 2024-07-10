<template>
  <q-card
    v-for="item in items"
    :key="item.nombre"
    class="no-shadow no-border q-mx-sm q-my-sm"
    :bordered="false"
  >
    <q-card-section class="bg-teal text-white">
      <div class="text-h6 text-center">{{ item.nombre }}</div>

      <div class="text-h5 text-center">{{ item.cantidad }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
const client = useSupabaseClient();

const totalClientes = ref(0);
const totalProductos = ref(0);
const totalVentas = ref(0);

const { data: clientes } = useLazyAsyncData<any>(
  "get_total_clientes",
  async () => {
    const { data } = await client.rpc("get_total_clientes");
    return data;
  },
  { server: false }
);

const { data: productos } = useLazyAsyncData<any>(
  "get_total_productos",
  async () => {
    const { data } = await client.rpc("get_total_productos");
    return data;
  },
  { server: false }
);

const { data: ventas } = useLazyAsyncData<any>(
  "get_total_ventas",
  async () => {
    const { data } = await client.rpc("get_total_ventas");
    return data;
  },
  { server: false }
);

const items = [
  { nombre: "Clientes", cantidad: totalClientes },
  { nombre: "Productos", cantidad: totalProductos },
  { nombre: "Ventas", cantidad: totalVentas },
  { nombre: "Otros", cantidad: 12 },
];
// Actualizar las variables reactivas con los valores reales desde Supabase+
onMounted(() => {
  if (clientes) totalClientes.value = clientes.value?.[0]?.total_clientes || 0;
  if (productos)
    totalProductos.value = productos.value?.[0]?.total_productos || 0;
  if (ventas) totalVentas.value = ventas.value?.[0]?.total_ventas || 0;
});
</script>
