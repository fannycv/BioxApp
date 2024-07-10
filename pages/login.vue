<template>
  <div class="q-mx-auto q-container">
    <div class="justify-center">
      <h2 class="q-mb-lg text-center">Grupo Biox</h2>
      <h5 class="q-mb-lg text-center">Iniciar Sesión</h5>

      <q-form class="row justify-center">
        <div class="col-md-4">
          <q-input
            v-model="email"
            filled
            color="loginText"
            input-class="q-text-sm"
            hide-details
            label="Correo electrónico"
            placeholder="Correo electrónico"
            type="email"
            dense
            class="col-4 col-md-6"
          />
          <q-input
            v-model="password"
            filled
            color="loginText"
            input-class="q-text-sm"
            hide-details
            label="Contraseña"
            placeholder="Contraseña"
            type="password"
            dense
            class="col-4 col-md-6 q-mt-lg"
          />
        </div>
      </q-form>

      <div class="q-mt-md row justify-center">
        <q-btn
          :loading="handleLogin"
          class="q-text-white q-bg-primary q-text-sm q-py-md q-px-lg q-rounded-md col-md-4"
          @click="signIn"
          color="primary"
        >
          Ingresar
        </q-btn>
      </div>
      <div class="q-mt-md row justify-center">
        <q-card
          v-if="errorMsg"
          icon="warning"
          class="q-mt-md text-orange q-pa-md"
        >
          {{ errorMsg }}
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const client = useSupabaseClient();
const router = useRouter();

const email = ref("");
const password = ref("");
const errorMsg = ref("");

const userLoggedIn = ref(false);
definePageMeta({ layout: "login" });
async function signIn() {
  try {
    const { error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    router.push("/");
  } catch (error) {
    errorMsg.value = error.message;
  }
}
</script>
