<template>
  <div
    ref="assets_climatizacion_equipos_ubi_chart"
    class="chart bg-dark no-shadow"
  ></div>
</template>

<script lang="ts" setup>
const client = useSupabaseClient();

const assets_climatizacion_equipos_ubi_chart = ref("");

const { drawing, el, data, dispose } = usePieChart();

const { data: items } = useLazyAsyncData<any>(
  "get_ventas_mes",
  async () => {
    const { data } = await client.rpc("get_ventas_mes");
    return data;
  },
  { server: false }
);

watch(items, () => {
  data.value =
    items.value?.map((x: any) => ({
      value: x.total,
      name: `${x.year}-${x.month}`,
    })) || [];

  dispose();

  setTimeout(() => {
    el.value = assets_climatizacion_equipos_ubi_chart.value;
    drawing();
  }, 100);
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 340px;
}
</style>
