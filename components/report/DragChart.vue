<template>
  <div ref="top_customers_chart" class="chart bg-dark no-shadow"></div>
</template>

<script lang="ts" setup>
const client = useSupabaseClient();

const top_customers_chart = ref<any>(null);

const { drawing, el, data, dispose } = useDragChart();

const { data: items } = useLazyAsyncData<any>(
  "get_top_clients",
  async () => {
    const { data } = await client.rpc("get_top_clients()");
    return data;
  },
  { server: false }
);

watch(items, () => {
  data.value = [
    {
      country: "USA",
      value: 2025,
    },
    {
      country: "China",
      value: 1882,
    },
    {
      country: "Japan",
      value: 1809,
    },
    {
      country: "Germany",
      value: 1322,
    },
    {
      country: "UK",
      value: 1122,
    },
  ];

  dispose();
  setTimeout(() => {
    el.value = top_customers_chart.value;
    drawing();
  }, 100);
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
