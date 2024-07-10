<template>
  <div class="flex wi-mt-4">
    <q-btn label="Agregar Cliente" color="primary" @click="dialog = true" />
    <q-space></q-space>
    <q-input
      borderless
      v-model="searchText"
      input-class="text-left"
      label="Buscar Cliente"
      debounce="300"
      dense
      clearable
      @update:model-value="refresh()"
    >
    </q-input>
  </div>

  <q-dialog v-model="dialog" persistent @hide="itemData = {}">
    <q-card style="width: 700px; max-width: 80vw">
      <q-card-section>
        <p class="text-h6">{{ itemData.id ? "Editar" : "Nuevo" }} Cliente</p>

        <q-form
          class="wi-grid wi-grid-cols-1 sm:wi-grid-cols-2 wi-gap-2"
          ref="form"
          greedy
        >
          <q-input
            class="col-12 col-sm-6 col-md-6"
            filled
            v-model="itemData.nombres_razonsocial"
            label="Nombres y Apellidos o Razon Social *"
            lazy-rules
            autofocus
            required
            :rules="[isRequired]"
          />
          <q-select
            class="col-12 col-sm-6 col-md-6"
            filled
            v-model="itemData.tipo_documento"
            label="Tipo de Documento"
            :options="tipoDocumentoOptions"
            option-label="label"
            option-value="value"
          />
          <q-input
            class="col-12 col-sm-6 col-md-6"
            filled
            v-model="itemData.nro_documento"
            label="Nro de Documento"
            lazy-rules
          />
          <q-input
            class="col-12 col-sm-6 col-md-6"
            filled
            v-model="itemData.telefono"
            label="Telefono *"
            lazy-rules
            required
            :rules="[isRequired]"
          />
          <q-input
            class="col-12 col-sm-6 col-md-6"
            filled
            v-model="itemData.direccion"
            label="Dirección"
            lazy-rules
          />
          <q-input
            class="col-12 col-sm-6 col-md-6"
            filled
            v-model="itemData.distrito"
            label="Distrito *"
            lazy-rules
            required
            :rules="[isRequired]"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          label="Guardar"
          color="primary"
          unelevated
          @click="guardarCliente()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Cuadro de diálogo de eliminación -->
  <q-dialog v-model="showDeleteDialog" persistent>
    <q-card style="width: 430px" class="q-pa-md">
      <q-card-section>
        <p class="text-h6 text-center">
          ¿Está seguro de que desea eliminar este cliente?
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
            eliminarCliente(itemToDelete);
            showDeleteDialog = false;
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-table
    class="my-sticky-header-column-table wi-mt-6"
    flat
    bordered
    :rows="clientesData"
    :columns="columns"
    row-key="id"
    :loading="pending"
    v-model:pagination="pagination"
    loading-label="..."
    @request="request($event)"
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
import { Cliente, Pagination } from "@/interfaces/global";
import { skip } from "node:test";

const client = useSupabaseClient();
const $q = useQuasar();

const form = ref<any>(null);
const itemData = ref<Cliente>({});
const dialog = ref(false);
const searchText = ref("");
const tipoDocumentoOptions = ["DNI", "RUC"];

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
    name: "name",
    required: true,
    label: "Apll. y Nom. o Razón Social",
    align: "left",
    field: "nombres_razonsocial",
    sortable: false,
  },
  {
    name: "tipo_documento",
    align: "left",
    label: "Tipo de Documento",
    field: "tipo_documento",
    sortable: false,
  },
  {
    name: "nro_documento",
    align: "left",
    label: "Nro de Documento",
    field: "nro_documento",
    sortable: false,
  },
  {
    name: "telefono",
    align: "left",
    label: "Telefono",
    field: "telefono",
    sortable: false,
  },
  {
    name: "direccion",
    align: "left",
    label: "Direccion",
    field: "direccion",
    sortable: false,
  },
  {
    name: "distrito",
    align: "left",
    label: "Distrito",
    field: "distrito",
    sortable: false,
  },
  {
    name: "acciones",
    align: "left",
    label: "Acciones",
    field: "acciones",
    sortable: false,
  },
];

const {
  data: clientesData,
  refresh,
  pending,
} = await useAsyncData<any>("clientes", async () => {
  const fields =
    "id, nombres_razonsocial, tipo_documento, nro_documento, telefono, distrito, direccion";

  const rowsPerPage = pagination.value.rowsPerPage || 1000000;
  const { data, count } = searchText.value
    ? await client
        .from("clientes")
        .select(fields, {
          count: "exact",
        })
        .textSearch("nombres_razonsocial", searchText.value)

        .order("id", {
          ascending: true,
        })

        .range(pagination.value.skip, pagination.value.skip + rowsPerPage - 1)
    : await client
        .from("clientes")
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

const guardarCliente = async () => {
  if (await form.value?.validate()) {
    // Si el cliente tiene un ID, se trata de una actualización
    if (itemData.value.id) {
      const { error } = await client
        .from("clientes")
        .update<Cliente>({
          ...itemData.value,
        })
        .eq("id", itemData.value.id);

      if (error) {
        console.error("Error actualizando cliente:", error.message);
        return;
      }

      $q.notify({
        color: "green-4",
        textColor: "white",
        icon: "check",
        message: "Cliente actualizado exitosamente",
      });

      onReset();
      refresh();
    } else {
      // Si el cliente no tiene un ID, se trata de una inserción
      const { error } = await client.from("clientes").insert<Cliente>([
        {
          ...itemData.value,
        },
      ]);

      if (error) {
        console.error("Error insertando cliente:", error.message);
        return;
      }

      onReset();
      refresh();
      $q.notify({
        color: "green-4",
        textColor: "white",
        icon: "check",
        message: "Cliente guardado exitosamente",
      });
    }
  }
};

const eliminarCliente = async (id: any) => {
  itemToDelete.value = id;
  showDeleteDialog.value = true;
  const { error } = await client.from("clientes").delete().eq("id", id);
  if (error) {
    console.error("Error deleting client:", error.message);
    return;
  }

  onReset();
  refresh();
  // Notificar al usuario que el cliente se eliminó con éxito
  $q.notify({
    color: "green-4",
    textColor: "white",
    icon: "check",
    message: "Cliente eliminado exitosamente",
  });
};

// Funcion para limpiar los campos después de guardar
function onReset() {
  itemData.value = {};
  dialog.value = false;
}
</script>
