<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="shell">
        <section class="brand">
          <p class="eyebrow">Neychurlava</p>
          <h1>Welcome back</h1>
          <p class="subcopy">Sign in to manage orders, deliveries, and sales.</p>
        </section>

        <section class="card">
          <ion-item lines="none" class="field">
            <ion-label position="stacked">Email</ion-label>
            <ion-input
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="you@company.com"
              :value="email"
              @ionInput="onEmail"
            ></ion-input>
          </ion-item>

          <ion-item lines="none" class="field">
            <ion-label position="stacked">Password</ion-label>
            <ion-input
              type="password"
              autocomplete="current-password"
              placeholder="Your password"
              :value="password"
              @ionInput="onPassword"
            ></ion-input>
          </ion-item>

          <ion-button expand="block" color="primary" class="primary" :disabled="loading" @click="signIn">
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </ion-button>
          <ion-button expand="block" fill="clear" color="primary" class="secondary" :disabled="loading" @click="signIn">
            Continue
          </ion-button>

          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        </section>

        <p class="footnote">Use a Supabase email/password account.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
} from '@ionic/vue';
 import { ref } from 'vue';
 import { useRoute, useRouter } from 'vue-router';
 import { supabase } from '../supabase';
 import { initAuth, useAuth, waitForRole } from '../auth';

type IonInputEvent = CustomEvent<{ value?: string | null }>;

 const router = useRouter();
 const route = useRoute();

const email = ref('');
const password = ref('');
const loading = ref(false);
 const errorMsg = ref('');

 if (route.query.reason === 'not_admin') {
   errorMsg.value = 'Access denied. This app is for admin accounts only.';
 }

 function onEmail(ev: IonInputEvent) {
   email.value = ev.detail.value ?? '';
 }

function onPassword(ev: IonInputEvent) {
  password.value = ev.detail.value ?? '';
}

async function signIn() {
  if (loading.value) return;

  errorMsg.value = '';
  loading.value = true;

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    });

     if (error) {
       errorMsg.value = error.message;
       return;
     }

     await initAuth();
     await waitForRole();
     const { isAdmin } = useAuth();

     if (!isAdmin.value) {
       errorMsg.value = 'Access denied. This app is for admin accounts only.';
       await supabase.auth.signOut();
       return;
     }

     await router.replace('/folder/Dashboard');
   } catch (err) {
     errorMsg.value = err instanceof Error ? err.message : 'Sign-in failed. Try again.';
   } finally {
     loading.value = false;
   }
 }
</script>

<style scoped>
.login-content {
  --background:
    radial-gradient(circle at top, rgba(203, 232, 195, 0.44), transparent 28%),
    radial-gradient(circle at bottom right, rgba(236, 199, 144, 0.22), transparent 30%),
    linear-gradient(180deg, #f8f4ea 0%, #eef1e7 52%, #ecf0e3 100%);
}

.shell {
  min-height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  max-width: 520px;
  margin: 0 auto;
  padding: calc(48px + env(safe-area-inset-top)) 18px 40px;
  display: grid;
  gap: 18px;
}

.brand {
  padding: 18px;
  border-radius: 30px;
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(255, 252, 246, 0.78);
  box-shadow: 0 24px 55px rgba(53, 77, 49, 0.08);
  backdrop-filter: blur(14px);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.74rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ion-color-primary);
}

.brand h1 {
  margin: 0;
  font-size: clamp(2.1rem, 6vw, 3.2rem);
  line-height: 0.95;
  color: var(--ion-color-dark);
}

.subcopy {
  margin: 12px 0 0;
  line-height: 1.7;
  color: var(--ion-color-medium);
}

.card {
  padding: 18px;
  border-radius: 30px;
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(255, 252, 246, 0.86);
  box-shadow: 0 24px 55px rgba(53, 77, 49, 0.08);
  backdrop-filter: blur(14px);
}

.field {
  --background: transparent;
  --inner-padding-end: 0px;
  border-radius: 20px;
  margin-bottom: 12px;
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(72, 105, 76, 0.05);
}

.primary {
  margin-top: 6px;
}

.secondary {
  margin-top: 4px;
}

.footnote {
  margin: 0;
  color: var(--ion-color-medium);
  text-align: center;
}

.error {
  margin: 12px 2px 0;
  color: var(--ion-color-danger);
  line-height: 1.4;
  font-weight: 600;
}
</style>
