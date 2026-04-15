<template>
  <ion-page>
    <ion-header :translucent="true" class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>History</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="icon-chip">
            <ion-icon :icon="searchOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="shell">
        <section class="top-card">
          <p class="eyebrow">Archive</p>
          <h1>Delivery History</h1>
          <p class="subcopy">Search older deliveries by zone, rider, or date.</p>
        </section>

        <ion-list lines="none" class="list-card">
          <ion-item v-for="row in rows" :key="row.id" button :detail="false" class="row">
            <ion-label>
              <strong>{{ row.title }}</strong>
              <p>{{ row.meta }}</p>
            </ion-label>
            <div class="right">
              <ion-badge color="medium">{{ row.badge }}</ion-badge>
              <small>{{ row.value }}</small>
            </div>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { searchOutline } from 'ionicons/icons';
import { ref } from 'vue';

type HistoryRow = { id: string; title: string; meta: string; badge: string; value: string };

const rows = ref<HistoryRow[]>([
  { id: 'HIS-1', title: 'Elm Ridge Complex', meta: 'Recurring address with special instructions', badge: 'Saved', value: '5 visits' },
  { id: 'HIS-2', title: 'Harbor Point Suites', meta: 'High-value order from weekend promo', badge: 'Logged', value: 'PHP 2,140' },
  { id: 'HIS-3', title: 'Greenway Medical Center', meta: 'Split handoff at lobby', badge: 'Filed', value: '32 min' },
]);
</script>

<style scoped>
.page-header ion-toolbar {
  --background: rgba(248, 244, 234, 0.72);
  --border-color: transparent;
  --padding-start: 10px;
  --padding-end: 10px;
  backdrop-filter: blur(14px);
}

.icon-chip {
  --border-radius: 999px;
  --color: var(--ion-color-primary);
}

.page-content {
  --background:
    radial-gradient(circle at top, rgba(203, 232, 195, 0.24), transparent 26%),
    linear-gradient(180deg, #f8f4ea 0%, #eef1e7 52%, #ecf0e3 100%);
}

.shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: calc(86px + env(safe-area-inset-top)) 18px 28px;
}

.top-card,
.list-card {
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(255, 252, 246, 0.8);
  box-shadow: 0 24px 55px rgba(53, 77, 49, 0.08);
  backdrop-filter: blur(14px);
}

.top-card {
  padding: 20px;
  border-radius: 30px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ion-color-primary);
}

.top-card h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 0.95;
  color: var(--ion-color-dark);
}

.subcopy {
  margin: 12px 0 0;
  line-height: 1.6;
  color: var(--ion-color-medium);
}

.list-card {
  margin-top: 16px;
  border-radius: 30px;
  padding: 8px;
  background: rgba(255, 252, 246, 0.78);
}

.row {
  --background: transparent;
  --border-radius: 22px;
  margin: 8px 6px;
  border: 1px solid rgba(72, 105, 76, 0.08);
  background: rgba(72, 105, 76, 0.04);
}

.row strong {
  display: block;
  margin-bottom: 6px;
  color: var(--ion-color-dark);
}

.right {
  display: grid;
  justify-items: end;
  gap: 6px;
}

.right small {
  color: var(--ion-color-medium);
  font-weight: 700;
}
</style>
