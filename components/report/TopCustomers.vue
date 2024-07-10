<template>
  <div ref="top_customers_chart" class="chart bg-dark no-shadow"></div>
</template>

<script lang="ts" setup>
const client = useSupabaseClient();

const top_customers_chart = ref<any>(null);

const { drawing, el, data, dispose } = useColumnChart();

const { data: items } = useLazyAsyncData<any>(
  "get_top_clients",
  async () => {
    const { data } = await client.rpc("get_top_clients");
    return data;
  },
  { server: false }
);

watch(items, () => {
  data.value = items.value.map((item: any) => ({
    name: item.nombres_razonsocial,
    steps: item.total_compras,
    pictureSettings: {
      src: getRandomCustomerImage(), // Llamada a la función para obtener una imagen aleatoria
    },
  }));

  dispose();
  setTimeout(() => {
    el.value = top_customers_chart.value;
    drawing();
  }, 100);
});

// Función para obtener una imagen aleatoria para el cliente
function getRandomCustomerImage(): string {
  const images = [
    "https://cdn-icons-png.flaticon.com/512/3607/3607444.png",
    "https://us.123rf.com/450wm/larichev89/larichev891903/larichev89190300012/124784227-icono-de-usuario-azul-en-estilo-plano-con-sombra-larga-bot%C3%B3n-de-cuenta.jpg?ver=6",
    "https://i.pinimg.com/originals/ff/a0/9a/ffa09aec412db3f54deadf1b3781de2a.png",
    "https://cdn3.iconfinder.com/data/icons/vector-icons-6/96/256-512.png",
    "https://cdn-icons-png.flaticon.com/512/6017/6017051.png",
    "https://cdn-icons-png.flaticon.com/512/6188/6188625.png",
    "https://cdn-icons-png.flaticon.com/512/5557/5557402.png",
    "https://static.thenounproject.com/png/4035892-200.png",
    "https://cdn-icons-png.flaticon.com/512/6460/6460121.png",
    "https://img.freepik.com/free-icon/user_318-583482.jpg?w=360",
    "https://cdn-icons-png.flaticon.com/256/1053/1053244.png",
    "https://cdn-icons-png.flaticon.com/512/3177/3177440.png",
    "https://cdn-icons-png.flaticon.com/512/552/552721.png",
    "https://cdn-icons-png.flaticon.com/512/6017/6017051.png",
  ];

  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}
</script>

<style scoped>
.chart {
  width: 100%;
  height: 400px;
}
</style>
