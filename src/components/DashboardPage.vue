<template>
  <ion-page>
    <ion-header :translucent="true" class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ page.hero.title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="header-chip">
            <ion-icon :icon="leafOutline" slot="start"></ion-icon>
            Nature mode
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="dashboard-content">
      <div class="dashboard-shell">
        <section class="hero-card">
          <div class="hero-copy">
            <p class="eyebrow">{{ page.hero.eyebrow }}</p>
            <h1>{{ page.hero.title }}</h1>
            <p class="hero-text">{{ page.hero.description }}</p>
          </div>

          <div class="hero-panel">
            <p>Live pulse</p>
            <strong>{{ page.hero.highlightValue }}</strong>
            <span>{{ page.hero.highlightLabel }}</span>

            <div class="trend-chip">
              <ion-icon :icon="trendingUpOutline"></ion-icon>
              {{ page.hero.trend }}
            </div>
          </div>
        </section>

        <section class="metric-grid">
          <article v-for="metric in page.metrics" :key="metric.label" class="metric-card">
            <div class="metric-top">
              <span>{{ metric.label }}</span>
              <ion-icon :icon="metric.icon"></ion-icon>
            </div>
            <strong>{{ metric.value }}</strong>
            <p>{{ metric.detail }}</p>
          </article>
        </section>

        
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
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { leafOutline, trendingUpOutline } from 'ionicons/icons';

type DashboardItem = {
  title: string;
  meta: string;
  status: string;
  value: string;
};

type InsightItem = {
  title: string;
  meta: string;
  value: string;
};

export type PageData = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryAction: string;
    secondaryAction: string;
    highlightValue: string;
    highlightLabel: string;
    trend: string;
  };
  metrics: Array<{
    label: string;
    value: string;
    detail: string;
    icon: any;
  }>;
  mainSection: {
    kicker: string;
    title: string;
    badge: string;
    items: DashboardItem[];
  };
  sideSection: {
    kicker: string;
    title: string;
    items: InsightItem[];
  };
};

defineProps<{
  page: PageData;
}>();
</script>

<style scoped>
.page-header ion-toolbar {
  --background: rgba(248, 244, 234, 0.72);
  --border-color: transparent;
  --padding-start: 10px;
  --padding-end: 10px;
  backdrop-filter: blur(14px);
}

.header-chip {
  --border-radius: 999px;
  --color: var(--ion-color-primary);
  font-size: 0.88rem;
}

.dashboard-content {
  --background:
    radial-gradient(circle at top, rgba(203, 232, 195, 0.45), transparent 24%),
    linear-gradient(180deg, #f8f4ea 0%, #eef1e7 52%, #ecf0e3 100%);
}

.dashboard-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: calc(88px + env(safe-area-inset-top)) 20px 28px;
}

.hero-card,
.panel-card,
.metric-card {
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(255, 252, 246, 0.78);
  box-shadow: 0 24px 55px rgba(53, 77, 49, 0.08);
  backdrop-filter: blur(14px);
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.9fr);
  gap: 18px;
  padding: 22px;
  border-radius: 34px;
}

.eyebrow,
.section-label {
  margin: 0 0 8px;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ion-color-primary);
}

.hero-copy h1,
.panel-header h2 {
  margin: 0;
  color: var(--ion-color-dark);
}

.hero-copy h1 {
  font-size: clamp(2.3rem, 6vw, 4.5rem);
  line-height: 0.92;
}

.hero-text {
  max-width: 48rem;
  margin: 14px 0 0;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--ion-color-medium);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.hero-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  padding: 20px;
  border-radius: 28px;
  color: #f8f6ef;
  background: linear-gradient(180deg, #4b6a48 0%, #36523a 100%);
}

.hero-panel p,
.hero-panel span {
  margin: 0;
  color: rgba(248, 246, 239, 0.78);
}

.hero-panel strong {
  margin: 12px 0 6px;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1;
}

.trend-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-top: 18px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(248, 246, 239, 0.12);
}

.metric-grid,
.content-grid {
  display: grid;
  gap: 18px;
  margin-top: 18px;
}

.metric-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-card {
  padding: 18px;
  border-radius: 26px;
}

.metric-top,
.panel-header,
.task-item,
.insight-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.metric-top span,
.metric-card p,
.task-copy p,
.insight-card p {
  color: var(--ion-color-medium);
}

.metric-card strong {
  display: block;
  margin: 16px 0 8px;
  font-size: 2rem;
  line-height: 1;
  color: var(--ion-color-dark);
}

.content-grid {
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.8fr);
}

.panel-card {
  padding: 22px;
  border-radius: 32px;
}

.task-list,
.insight-stack {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.task-item,
.insight-card {
  padding: 16px 18px;
  border-radius: 22px;
  background: rgba(72, 105, 76, 0.06);
}

.task-copy strong,
.insight-card strong {
  display: block;
  margin-bottom: 6px;
  color: var(--ion-color-dark);
}

.task-right {
  text-align: right;
}

.task-status {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(72, 105, 76, 0.14);
  color: var(--ion-color-primary);
  font-weight: 700;
}

.task-right small,
.insight-card span {
  display: block;
  margin-top: 8px;
  font-weight: 700;
  color: var(--ion-color-dark);
}

@media (max-width: 1100px) {
  .metric-grid,
  .content-grid,
  .hero-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .dashboard-shell {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hero-card,
  .panel-card,
  .metric-card {
    border-radius: 24px;
  }

  .hero-card,
  .panel-card {
    padding: 18px;
  }

  .task-item,
  .insight-card,
  .panel-header {
    flex-direction: column;
  }

  .task-right {
    text-align: left;
  }
}
</style>
