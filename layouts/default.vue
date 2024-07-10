<template>
  <template v-if="false">
    <div class="loading bg-accent">
      <q-spinner-cube color="primary" size="6em" />
    </div>
  </template>

  <q-layout v-else view="lHh Lpr lff" container style="height: 100vh">
    <q-header :elevated="false">
      <q-toolbar>
        <q-btn
          flat
          @click="drawer = !drawer"
          round
          dense
          color="secondary"
          icon="menu"
          aria-label="Open drawer menu"
        />

        <q-space></q-space>
        <div class="logo bg-transparent">
          <nuxt-link to="/">
            <img
              height="28"
              class="block"
              style="height: 28px"
              src="https://grupobiox.myshopify.com/cdn/shop/files/GRUPO_BIOX.png?v=1687556695&width=320"
              alt="Company Logo"
            />
          </nuxt-link>
        </div>
        <q-space></q-space>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="240"
      :breakpoint="800"
      class="bg-dark text-white"
    >
      <q-scroll-area style="height: calc(100% - 150px); margin-top: 90px">
        <q-list padding>
          <q-item
            v-for="(item, index) in items"
            :key="index"
            class="q-py-xs"
            clickable
            v-ripple
            :to="item.to"
            :active="currentRoute === item.name"
            active-class="bg-accent"
          >
            <q-item-section avatar>
              <q-avatar square size="lg">
                <q-icon :name="item.icon" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              {{ item.title }}
            </q-item-section>
          </q-item>

          <q-expansion-item
            class="q-ml-sm"
            icon="category"
            label="Gestion de Productos"
          >
            <q-list class="q-pl-lg">
              <q-item
                to="/categorias"
                active-class="q-item-no-link-highlighting bg-accent text-primary"
              >
                <q-item-section avatar>
                  <q-icon name="pages" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Categorias</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                to="/productos"
                active-class="q-item-no-link-highlighting bg-accent text-primary"
              >
                <q-item-section avatar>
                  <q-icon name="inventory" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Productos</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <q-expansion-item class="q-ml-sm" icon="settings" label="Settings">
            <q-list class="q-pl-lg">
              <q-item
                to="/register"
                active-class="q-item-no-link-highlighting bg-accent text-primary"
              >
                <q-item-section avatar>
                  <q-icon name="pages" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Registro de usuarios</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                to="/profile"
                active-class="q-item-no-link-highlighting bg-accent text-primary"
              >
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Perfil del usuario </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>

      <q-card class="absolute-top bg-dark" flat style="height: 90px">
        <div class="absolute-center q-px-md q-py-sm bg-primary">
          <nuxt-link to="/">
            <img
              height="35"
              class="block"
              src="https://grupobiox.myshopify.com/cdn/shop/files/GRUPO_BIOX.png?v=1687556695&width=320"
            />
          </nuxt-link>
        </div>
      </q-card>
      <div class="q-mt-md q-pb-lg">
        <div class="flex flex-center q-gutter-xs">
          <q-btn @click="logout" flat>
            <q-item
              active-class="q-item-no-link-highlighting bg-accent text-primary"
            >
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cerrar Sesión </q-item-label>
              </q-item-section>
            </q-item>
          </q-btn>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page padding class="q-pb-none">
        <NuxtPage />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script setup lang="ts">
import { Item } from "@/interfaces/global";

const client = useSupabaseClient();
const router = useRouter();

useHead({
  titleTemplate: `%s - Reportes`,
});

const route = useRoute();

const currentRoute = computed(() => {
  return route.name;
});

const drawer = ref<boolean>(false);

const submenuVisible = ref<string | null>(null);

function toggleSubmenu(item: Item) {
  submenuVisible.value =
    submenuVisible.value === item.title ? null : item.title;
}

const items = computed<Item[]>(() => {
  return [
    {
      icon: "dashboard",
      title: "Dashboard",
      to: "/",
      name: "index",
    },
    {
      icon: "group",
      title: "Clientes",
      to: "/clientes",
      name: "clientes",
    },

    {
      icon: "shopping_cart",
      title: "Ventas",
      to: "/ventas",
      name: "rooms",
    },
  ];
});
async function logout() {
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    router.push("/login");
  } catch (error) {}
}
</script>

<style lang="scss" scoped>
@media only screen and (max-width: 600px) {
  .logo {
    display: none;
  }
}

.loading {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
