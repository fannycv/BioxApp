<template>
  <div class="flex wi-mt-4">
    <q-btn label="Agregar Producto" color="primary" @click="dialog = true" />
    <q-space></q-space>
    <q-input
      borderless
      v-model="searchText"
      input-class="text-left"
      label="Buscar Producto"
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

  <q-dialog v-model="dialog" persistent @hide="itemData = {}">
    <q-card style="width: 800px; max-width: 80vw" class="q-pa-lg">
      <q-card-section>
        <p class="text-h6">{{ itemData.id ? "Editar" : "Nuevo" }} Producto</p>
        <div class="row">
          <div class="col-6">
            <q-form
              class="wi-grid wi-grid-cols-1 sm:wi-grid-cols-1 wi-gap-2"
              ref="form"
              greedy
            >
              <q-input
                class="col-12 col-sm-6 col-md-6"
                filled
                v-model="itemData.nombre"
                label="Nombre *"
                lazy-rules
                autofocus
                required
                :rules="[isRequired]"
              />
              <q-input
                class="col-12 col-sm-6 col-md-6"
                filled
                v-model="itemData.descripcion"
                label="Descripción *"
                lazy-rules
                autofocus
                required
                :rules="[isRequired]"
              />
              <q-select
                class="col-4 col-md-6"
                filled
                v-model="itemData.categoria"
                label="Categoría *"
                :options="categoriasData"
                option-label="nombre"
                option-value="id"
                lazy-rules
                autofocus
                required
                :rules="[isRequired]"
              />
              <q-input
                class="col-12 col-sm-6 col-md-6"
                filled
                v-model="itemData.precio_venta"
                label="Precio Venta *"
                lazy-rules
                autofocus
                required
                :rules="[isRequired]"
              />
              <q-input
                class="col-12 col-sm-6 col-md-6"
                filled
                v-model="itemData.stock"
                label="Stock *"
                lazy-rules
                autofocus
                required
                :rules="[isRequired]"
                v-if="!itemData.id"
              />
            </q-form>
          </div>
          <div class="col-6 q-pl-md">
            <input
              type="file"
              accept="image/*"
              class="q-pa-md"
              style="
                background-color: #515563;
                color: white;
                border-radius: 5px;
              "
              @change="handleImageUpload"
            />
            <q-img
              v-if="itemData.imagen"
              :src="itemData.imagen"
              spinner-color="white"
              style="height: 270px; max-width: 300px"
              img-class="my-custom-image"
              class="rounded-borders q-mt-lg"
            >
            </q-img>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn
          label="Guardar"
          color="primary"
          unelevated
          @click="guardarProducto()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <!-- Cuadro de diálogo de eliminación -->
  <q-dialog v-model="showDeleteDialog" persistent>
    <q-card style="width: 430px" class="q-pa-md">
      <q-card-section>
        <p class="text-h6 text-center">
          ¿Está seguro de que desea eliminar este producto?
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
            eliminarProducto(itemToDelete);
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
    :rows="productosData"
    :columns="columns"
    row-key="id"
    :loading="pending"
    v-model:pagination="pagination"
    loading-label="..."
    @request="request($event)"
  >
    <template v-slot:body-cell-imagen="props">
      <img
        :src="props.row.imagen"
        alt="Imagen del producto"
        style="max-width: 50px; max-height: 50px"
        class="q-ml-lg q-mt-md"
      />
    </template>

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
import { Producto, Pagination } from "@/interfaces/global";

const client = useSupabaseClient();
const $q = useQuasar();

const form = ref<any>(null);
const itemData = ref<Producto>({});
const dialog = ref(false);
const searchText = ref("");
const model = ref(null);

const showDeleteDialog = ref(false);
const itemToDelete = ref(null);

const edicion = ref(false); // Inicialmente, no estás en modo de edición

const pagination = ref<Pagination>({
  descending: false,
  page: 1,
  rowsNumber: 0,
  rowsPerPage: 6,
  skip: 0,
  sortBy: null,
  total: 0,
});

const { data: categoriasData } = await useAsyncData<any>(
  "categorias",
  async () => {
    const { data } = await client.from("categorias").select("id, nombre");
    return data;
  }
);

const productoSearchText = ref("");

const img = ref([]);

const columns: any[] = [
  {
    name: "imagen",
    align: "left",
    label: "Imagen",
    field: (row: any) => {
      return `<img src="${row.imagen}" alt="Imagen del producto" style="max-width: 100px; max-height: 100px;" />`;
    },
    sortable: true,
  },
  {
    name: "nombre",
    required: true,
    label: "Nombre",
    align: "left",
    field: "nombre",
    sortable: true,
  },

  {
    name: "categoria",
    align: "left",
    label: "Categoria",
    field: (row: any) => row.categoria?.nombre || "Sin categoría",
    sortable: true,
  },
  {
    name: "stock",
    align: "left",
    label: "Stock",
    field: "stock",
    sortable: true,
  },
  {
    name: "precio_venta",
    align: "left",
    label: "Precio S/.",
    field: "precio_venta",
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
  data: productosData,

  refresh,
  pending,
} = await useAsyncData<any>("productos", async () => {
  const fields =
    "id, id_categoria, nombre, descripcion, imagen, precio_venta, stock, categoria:categorias(id, nombre):categoria";

  const rowsPerPage = pagination.value.rowsPerPage || 1000000;
  const { data, count } = searchText.value
    ? await client
        .from("productos")
        .select(fields, {
          count: "exact",
        })
        .textSearch("nombre", searchText.value)
        .order("id", {
          ascending: false,
        })
        .range(pagination.value.skip, pagination.value.skip + rowsPerPage - 1)
    : await client
        .from("productos")
        .select(fields, {
          count: "exact",
        })
        .order("id", {
          ascending: false,
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

const guardarProducto = async () => {
  if (await form.value?.validate()) {
    // preparando datos para enviar
    const saveData = {
      ...itemData.value,
      id_categoria: itemData.value.categoria?.id,
    };

    // eliminando campos inecesarios
    delete saveData.categoria;

    if (itemData.value.id) {
      const { error } = await client
        .from("productos")
        .update<Producto>([saveData])

        .eq("id", itemData.value.id);

      if (error) {
        console.error("Error actualizando producto:", error.message);
        return;
      }

      $q.notify({
        color: "green-4",
        textColor: "white",
        icon: "check",
        message: "Producto actualizado exitosamente",
      });

      onReset();
      refresh();
    } else {
      // Si el producto no tiene un ID, se trata de una inserción
      const { error } = await client
        .from("productos")
        .insert<Producto>([saveData]);

      if (error) {
        console.error("Error insertando producto:", error.message);
        return;
      }

      onReset();
      refresh();
      $q.notify({
        color: "green-4",
        textColor: "white",
        icon: "check",
        message: "Producto guardado exitosamente",
      });
    }
  }
};

const eliminarProducto = async (id: any) => {
  itemToDelete.value = id;
  showDeleteDialog.value = true;
  const { error } = await client.from("productos").delete().eq("id", id);
  if (error) {
    console.error("Error deleting producto:", error.message);
    return;
  }

  onReset();
  refresh();
  // Notificar al usuario que el producto se eliminó con éxito
  $q.notify({
    color: "green-4",
    textColor: "white",
    icon: "check",
    message: "producto eliminado exitosamente",
  });
};

// Funcion para limpiar los campos después de guardar
function onReset() {
  itemData.value = {};
  dialog.value = false;
}

const handleImageUpload = async (event: any) => {
  const file = event.target.files[0];
  if (file) {
    const { data, error } = await client.storage
      .from("Productos")
      .upload(`productos/${file.name}`, file);

    if (error) {
      console.error("Error al cargar la imagen:", error.message);
    } else if (data) {
      const imagePath = data.path; // Obtener el path de la imagen en el almacenamiento de Supabase
      const imageUrl = `https://ddgoleernxxxxqqcbphm.supabase.co/storage/v1/object/public/Productos/${imagePath}`; // Construir la URL completa de la imagen
      itemData.value.imagen = imageUrl;
      // const imageUrl = URL.createObjectURL(file);
      //  itemData.value.imagen = imageUrl;
    }
  }
};

const buscarProductos = computed(() => {
  if (!productoSearchText.value) return productosData.value;

  const quitarTildes = (texto: any) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const searchText = quitarTildes(productoSearchText.value.toLowerCase());

  return productosData.value.filter((producto: any) =>
    quitarTildes(producto.nombre.toLowerCase()).includes(searchText)
  );
});
</script>
