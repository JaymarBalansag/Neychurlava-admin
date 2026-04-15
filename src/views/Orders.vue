<template>
  <ion-page>
    <ion-header :translucent="true" class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Orders</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="icon-chip">
            <ion-icon :icon="filterOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="shell">
        <section class="top-card">
          <p class="eyebrow">Dispatch</p>
          <h1>Order Queue</h1>
          <p class="subcopy">Scan urgent orders first, then batch assign riders by zone.</p>

          <ion-searchbar
            v-model="query"
            placeholder="Search by address, rider, or code"
            inputmode="search"
            class="search"
          ></ion-searchbar>

          <div class="chip-row">
            <ion-chip :outline="selectedFilter !== 'all'" @click="selectedFilter = 'all'">All</ion-chip>
            <ion-chip :outline="selectedFilter !== 'urgent'" @click="selectedFilter = 'urgent'">Urgent</ion-chip>
            <ion-chip :outline="selectedFilter !== 'dispatch'" @click="selectedFilter = 'dispatch'">Dispatch</ion-chip>
            <ion-chip :outline="selectedFilter !== 'pending'" @click="selectedFilter = 'pending'">Pending</ion-chip>
          </div>
        </section>

        <ion-list lines="none" class="list-card">
          <ion-item v-for="order in visibleOrders" :key="order.id" button :detail="false" class="row">
            <ion-label>
              <strong>{{ order.title }}</strong>
              <p>{{ order.meta }}</p>
            </ion-label>
            <div class="right">
              <ion-badge :color="order.badgeColor">{{ order.status }}</ion-badge>
              <small>{{ order.value }}</small>
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
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { filterOutline } from 'ionicons/icons';
import { computed, ref } from 'vue';

type OrderRow = {
  id: string;
  title: string;
  meta: string;
  status: 'Urgent' | 'Dispatch' | 'Pending';
  badgeColor: 'danger' | 'warning' | 'success' | 'medium';
  value: string;
};

const query = ref('');
const selectedFilter = ref<'all' | 'urgent' | 'dispatch' | 'pending'>('all');

const orders = ref<OrderRow[]>([
  {
    id: 'ORD-1042',
    title: 'Mango Grove Subdivision',
    meta: '3 items - Rider unassigned',
    status: 'Urgent',
    badgeColor: 'danger',
    value: '12 min late',
  },
  {
    id: 'ORD-1043',
    title: 'Riverside Market Block B',
    meta: 'Bulk lunch order - Ready for pickup',
    status: 'Dispatch',
    badgeColor: 'warning',
    value: 'PHP 1,280',
  },
  {
    id: 'ORD-1044',
    title: 'Hillcrest Residences',
    meta: 'Cash on delivery - Verify contact',
    status: 'Pending',
    badgeColor: 'medium',
    value: 'PHP 640',
  },
]);

const visibleOrders = computed(() => {
  const q = query.value.trim().toLowerCase();
  const filter = selectedFilter.value;

  return orders.value.filter((order) => {
    const matchesQuery =
      q.length === 0 ||
      order.title.toLowerCase().includes(q) ||
      order.meta.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q);

    const matchesFilter =
      filter === 'all' ||
      (filter === 'urgent' && order.status === 'Urgent') ||
      (filter === 'dispatch' && order.status === 'Dispatch') ||
      (filter === 'pending' && order.status === 'Pending');

    return matchesQuery && matchesFilter;
  });
});
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
    radial-gradient(circle at top, rgba(203, 232, 195, 0.38), transparent 26%),
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
  margin: 12px 0 10px;
  line-height: 1.6;
  color: var(--ion-color-medium);
}

.search {
  margin-top: 10px;
  --background: rgba(72, 105, 76, 0.06);
  --border-radius: 18px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
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
