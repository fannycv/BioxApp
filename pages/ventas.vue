<template>
  <div>
    <div class="col-10">
      <div class="d-flex justify-center">
        <q-btn color="primary q-ml-md q-mb-lg q-mt-lg" :to="'/nueva-venta'"
          >NUEVA VENTA</q-btn
        >
        <q-space></q-space>

        <q-input
          borderless
          v-model="SearchText"
          input-class="text-left"
          class="q-mr-xl"
          label="Buscar Ventas"
        >
          <template v-slot:prepend>
            <q-icon name="search"></q-icon>
          </template>
        </q-input>
      </div>

      <!-- Cuadro de diálogo de eliminación -->
      <q-dialog v-model="showDeleteDialog" persistent>
        <q-card style="width: 430px" class="q-pa-md">
          <q-card-section>
            <p class="text-h6 text-center">
              ¿Está seguro de que desea eliminar esta venta?
            </p>
            <p class="text-center">Esta acción es irreversible</p>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn
              label="Eliminar"
              color="negative"
              unelevated
              @click="
                eliminarVenta(itemToDelete);
                showDeleteDialog = false;
              "
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <div class="q-pa-md">
        <q-table
          class="my-sticky-header-column-table"
          flat
          bordered
          :rows="buscarVenta"
          :columns="columns"
          v-model:pagination="pagination"
          row-key="id"
        >
          <template v-slot:body-cell-acciones="props">
            <q-btn @click="" icon="visibility" color="primary" flat round />
            <q-btn
              @click="
                showDeleteDialog = true;
                itemToDelete = props.row.id;
              "
              icon="delete"
              color="negative"
              flat
              round
            />
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Pagination } from "@/interfaces/global";
import { useRouter } from "vue-router";
const $router = useRouter();

const client = useSupabaseClient();
const $q = useQuasar();

const dialog = ref(false);
const accept = ref(false);

const SearchText = ref("");
const showDeleteDialog = ref(false);
const itemToDelete = ref(null);

const pagination = ref<Pagination>({
  descending: false,
  page: 1,
  rowsNumber: 0,
  rowsPerPage: 10,
  skip: 0,
  sortBy: null,
  total: 0,
});

const { data: ventasData } = await useAsyncData<any>("ventas", async () => {
  const { data } = await client
    .from("ventas")
    .select(
      "id, id_cliente, fecha, total, forma_pago, observaciones, clientes(nombres_razonsocial)"
    );
  return data;
});
const { data: detalleVentasData } = await useAsyncData<any>(
  "detalle_ventas",
  async () => {
    const { data } = await client
      .from("detalle_ventas")
      .select("id_venta, importe, descuento");
    return data;
  }
);
const columns: any[] = [
  {
    name: "distrito",
    align: "left",
    label: "CLIENTE",
    field: (row: any) => row.clientes?.nombres_razonsocial || "Sin cliente",
    sortable: true,
  },
  {
    name: "fecha",
    required: true,
    label: "FECHA DE COMPRA",
    align: "left",
    field: "fecha",
    sortable: true,
  },
  {
    name: "nro_documento",
    align: "left",
    label: "TOTAL",
    field: "total",
    sortable: true,
  },
  {
    name: "telefono",
    align: "left",
    label: "TIPO DE PAGO",
    field: "forma_pago",
    sortable: true,
  },

  {
    name: "acciones",
    align: "left",
    label: "Acciones",
    field: "acciones",
    sortable: true,
  },
];

const buscarVenta = computed(() => {
  if (!SearchText.value) return ventasData.value;
  const searchText = SearchText.value.toLowerCase();
  return ventasData.value.filter(
    (venta: any) =>
      venta.clientes?.nombres_razonsocial.toLowerCase().includes(searchText) ||
      venta.fecha.toLowerCase().includes(searchText)
  );
});

const eliminarVenta = async (id: any) => {
  itemToDelete.value = id;
  showDeleteDialog.value = true;
  const { data, error } = await client.from("ventas").delete().eq("id", id);
  if (error) {
    console.error("Error eliminando venta:", error.message);
    return;
  }

  ventasData.value = ventasData.value.filter((venta: any) => venta.id !== id);

  $q.notify({
    color: "green-4",
    textColor: "white",
    icon: "check",
    message: "Venta eliminado exitosamente",
  });
};

interface Affiliation {
  first_name?: string;
  last_name?: string;
  document_id?: string;
  id?: string;
  phone?: string;
  email?: string;
  state?: string;
  province?: string;
  district?: string;
}
const detalleVenta = (ventaId: any) => {
  // Redirigir a la página de detalle de la venta con el ID correspondiente
  $router.push(`/detalle-venta/${ventaId}`);
};
</script>
<style lang="sass">
.my-sticky-header-column-table
  /* height or max-height is important */
  height: 410px

  /* specifying max-width so the example can
    highlight the sticky column on any browser window */

  td:first-child
    /* bg color is important for td; just specify one */
    background-color: accent

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #B288FF

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
