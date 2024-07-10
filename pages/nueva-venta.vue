<template>
  <div class="col-10">
    <p class="text-h6">Generar venta</p>

    <q-card class="border-radius-lg">
      <q-card-section>
        <q-input
          v-model="searchProducto"
          debounce="300"
          clearable
          label="Buscar producto por nombre"
          placeholder="batidos"
          @update:model-value="refresh()"
          lazy-rules
          autofocus
          required
          :rules="[isRequired]"
        >
          <template v-slot:before>
            <q-icon name="inventory" size="24px" />
          </template>
        </q-input>

        <q-list separator>
          <q-item v-for="(item, index) in productosData" :key="index">
            <q-item-section top avatar>
              <q-avatar color="primary" square>
                <img :src="item.imagen" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ item.nombre }}</q-item-label>
              <q-item-label caption lines="2">
                Stock: {{ item.stock || 0 }}
              </q-item-label>
            </q-item-section>

            <q-item-section centered side>
              <div class="text-grey-8 q-gutter-xs flex items-center">
                <div style="width: 100px" class="flex items-center justify-end">
                  <span> S/. {{ item.precio_venta }}</span>

                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="add"
                    color="primary"
                    label="Agregar"
                    no-caps
                    :disable="item.stock === 0"
                    @click="addProductToCart(item)"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section v-if="!clientSelected">
        <q-input
          v-model="searchCliente"
          debounce="300"
          clearable
          label="Buscar cliente por nombre"
          @update:model-value="refreshClient()"
          lazy-rules
          autofocus
          required
          :rules="[isRequired]"
        >
          <template v-slot:before>
            <q-icon name="person" size="24px" />
          </template>
        </q-input>

        <q-list separator>
          <q-item
            v-for="(item, index) in clientesData"
            :key="index"
            clickable
            @click="clientSelected = { ...item }"
          >
            <q-item-section top avatar>
              <q-avatar color="primary" text-color="white">
                {{ item.nombres_razonsocial?.[0] }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ item.nombres_razonsocial }}</q-item-label>
              <q-item-label caption lines="2">
                {{ item.tipo_documento }}: {{ item.nro_documento }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section v-else>
        <q-card style="max-width: 600px">
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                {{ clientSelected.nombres_razonsocial?.[0] }}
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>
                {{ clientSelected.nombres_razonsocial }}
              </q-item-label>
              <q-item-label caption lines="3">
                {{ clientSelected.tipo_documento }}:
                {{ clientSelected.nro_documento }}
                <br />
                Direccion: {{ clientSelected.direccion }} -
                {{ clientSelected.distrito }}
              </q-item-label>
            </q-item-section>

            <q-item-section side centered>
              <q-btn
                label="Cambiar"
                no-caps
                flat
                color="negative"
                @click="clientSelected = null"
              ></q-btn>
            </q-item-section>
          </q-item>
        </q-card>
      </q-card-section>

      <q-card-section>
        <p class="text-primary">ORDENES</p>
        <q-list separator>
          <q-item v-for="(item, index) in cartItems" :key="index">
            <q-item-section top avatar>
              <q-avatar color="primary" square>
                <img :src="item.imagen" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label>{{ item.nombre }}</q-item-label>
              <q-item-label caption lines="2">
                Stock: {{ item.stock || 0 }}
              </q-item-label>
            </q-item-section>

            <q-item-section centered side>
              <div class="text-grey-8 q-gutter-xs flex items-center">
                <q-btn
                  flat
                  dense
                  round
                  icon="remove"
                  size="sm"
                  :disable="item.quantity === 1"
                  @click="item.quantity--"
                />
                <span>{{ item.quantity }}</span>
                <q-btn
                  flat
                  dense
                  round
                  size="sm"
                  icon="add"
                  color="primary"
                  :disable="item.quantity == item.stock"
                  @click="item.quantity++"
                />
                <div style="width: 100px" class="flex items-center justify-end">
                  <b class="q-ml-lg">
                    S/. {{ item.quantity * item.precio_venta }}</b
                  >

                  <q-btn
                    flat
                    dense
                    size="sm"
                    icon="delete"
                    color="negative"
                    label="Eliminar"
                    no-caps
                    @click="cartItems.splice(index, 1)"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-section>
        <div class="">
          <div class="flex justify-between">
            <p class="q-my-none">Subtotal</p>

            <p class="q-my-none">S/. {{ subTotal }}</p>
          </div>
          <div class="flex justify-between">
            <p class="q-my-none">Descuento</p>
            <q-input
              style="width: 150px"
              v-model="descuento"
              label="Descuento (%)"
              type="number"
              min="0"
              max="100"
              @input=""
            />

            <p class="q-my-none">S/. {{ discont }}</p>
          </div>
          <div class="flex justify-between">
            <b>Total</b>
            <p>S/. {{ total }}</p>
          </div>
        </div>
      </q-card-section>

      <q-separator horizontal />
      <q-card-section>
        <div class="row">
          <div class="col-md-4">
            <q-select
              class="q-mt-md"
              standout="bg-primary text-white"
              v-model="selectedPaymentType"
              :options="paymentOptions"
              label="Tipo de Pago"
              required
              :rules="[isRequired]"
            />
          </div>

          <div class="col-md-4 q-ml-lg">
            <q-input
              v-model="observations"
              label="Observaciones"
              type="textarea"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator horizontal />

      <q-card-section>
        <div class="d-flex justify-end">
          <q-btn color="primary" label="Realizar venta" @click="saveSale()" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient();

const clientSelected = ref<any>(null);
const descuento = ref<number>(0);

const router = useRouter();
const searchProducto = ref<string>("");
const searchCliente = ref<string>("");
const cartItems = ref([] as any[]);

const paymentOptions = [
  "Efectivo",
  "Tarjeta de crédito",
  "Transferencia",
  "Yape",
];
const selectedPaymentType = ref(null);

const observations = ref("");

const { data: clientesData, refresh: refreshClient } = await useAsyncData<any>(
  "clientes",
  async () => {
    const { data } = await client
      .from("clientes")
      .select(
        "id, nombres_razonsocial, tipo_documento, nro_documento, telefono, distrito, direccion"
      )
      .textSearch("nombres_razonsocial", `'${searchCliente.value}'`)
      .limit(3);
    return data;
  }
);

const { data: productosData, refresh } = await useAsyncData<any>(
  "productos",
  async () => {
    const { data } = await client
      .from("productos")
      .select("*")
      .textSearch("nombre", `'${searchProducto.value}'`)
      .limit(3);

    return data;
  }
);

const addProductToCart = (item: any) => {
  // Verifica si ya existe en el carrito
  const productInCart = cartItems.value.find(
    (producto: any) => producto.id === item.id
  );

  if (productInCart) {
    // si existe el producto en el carrito no se realiza ninguna accion
    return;
  }

  cartItems.value.unshift({ ...item, quantity: 1 });
};

// propiedades computadas para calcular el total, subTotal y descuento
const total = computed(() => {
  const subTotalValue = subTotal.value;
  const descuentoPorcentaje = descuento.value / 100;
  const descuentoTotal = subTotalValue * descuentoPorcentaje;
  return subTotalValue - descuentoTotal;
});

const subTotal = computed(() => {
  return cartItems.value.reduce((a, b) => a + b.quantity * b.precio_venta, 0);
});

const discont = computed(() => {
  const descuentoPorcentaje = descuento.value / 100;
  const descuentoTotal = subTotal.value * descuentoPorcentaje;
  return descuentoTotal;
});

const saveSale = async () => {
  const { error } = await client.rpc<any, any>("crear_venta", {
    fecha: new Date(),
    id_cliente: clientSelected.value?.id,
    total: total.value,
    forma_pago: selectedPaymentType.value,
    observaciones: observations.value,
    detalles: cartItems.value.map((x) => ({
      id_producto: x.id,
      cantidad: x.quantity,
      precio: x.precio_venta,
      importe: x.precio_venta * x.quantity,
      descuento: x.quantity * x.precio_venta * (descuento.value / 100),
    })),
  });

  if (error === null) {
    router.push("/ventas");
  }
};
</script>
