<template>
  <div class="q-mx-auto q-container">
    <div class="justify-center">
      <h2 class="q-mb-lg text-center">Grupo Biox</h2>
      <h5 class="q-mb-lg text-center">Crear una Cuenta</h5>
      <q-form class="row justify-center">
        <div class="col-md-4">
          <q-input
            v-model="email"
            type="email"
            filled
            color="loginText"
            input-class="q-text-sm"
            hide-details
            label="Correo electrónico"
            placeholder="Correo electrónico"
            dense
            required
            class="col-4 col-md-6"
          />
          <q-input
            v-model="password"
            type="password"
            filled
            color="loginText"
            input-class="q-text-sm"
            hide-details
            required
            label="Contraseña"
            placeholder="Contraseña"
            dense
            class="col-4 col-md-6 q-mt-lg"
          />
        </div>
      </q-form>

      <div class="q-mt-md row justify-center">
        <q-btn
          @click="signUp"
          class="q-text-white q-bg-primary q-text-sm q-py-md q-px-lg q-rounded-md col-md-4"
          color="primary"
        >
          REGISTER
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

        <q-card
          v-if="successMsg"
          color="positive"
          icon="check"
          class="q-mt-md text-teal q-pa-md"
        >
          {{ successMsg }}
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const client = useSupabaseClient();

const user = useSupabaseUser();

const email = ref("");
const password = ref("");
const errorMsg = ref("");
const successMsg = ref("");

async function signUp() {
  try {
    const { user, error } = await client.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    successMsg.value = "Revisa tu correo electrónico para confirmar tu cuenta";
  } catch (error) {
    errorMsg.value = error.message;
  }
}
</script>
