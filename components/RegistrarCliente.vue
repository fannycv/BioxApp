<template>
  <div>
    <div class="col-10">
      <div class="q-pa-md q-gutter-sm">
        <q-btn
          label="REGISTRAR CLIENTE"
          icon="add"
          color="primary"
          @click="agregarCliente"
        />

        <q-dialog v-model="dialog">
          <q-card style="width: 700px; max-width: 80vw" class="q-pa-lg">
            <q-card-section>
              <div class="text-h6">Nuevo Cliente</div>
            </q-card-section>

            <q-form lass="q-gutter-md" class="row">
              <q-input
                class="col-4 col-md-6"
                filled
                v-model="name"
                label="Nombres y Apellidos o Razon Social *"
                lazy-rules
              />
              <q-select
                class="col-4 col-md-6 q-pl-lg"
                filled
                v-model="tipo_documento"
                label="Tipo de Documento"
                :options="tipoDocumentoOptions"
                option-label="label"
                option-value="value"
              />
              <q-input
                class="col-4 col-md-6 q-mt-lg"
                filled
                v-model="nro_documento"
                label="Nro de Documento"
                lazy-rules
              />
              <q-input
                class="col-4 col-md-6 q-pt-lg q-pl-lg"
                filled
                v-model="telefono"
                label="Telefono *"
                lazy-rules
              />
              <q-input
                class="col-4 col-md-6 q-pt-lg"
                filled
                v-model="distrito"
                label="Distrito *"
                lazy-rules
              />
              <q-input
                class="col-4 col-md-6 q-pt-lg q-pl-lg"
                filled
                v-model="direccion"
                label="Direccion"
                lazy-rules
              />
            </q-form>

            <q-card-actions align="right" class="text-primary">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn
                flat
                label="Guardar"
                v-close-popup
                @click="guardarCliente"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient();
const $q = useQuasar();

const dialog = ref(false);
const accept = ref(false);

const SearchText = ref("");

const id = ref("");
const name = ref("");
const tipo_documento = ref("");
const nro_documento = ref("");
const telefono = ref("");
const distrito = ref("");
const direccion = ref("");

const { data: clientesData } = await useAsyncData<any>("clientes", async () => {
  const { data } = await client
    .from("clientes")
    .select(
      "id, nombres_razonsocial, tipo_documento, nro_documento, telefono, distrito, direccion"
    );
  return data;
});

const tipoDocumentoOptions = ["DNI", "RUC"];

const editarCliente = (cliente: any) => {
  id.value = cliente.id;
  name.value = cliente.nombres_razonsocial;
  tipo_documento.value = cliente.tipo_documento;
  nro_documento.value = cliente.nro_documento;
  telefono.value = cliente.telefono;
  distrito.value = cliente.distrito;
  direccion.value = cliente.direccion;
};

const guardarCliente = async () => {
  if (
    !name.value ||
    !tipo_documento.value ||
    !nro_documento.value ||
    !telefono.value ||
    !distrito.value ||
    !direccion.value
  ) {
    $q.notify({
      color: "red-5",
      textColor: "white",
      icon: "warning",
      message: "Por favor complete todos los campos obligatorios",
    });
    return;
  }

  // Si el cliente tiene un ID, se trata de una actualización
  if (id.value) {
    const { error } = await client
      .from("clientes")
      .update({
        nombres_razonsocial: name.value,
        tipo_documento: tipo_documento.value,
        nro_documento: nro_documento.value,
        telefono: telefono.value,
        distrito: distrito.value,
        direccion: direccion.value,
      })
      .eq("id", id.value);

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
  } else {
    // Si el cliente no tiene un ID, se trata de una inserción
    const { data, error } = await client.from("clientes").insert([
      {
        nombres_razonsocial: name.value,
        tipo_documento: tipo_documento.value,
        nro_documento: nro_documento.value,
        telefono: telefono.value,
        distrito: distrito.value,
        direccion: direccion.value,
      },
    ]);

    if (error) {
      console.error("Error insertando cliente:", error.message);
      return;
    }

    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "check",
      message: "Cliente guardado exitosamente",
    });
  }

  dialog.value = false;

  refreshNuxtData();
};

const agregarCliente = () => {
  // Limpiar los campos de entrada antes de mostrar el cuadro de diálogo
  name.value = "";
  tipo_documento.value = "";
  nro_documento.value = "";
  telefono.value = "";
  distrito.value = "";
  direccion.value = "";

  // Establecer "id" en null para indicar que es un nuevo cliente
  id.value = "";

  // Abrir el cuadro de diálogo para agregar cliente
  dialog.value = true;
};

function onSubmit() {
  if (accept.value !== true) {
    $q.notify({
      color: "red-5",
      textColor: "white",
      icon: "warning",
      message: "You need to accept the license and terms first",
    });
  } else {
    $q.notify({
      color: "green-4",
      textColor: "white",
      icon: "cloud_done",
      message: "Submitted",
    });
  }
}

// Funcion para limpiar los campos después de guardar
function onReset() {
  name.value = "";
  tipo_documento.value = "";
  nro_documento.value = "";
  telefono.value = "";
  distrito.value = "";
  direccion.value = "";

  // Código para cerrar el cuadro de diálogo después de guardar
  dialog.value = false;
}
</script>
