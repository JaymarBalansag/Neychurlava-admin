<template>
  <ion-app>
    <ion-split-pane v-if="showMenu" content-id="main-content" when="lg">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content class="menu-content">
          <div class="menu-shell">
            <section class="menu-brand">
              <p class="eyebrow">Neychurlava</p>
              <h1>Rooted delivery operations</h1>
              <p class="menu-copy">
                Track orders, monitor products, and review daily performance from one calm workspace.
              </p>
            </section>

            <div class="menu-summary">
              <div>
                <span>Delivered Today</span>
                <strong>{{ deliveredToday }}</strong>
              </div>
              <div>
                <span>Pending Orders</span>
                <strong>{{ pendingOrders }}</strong>
              </div>
            </div>

            <ion-list id="nav-list" lines="none">
              <ion-menu-toggle :auto-hide="false" v-for="(page, index) in appPages" :key="page.title">
                <ion-item
                  button
                  :router-link="page.url"
                  router-direction="root"
                  :detail="false"
                  class="nav-item"
                  :class="{ selected: selectedIndex === index }"
                  @click="selectedIndex = index"
                >
                  <div class="nav-icon" slot="start">
                    <ion-icon aria-hidden="true" :ios="page.iosIcon" :md="page.mdIcon"></ion-icon>
                  </div>
                  <ion-label>
                    <span class="nav-label">{{ page.title }}</span>
                    <small>{{ page.caption }}</small>
                  </ion-label>
                </ion-item>
              </ion-menu-toggle>
            </ion-list>

            <ion-list lines="none" class="logout-list">
              <ion-item button :detail="false" class="nav-item logout" @click="signOut">
                <div class="nav-icon" slot="start">
                  <ion-icon aria-hidden="true" :icon="logOutOutline"></ion-icon>
                </div>
                <ion-label>
                  <span class="nav-label">Sign out</span>
                  <small>End this session</small>
                </ion-label>
              </ion-item>
            </ion-list>
          </div>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
    <ion-router-outlet v-else id="main-content"></ion-router-outlet>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonSplitPane,
} from '@ionic/vue';
 import { computed, ref } from 'vue';
 import { useRoute, useRouter } from 'vue-router';
import {
  archiveOutline,
  archiveSharp,
  checkmarkDoneCircleOutline,
  checkmarkDoneCircleSharp,
  fastFoodOutline,
  fastFoodSharp,
  receiptOutline,
  receiptSharp,
  trendingUpOutline,
  trendingUpSharp,
  gridOutline,
  gridSharp,
  logOutOutline,
} from 'ionicons/icons';
 import { supabase } from './supabase';
 import { useLiveOrderStats } from './liveOrderStats';

const selectedIndex = ref(0);
const route = useRoute();
const router = useRouter();
const showMenu = computed(() => route.path !== '/login');
const { deliveredToday, pendingOrders } = useLiveOrderStats();
const appPages = [
  {
    title: 'Dashboard',
    caption: 'Overview of key metrics',
    url: '/folder/Dashboard',
    iosIcon: gridOutline,
    mdIcon: gridSharp,
  },
  {
    title: 'Orders',
    caption: 'Live queue for orders',
    url: '/folder/Orders',
    iosIcon: receiptOutline,
    mdIcon: receiptSharp,
  },
  // {
  //   title: 'Delivered Today',
  //   caption: 'Completed drops and speed',
  //   url: '/folder/Delivered_Today',
  //   iosIcon: checkmarkDoneCircleOutline,
  //   mdIcon: checkmarkDoneCircleSharp,
  // },
  {
    title: 'Todays Product',
    caption: 'Best-moving items today',
    url: '/folder/Products',
    iosIcon: fastFoodOutline,
    mdIcon: fastFoodSharp,
  },
  {
    title: 'Sales',
    caption: 'Revenue and order trends',
    url: '/folder/Sales',
    iosIcon: trendingUpOutline,
    mdIcon: trendingUpSharp,
  },
  // {
  //   title: 'History/Delivered',
  //   caption: 'Past deliveries and logs',
  //   url: '/folder/Delivered',
  //   iosIcon: archiveOutline,
  //   mdIcon: archiveSharp,
  // },
];
const path = window.location.pathname.split('folder/')[1];
if (path !== undefined) {
  selectedIndex.value = appPages.findIndex((page) => page.url.endsWith(path));
}

async function signOut() {
  await supabase.auth.signOut();
  await router.replace('/login');
}
</script>

<style scoped>
ion-menu {
  --width: 330px;
  --max-width: 88vw;
}

.menu-content {
  --background: transparent;
}

.menu-shell {
  min-height: 100%;
  padding: 24px 18px 28px;
  background:
    radial-gradient(circle at top left, rgba(204, 232, 197, 0.72), transparent 34%),
    radial-gradient(circle at bottom right, rgba(236, 199, 144, 0.28), transparent 30%),
    linear-gradient(180deg, rgba(248, 244, 234, 0.98), rgba(240, 236, 224, 0.98));
}

.menu-brand {
  padding: 18px;
  border: 1px solid rgba(64, 93, 72, 0.12);
  border-radius: 28px;
  background: rgba(255, 252, 245, 0.72);
  box-shadow: 0 20px 45px rgba(59, 82, 55, 0.08);
  backdrop-filter: blur(12px);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 0.74rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ion-color-primary);
}

.menu-brand h1 {
  margin: 0;
  font-size: 2rem;
  line-height: 1;
  color: var(--ion-color-dark);
}

.menu-copy {
  margin: 12px 0 0;
  color: var(--ion-color-medium);
  line-height: 1.5;
}

.menu-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 18px 0 12px;
}

.menu-summary div {
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(72, 105, 76, 0.08);
  border: 1px solid rgba(72, 105, 76, 0.12);
}

.menu-summary span,
.nav-item small {
  display: block;
  color: var(--ion-color-medium);
}

.menu-summary strong {
  display: block;
  margin-top: 6px;
  font-size: 1.4rem;
  color: var(--ion-color-dark);
}

#nav-list {
  margin-top: 10px;
  background: transparent;
}

.logout-list {
  margin-top: 16px;
  background: transparent;
}

.logout .nav-icon {
  background: rgba(163, 87, 78, 0.12);
  color: var(--ion-color-danger);
}

.nav-item {
  --background: transparent;
  --padding-start: 10px;
  --padding-end: 10px;
  --inner-padding-end: 8px;
  --border-radius: 22px;
  margin-bottom: 10px;
}

.nav-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
  box-shadow: inset 0 0 0 1px rgba(72, 105, 76, 0.1);
}

.nav-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-right: 12px;
  border-radius: 16px;
  background: rgba(72, 105, 76, 0.1);
  color: var(--ion-color-primary);
}

.nav-label {
  display: block;
  margin-bottom: 3px;
  font-weight: 700;
  color: var(--ion-color-dark);
}

.nav-item.selected .nav-icon {
  background: var(--ion-color-primary);
  color: #f8f6ef;
}

@media (max-width: 991px) {
  ion-menu {
    --width: 294px;
  }

  .menu-shell {
    padding-top: 18px;
  }

  .menu-brand h1 {
    font-size: 1.8rem;
  }
}
</style>
