<template>
  <DashboardPage :page="livePage" />
</template>

<script setup lang="ts">
import DashboardPage from '../components/DashboardPage.vue';
import { dashboardOverviewPage } from './dashboardPresets';
import { computed } from 'vue';
import { useLiveOrderStats } from '../liveOrderStats';

const { deliveredToday, pendingOrders, ordersToday, salesToday } = useLiveOrderStats();

function formatCurrency(value: number) {
  return `PHP ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const livePage = computed(() => {
  const base = dashboardOverviewPage;
  return {
    ...base,
    hero: {
      ...base.hero,
      highlightValue: String(pendingOrders.value),
      highlightLabel: 'Pending Orders',
    },
    metrics: base.metrics.map((m) => {
      const label = m.label.toLowerCase();
      if (label === 'orders today') {
        return { ...m, value: String(ordersToday.value), detail: 'Today at a glance' };
      }
      if (m.label.toLowerCase() === 'delivered') {
        return { ...m, value: String(deliveredToday.value), detail: 'Today at a glance' };
      }
      if (label === 'sales so far') {
        return { ...m, value: formatCurrency(salesToday.value), detail: 'Today at a glance' };
      }
      return m;
    }),
  };
});
</script>
