import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { supabase } from './supabase';

function variants(status: string) {
  const s = String(status ?? '').trim();
  const cap = s.length ? s[0].toUpperCase() + s.slice(1) : s;
  return [s, cap, s.toUpperCase()];
}

function startOfLocalDayIso(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString();
}

function addDaysIso(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy.toISOString();
}

const pendingOrders = ref<number>(0);
const deliveredToday = ref<number>(0);
const ordersToday = ref<number>(0);
const salesToday = ref<number>(0);
const loading = ref(false);
const error = ref<string>('');

const channel = supabase.channel('orders-admin-stats');
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let started = false;
let subscribers = 0;

async function refresh() {
  loading.value = true;
  error.value = '';
  try {
    const now = new Date();
    const todayStartIso = startOfLocalDayIso(now);
    const tomorrowStartIso = addDaysIso(new Date(todayStartIso), 1);

    const [pendingRes, ordersTodayRes, deliveredRes, deliveredSalesRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', variants('pending')),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStartIso)
        .lt('created_at', tomorrowStartIso),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', variants('delivered'))
        .gte('created_at', todayStartIso)
        .lt('created_at', tomorrowStartIso),
      supabase
        .from('orders')
        .select('total_price')
        .in('status', variants('delivered'))
        .gte('created_at', todayStartIso)
        .lt('created_at', tomorrowStartIso),
    ]);

    if (pendingRes.error) throw pendingRes.error;
    if (ordersTodayRes.error) throw ordersTodayRes.error;
    if (deliveredRes.error) throw deliveredRes.error;
    if (deliveredSalesRes.error) throw deliveredSalesRes.error;

    pendingOrders.value = typeof pendingRes.count === 'number' ? pendingRes.count : 0;
    deliveredToday.value = typeof deliveredRes.count === 'number' ? deliveredRes.count : 0;
    ordersToday.value = typeof ordersTodayRes.count === 'number' ? ordersTodayRes.count : 0;

    const deliveredRows = (deliveredSalesRes.data ?? []) as Array<{ total_price?: number | null }>;
    salesToday.value = deliveredRows.reduce((acc, row) => acc + Number(row.total_price ?? 0), 0);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to refresh order stats.';
  } finally {
    loading.value = false;
  }
}

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    void refresh();
  }, 500);
}

function start() {
  if (started) return;
  started = true;

  void refresh();
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      scheduleRefresh();
    })
    .subscribe();
}

function stop() {
  if (!started) return;
  started = false;
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = null;
  void supabase.removeChannel(channel);
}

export function useLiveOrderStats() {
  onMounted(() => {
    subscribers += 1;
    start();
  });
  onBeforeUnmount(() => {
    subscribers = Math.max(0, subscribers - 1);
    if (subscribers === 0) stop();
  });

  const hasError = computed(() => Boolean(error.value));
  return { pendingOrders, deliveredToday, ordersToday, salesToday, loading, error, hasError, refresh, start, stop };
}
