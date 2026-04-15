<template>
  <DashboardPage :page="dashboardOverviewPage" />
</template>

<script setup lang="ts">
import DashboardPage from '../components/DashboardPage.vue';
import { dashboardOverviewPage } from './dashboardPresets';
</script>
