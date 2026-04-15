<template>
  <ion-page>
    <ion-header :translucent="true" class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Delivered</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="icon-chip">
            <ion-icon :icon="downloadOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="shell">
        <section class="top-card">
          <p class="eyebrow">Completion</p>
          <h1>Delivered Today</h1>
          <p class="subcopy">Keep an eye on speed, handoff quality, and any follow-ups.</p>

          <div class="stats-row">
            <div class="stat">
              <span>Success rate</span>
              <strong>97%</strong>
            </div>
            <div class="stat">
              <span>Avg. time</span>
              <strong>24 min</strong>
            </div>
            <div class="stat">
              <span>Completed</span>
              <strong>86</strong>
            </div>
          </div>
        </section>

        <ion-list lines="none" class="list-card">
          <ion-item v-for="row in rows" :key="row.id" button :detail="false" class="row">
            <ion-label>
              <strong>{{ row.title }}</strong>
              <p>{{ row.meta }}</p>
            </ion-label>
            <div class="right">
              <ion-badge color="success">Complete</ion-badge>
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
import { downloadOutline } from 'ionicons/icons';
import { ref } from 'vue';

type DeliveredRow = { id: string; title: string; meta: string; value: string };

const rows = ref<DeliveredRow[]>([
  { id: 'DLV-901', title: 'South Garden Villas', meta: 'Delivered by Carlo - Paid online', value: '21 min' },
  { id: 'DLV-902', title: 'Lakeside Office Hub', meta: '6 meal trays - Corporate account', value: '29 min' },
  { id: 'DLV-903', title: 'Pineview Apartments', meta: 'Customer received at lobby', value: '18 min' },
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
    radial-gradient(circle at top, rgba(236, 199, 144, 0.22), transparent 26%),
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

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.stat {
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(72, 105, 76, 0.08);
  border: 1px solid rgba(72, 105, 76, 0.12);
}

.stat span {
  display: block;
  color: var(--ion-color-medium);
}

.stat strong {
  display: block;
  margin-top: 6px;
  font-size: 1.4rem;
  color: var(--ion-color-dark);
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

@media (max-width: 767px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
