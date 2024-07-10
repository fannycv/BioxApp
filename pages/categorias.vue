<template>
  <div class="flex wi-mt-4">
    <q-btn label="Agregar Categoria" color="primary" @click="dialog = true" />
    <q-space></q-space>
    <q-input
      borderless
      v-model="searchText"
      input-class="text-left"
      label="Buscar Categoria"
      debounce="300"
      dense
      clearable
      @update:model-value="refresh()"
    >
      <template v-slot:prepend>
        <q-icon name="search"></q-icon>
      </template>
    </q-input>
  </div>

  <!-- 
        <q-space></q-space>
        <q-separator vertical />

        <q-avatar class="q-ml-lg">
          <img src="https://cdn.quasar.dev/img/avatar.png" />
        </q-avatar>
      -->

  <q-dialog v-model="dialog" persistent @hide="itemData = {}">
    <q-card style="width: 400px; max-width: 80vw" class="q-pa-lg">
      <q-card-section>
        <p class="text-h6">{{ itemData.id ? "Editar" : "Nueva" }} Categoria</p>
        <q-form lass="q-gutter-md" class="row" ref="form" greedy>
          <q-input
            class="col-4 col-md-12 q-mt-md q-mb-md"
            filled
            v-model="itemData.nombre"
            label="Nombre *"
            autofocus
            required
            :rules="[isRequired]"
            lazy-rules
          />
        </q-form>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          label="Guardar"
          color="primary"
          unelevated
          @click="guardarCategoria()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Cuadro de diálogo de eliminación -->
  <q-dialog v-model="showDeleteDialog" persistent>
    <q-card style="width: 430px" class="q-pa-md">
      <q-card-section>
        <p class="text-h6 text-center">
          ¿Está seguro de que desea eliminar esta categoría?
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
            eliminarCategoria(itemToDelete);
            showDeleteDialog = false;
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-table
    class="my-sticky-header-column-table wi-mt-15"
    flat
    bordered
    :rows="categoriasData"
    :columns="columns"
    row-key="id"
    :loading="pending"
    v-model:pagination="pagination"
    loading-label="..."
    @request="request($event)"
    style="width: 700px"
  >
    <!-- Mostrar las acciones directamente en la columna "Acciones" -->
    <template #body-cell-acciones="props">
      <q-btn
        icon="edit"
        color="warning"
        flat
        round
        @click="
          itemData = { ...props.row };
          dialog = true;
        "
      />
      <q-btn
        icon="delete"
        color="negative"
        flat
        round
        @click="
          showDeleteDialog = true;
          itemToDelete = props.row.id;
        "
      />
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { Categoria, Pagination } from "@/interfaces/global";
import { skip } from "node:test";

const client = useSupabaseClient();
const $q = useQuasar();

const form = ref<any>(null);
const itemData = ref<Categoria>({});
const dialog = ref(false);
const searchText = ref("");

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

const columns: any[] = [
  {
    name: "nombre",
    required: true,
    label: "Nombre",
    align: "left",
    field: "nombre",
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

const {
  data: categoriasData,
  refresh,
  pending,
} = await useAsyncData<any>("categorias", async () => {
  const fields = "id, nombre";

  const rowsPerPage = pagination.value.rowsPerPage || 1000;
  const { data, count } = searchText.value
    ? await client
        .from("categorias")
        .select(fields, {
          count: "exact",
        })
        .textSearch("nombre", searchText.value)
        .order("id", {
          ascending: true,
        })
        .range(pagination.value.skip, pagination.value.skip + rowsPerPage - 1)
    : await client
        .from("categorias")
        .select(fields, {
          count: "exact",
        })
        .order("id", {
          ascending: true,
        })
        .range(pagination.value.skip, pagination.value.skip + rowsPerPage - 1);

  pagination.value.rowsNumber = count || 0;
  pagination.value.total = totalPage(count || 0, rowsPerPage);

  return data;
});

// Para actualizar los filtros
const request = (v: any) => {
  pagination.value = { ...v.pagination };
  pagination.value.skip = totalSkip(
    pagination.value.page,
    pagination.value.rowsPerPage
  );

  refresh();
};

const guardarCategoria = async () => {
  if (await form.value?.validate()) {
    // Si el cliente tiene un ID, se trata de una actualización
    if (itemData.value.id) {
      const { error } = await client
        .from("categorias")
        .update<Categoria>({
          ...itemData.value,
        })
        .eq("id", itemData.value.id);

      if (error) {
        console.error("Error actualizando categoria:", error.message);
        return;
      }

      $q.notify({
        color: "green-4",
        textColor: "white",
        icon: "check",
        message: "Categoria actualizado exitosamente",
      });

      onReset();
      refresh();
    } else {
      // Si la categoria no tiene un ID, se trata de una inserción
      const { error } = await client.from("categorias").insert<Categoria>([
        {
          ...itemData.value,
        },
      ]);

      if (error) {
        console.error("Error insertando categoria:", error.message);
        return;
      }

      onReset();
      refresh();
      $q.notify({
        color: "green-4",
        textColor: "white",
        icon: "check",
        message: "Categoria guardado exitosamente",
      });
    }
  }
};

const eliminarCategoria = async (id: any) => {
  itemToDelete.value = id;
  showDeleteDialog.value = true;
  const { error } = await client.from("categorias").delete().eq("id", id);
  if (error) {
    console.error("Error eliminando categoria:", error.message);
    return;
  }

  onReset();
  refresh();
  // Notificar al usuario que el cliente se eliminó con éxito
  $q.notify({
    color: "green-4",
    textColor: "white",
    icon: "check",
    message: "Categoria eliminado exitosamente",
  });
};

// Funcion para limpiar los campos después de guardar
function onReset() {
  itemData.value = {};
  dialog.value = false;
}
</script>
