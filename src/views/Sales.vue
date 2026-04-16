<template>
  <ion-page>
    <ion-header :translucent="true" class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Sales</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="icon-chip" :disabled="loadingSummary || loading" @click="refreshAll">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="shell">
        <section class="top-card">
          <p class="eyebrow">Revenue</p>
          <h1>Sales Summary</h1>
          <p class="subcopy">Delivered orders only. Quick totals, then a delivered list you can drill into.</p>

          <div v-if="summaryError" class="error">{{ summaryError }}</div>
          <div v-else-if="loadingSummary" class="loading">
            <ion-spinner name="crescent"></ion-spinner>
            <span>Loading summary...</span>
          </div>

          <div v-else class="summary-grid">
            <div class="summary-stat">
              <span>Sales today</span>
              <strong>{{ formatCurrency(summary.today.total) }}</strong>
              <small>{{ summary.today.count }} delivered</small>
            </div>
            <div class="summary-stat">
              <span>Sales this week</span>
              <strong>{{ formatCurrency(summary.week.total) }}</strong>
              <small>{{ summary.week.count }} delivered</small>
            </div>
            <div class="summary-stat">
              <span>Sales this month</span>
              <strong>{{ formatCurrency(summary.month.total) }}</strong>
              <small>{{ summary.month.count }} delivered</small>
            </div>
          </div>

          <div class="filters">
            <ion-select
              class="filter"
              interface="popover"
              label="Delivered range"
              label-placement="stacked"
              :value="rangeFilter"
              @ionChange="onRangeChange"
            >
              <ion-select-option value="today">today</ion-select-option>
              <ion-select-option value="7d">last 7 days</ion-select-option>
              <ion-select-option value="30d">last 30 days</ion-select-option>
              <ion-select-option value="month">this month</ion-select-option>
              <ion-select-option value="all">all time</ion-select-option>
            </ion-select>

            <ion-select
              class="filter"
              interface="popover"
              label="Sort"
              label-placement="stacked"
              :value="sortFilter"
              @ionChange="onSortChange"
            >
              <ion-select-option value="newest">newest</ion-select-option>
              <ion-select-option value="oldest">oldest</ion-select-option>
              <ion-select-option value="highest">highest total</ion-select-option>
              <ion-select-option value="lowest">lowest total</ion-select-option>
            </ion-select>
          </div>

          <ion-searchbar
            v-model="query"
            placeholder="Search delivered orders by order id or user id"
            inputmode="search"
            class="search"
          ></ion-searchbar>
        </section>

        <ion-list lines="none" class="list-card">
          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
          <div v-if="loading" class="loading">
            <ion-spinner name="crescent"></ion-spinner>
            <span>Loading delivered orders...</span>
          </div>

          <ion-item v-for="order in visibleOrders" :key="order.id" button :detail="false" class="row">
            <ion-label>
              <strong>Order #{{ order.id }}</strong>
              <p class="meta">
                <span>User: {{ order.user_id }}</span>
                <span>Delivered: {{ formatDate(order.created_at) }}</span>
              </p>
            </ion-label>
            <div class="right">
              <ion-badge color="success">delivered</ion-badge>
              <small>{{ formatCurrency(order.total_price) }}</small>

              <ion-button fill="clear" color="primary" class="view-items" size="small" @click.stop="openItemsModal(order.id)">
                <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
                View items
              </ion-button>
            </div>
          </ion-item>

          <div v-if="!loading && visibleOrders.length === 0" class="empty">
            No delivered orders in this range.
          </div>

          <div v-if="!loading && visibleOrders.length > 0" class="pager">
            <ion-button fill="outline" color="primary" :disabled="!hasMore || loadingMore" @click="loadMore">
              {{ !hasMore ? 'No more results' : loadingMore ? 'Loading...' : 'Load more' }}
            </ion-button>
            <small v-if="totalCount !== null" class="count">Showing {{ orders.length }} of {{ totalCount }}</small>
          </div>
        </ion-list>

        <ion-modal :is-open="itemsModalOpen" :initial-breakpoint="0.92" :breakpoints="[0, 0.6, 0.92]" @didDismiss="closeItemsModal">
          <ion-header class="modal-header">
            <ion-toolbar>
              <ion-title>Order Details</ion-title>
              <ion-buttons slot="end">
                <ion-button fill="clear" @click="closeItemsModal">Close</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>

          <ion-content class="modal-content">
            <div class="modal-shell">
              <section class="summary-card">
                <p class="eyebrow">Order</p>
                <h2>Order #{{ activeOrder?.id ?? activeOrderId }}</h2>
                <p class="summary-meta">
                  <span>User: <strong>{{ activeOrder?.user_id ?? '-' }}</strong></span>
                  <span>Created: <strong>{{ activeOrder?.created_at ? formatDate(activeOrder.created_at) : '-' }}</strong></span>
                </p>
                <div class="summary-row">
                  <ion-badge color="success">delivered</ion-badge>
                  <strong class="total">{{ activeOrder ? formatCurrency(activeOrder.total_price) : '-' }}</strong>
                </div>
              </section>

              <section class="location-card">
                <p class="eyebrow">Location</p>
                <p class="location-copy">Placeholder: show user location, map, and delivery notes here.</p>
              </section>

              <section class="items-card">
                <div class="items-title">Items</div>

                <div v-if="itemsLoading" class="loading">
                  <ion-spinner name="crescent"></ion-spinner>
                  <span>Loading items...</span>
                </div>

                <div v-else-if="activeItems && activeItems.length > 0">
                  <div v-for="it in activeItems" :key="it.id" class="item-row">
                    <ion-thumbnail class="thumb" v-if="productImageUrl(it)">
                      <ion-img :src="productImageUrl(it) ?? undefined" :alt="it.product?.name ?? 'Product image'"></ion-img>
                    </ion-thumbnail>

                    <div class="item-left">
                      <div class="item-top">
                        <strong>{{ it.product?.name ?? `Product ${it.product_id}` }}</strong>
                        <ion-badge :color="availabilityColor(it)">{{ availabilityLabel(it) }}</ion-badge>
                      </div>
                      <p class="item-meta">
                        Price {{ formatCurrency(productPrice(it)) }} - Qty {{ it.quantity }}
                      </p>
                    </div>

                    <div class="item-right">
                      <small>{{ formatCurrency(it.quantity * productPrice(it)) }}</small>
                    </div>
                  </div>
                </div>

                <div v-else class="empty">
                  No items found for this order.
                </div>
              </section>
            </div>
          </ion-content>
        </ion-modal>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonBadge,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonModal,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonThumbnail,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { eyeOutline, refreshOutline } from 'ionicons/icons';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { supabase } from '../supabase';

type OrderStatus = 'delivered';

type Order = {
  id: string | number;
  user_id: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
};

type OrderItem = {
  id: string | number;
  order_id: string | number;
  product_id: string | number;
  quantity: number;
  unit_price: number;
  created_at: string;
  product: null | {
    name: string;
    price: number;
    image_url: string | null;
    is_available: boolean | null;
    created_at?: string;
  };
};

type RangeFilter = 'today' | '7d' | '30d' | 'month' | 'all';
type SortFilter = 'newest' | 'oldest' | 'highest' | 'lowest';

const PAGE_SIZE = 20;
const orders = ref<Order[]>([]);
const page = ref(0);
const hasMore = ref(true);
const totalCount = ref<number | null>(null);
const loading = ref(false);
const loadingMore = ref(false);
const errorMsg = ref('');

const query = ref('');
const rangeFilter = ref<RangeFilter>('7d');
const sortFilter = ref<SortFilter>('newest');

const loadingSummary = ref(false);
const summaryError = ref('');
const summary = reactive({
  today: { total: 0, count: 0 },
  week: { total: 0, count: 0 },
  month: { total: 0, count: 0 },
});

const itemsModalOpen = ref(false);
const activeOrderId = ref<string | number | null>(null);
const itemsByOrderId = ref<Record<string, OrderItem[]>>({});
const itemsLoading = ref(false);

const channel = supabase.channel('sales-admin-delivered');
let refreshTimer: number | null = null;

function formatCurrency(value: number) {
  return `PHP ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function statusVariants(status: string) {
  const s = String(status);
  const cap = s.length ? s[0].toUpperCase() + s.slice(1) : s;
  return [s, cap, s.toUpperCase()];
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date) {
  // Monday start.
  const x = startOfDay(d);
  const day = x.getDay(); // 0..6 (Sun..Sat)
  const diff = (day + 6) % 7; // Mon=0, Sun=6
  x.setDate(x.getDate() - diff);
  return x;
}

function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function createdAtGteForRange() {
  const now = new Date();
  if (rangeFilter.value === 'all') return null;
  if (rangeFilter.value === 'today') return startOfDay(now).toISOString();
  if (rangeFilter.value === 'month') return startOfMonth(now).toISOString();
  const days = rangeFilter.value === '7d' ? 7 : 30;
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function onRangeChange(ev: CustomEvent<{ value: string }>) {
  rangeFilter.value = (String(ev.detail.value) as RangeFilter) || '7d';
  void fetchDelivered({ reset: true });
}

function onSortChange(ev: CustomEvent<{ value: string }>) {
  sortFilter.value = (String(ev.detail.value) as SortFilter) || 'newest';
  void fetchDelivered({ reset: true });
}

async function fetchSummary() {
  loadingSummary.value = true;
  summaryError.value = '';
  try {
    const now = new Date();

    const todayStart = startOfDay(now);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const [today, week, month] = await Promise.all([
      fetchDeliveredTotals({ from: todayStart, toExclusive: tomorrowStart }),
      fetchDeliveredTotals({ from: weekStart, toExclusive: new Date(now.getTime() + 1000) }),
      fetchDeliveredTotals({ from: monthStart, toExclusive: new Date(now.getTime() + 1000) }),
    ]);

    summary.today.total = today.total;
    summary.today.count = today.count;
    summary.week.total = week.total;
    summary.week.count = week.count;
    summary.month.total = month.total;
    summary.month.count = month.count;
  } catch (err) {
    summaryError.value = err instanceof Error ? err.message : 'Failed to load sales summary.';
  } finally {
    loadingSummary.value = false;
  }
}

async function fetchDeliveredTotals(opts: { from: Date; toExclusive: Date }) {
  const fromIso = opts.from.toISOString();
  const toIso = opts.toExclusive.toISOString();

  // Sum in chunks so we don't rely on any server-side max-rows defaults.
  const CHUNK = 1000;
  let offset = 0;
  let count = 0;
  let total = 0;

  for (;;) {
    const fromIdx = offset;
    const toIdx = offset + CHUNK - 1;

    const { data, error } = await supabase
      .from('orders')
      .select('total_price,created_at,id,status')
      .in('status', statusVariants('delivered'))
      .gte('created_at', fromIso)
      .lt('created_at', toIso)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(fromIdx, toIdx);

    if (error) throw error;

    const rows = data ?? [];
    count += rows.length;
    total += rows.reduce((acc: number, row: any) => acc + Number(row.total_price ?? 0), 0);

    if (rows.length < CHUNK) break;
    offset += CHUNK;
  }

  return { total, count };
}

async function fetchDelivered(opts: { reset: boolean }) {
  if (opts.reset) {
    loading.value = true;
    page.value = 0;
    hasMore.value = true;
    totalCount.value = null;
    orders.value = [];
  } else {
    loadingMore.value = true;
  }

  errorMsg.value = '';

  try {
    const fromIdx = page.value * PAGE_SIZE;
    const toIdx = fromIdx + PAGE_SIZE - 1;
    const gteIso = createdAtGteForRange();

    let q = supabase
      .from('orders')
      .select('id,user_id,total_price,status,created_at', { count: 'exact' })
      .in('status', statusVariants('delivered'));

    if (gteIso) q = q.gte('created_at', gteIso);

    if (sortFilter.value === 'oldest') q = q.order('created_at', { ascending: true });
    else if (sortFilter.value === 'highest') q = q.order('total_price', { ascending: false });
    else if (sortFilter.value === 'lowest') q = q.order('total_price', { ascending: true });
    else q = q.order('created_at', { ascending: false });

    const { data, error, count } = await q.range(fromIdx, toIdx);
    if (error) throw error;

    totalCount.value = typeof count === 'number' ? count : totalCount.value;
    const mapped: Order[] = (data ?? []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      total_price: Number(row.total_price ?? 0),
      status: 'delivered',
      created_at: row.created_at,
    }));

    if (opts.reset) orders.value = mapped;
    else orders.value = [...orders.value, ...mapped];

    hasMore.value = mapped.length === PAGE_SIZE;
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Failed to load delivered orders.';
    hasMore.value = false;
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

async function loadMore() {
  if (!hasMore.value || loading.value || loadingMore.value) return;
  page.value += 1;
  await fetchDelivered({ reset: false });
}

const visibleOrders = computed(() => {
  const q = query.value.trim().toLowerCase();
  return orders.value.filter((o) => {
    if (!q.length) return true;
    return String(o.id).toLowerCase().includes(q) || String(o.user_id).toLowerCase().includes(q);
  });
});

const activeOrder = computed(() => {
  if (activeOrderId.value == null) return null;
  return orders.value.find((o) => String(o.id) === String(activeOrderId.value)) ?? null;
});

const activeItems = computed(() => {
  if (activeOrderId.value == null) return null;
  return itemsByOrderId.value[String(activeOrderId.value)] ?? null;
});

async function fetchOrderItems(orderId: string | number) {
  const key = String(orderId);
  if (itemsByOrderId.value[key]) return;

  itemsLoading.value = true;
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('id,order_id,product_id,quantity,unit_price,created_at,products(name,price,image_url,is_available,created_at)')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const mapped: OrderItem[] = (data ?? []).map((row: any) => ({
      id: row.id,
      order_id: row.order_id,
      product_id: row.product_id,
      quantity: row.quantity,
      unit_price: row.unit_price,
      created_at: row.created_at,
      product: row.products ?? null,
    }));

    itemsByOrderId.value[key] = mapped;
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Failed to load order items.';
  } finally {
    itemsLoading.value = false;
  }
}

function openItemsModal(orderId: string | number) {
  activeOrderId.value = orderId;
  itemsModalOpen.value = true;
  void fetchOrderItems(orderId);
}

function closeItemsModal() {
  itemsModalOpen.value = false;
}

function productImageUrl(item: OrderItem) {
  const url = item.product?.image_url;
  return url && url.trim().length ? url : null;
}

function productPrice(item: OrderItem) {
  return typeof item.product?.price === 'number' ? item.product.price : item.unit_price;
}

function availabilityColor(item: OrderItem) {
  return item.product?.is_available ? 'success' : 'warning';
}

function availabilityLabel(item: OrderItem) {
  return item.product?.is_available ? 'available' : 'unavailable';
}

function scheduleRefresh() {
  if (refreshTimer != null) window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;
    void fetchSummary();
    void fetchDelivered({ reset: true });
  }, 250);
}

function refreshAll() {
  void fetchSummary();
  void fetchDelivered({ reset: true });
}

onMounted(async () => {
  await fetchSummary();
  await fetchDelivered({ reset: true });

  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      // Delivered list + totals should reflect changes quickly, but avoid spamming queries.
      scheduleRefresh();
    })
    .subscribe();
});

onBeforeUnmount(() => {
  if (refreshTimer != null) window.clearTimeout(refreshTimer);
  void supabase.removeChannel(channel);
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
    radial-gradient(circle at top, rgba(236, 199, 144, 0.2), transparent 26%),
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.summary-stat {
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(72, 105, 76, 0.08);
  border: 1px solid rgba(72, 105, 76, 0.12);
}

.summary-stat span {
  display: block;
  color: var(--ion-color-medium);
}

.summary-stat strong {
  display: block;
  margin-top: 6px;
  font-size: 1.2rem;
  color: var(--ion-color-dark);
}

.summary-stat small {
  display: block;
  margin-top: 8px;
  color: var(--ion-color-medium);
  font-weight: 800;
}

.filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.filter {
  --padding-start: 12px;
  --padding-end: 12px;
  --border-radius: 18px;
  border: 1px solid rgba(72, 105, 76, 0.14);
  background: rgba(72, 105, 76, 0.05);
}

.search {
  margin-top: 10px;
  --background: rgba(72, 105, 76, 0.06);
  --border-radius: 18px;
}

.list-card {
  margin-top: 16px;
  border-radius: 30px;
  padding: 8px;
  background: rgba(255, 252, 246, 0.78);
}

.error {
  margin: 8px 10px 14px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(163, 87, 78, 0.18);
  background: rgba(163, 87, 78, 0.08);
  color: var(--ion-color-danger);
  font-weight: 700;
}

.loading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 10px 14px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(72, 105, 76, 0.14);
  background: rgba(72, 105, 76, 0.06);
  color: var(--ion-color-dark);
  font-weight: 700;
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

.meta {
  display: grid;
  gap: 2px;
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

.view-items {
  --border-radius: 999px;
  font-weight: 800;
  text-transform: none;
}

.empty {
  padding: 14px 12px 8px;
  text-align: center;
  color: var(--ion-color-medium);
  font-weight: 700;
}

.pager {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 10px 10px 6px;
}

.count {
  color: var(--ion-color-medium);
  font-weight: 700;
}

.modal-header ion-toolbar {
  --background: rgba(248, 244, 234, 0.9);
  --border-color: transparent;
  backdrop-filter: blur(14px);
}

.modal-content {
  --background:
    radial-gradient(circle at top, rgba(203, 232, 195, 0.24), transparent 26%),
    linear-gradient(180deg, #f8f4ea 0%, #eef1e7 52%, #ecf0e3 100%);
}

.modal-shell {
  max-width: 860px;
  margin: 0 auto;
  padding: 18px 16px 28px;
  display: grid;
  gap: 14px;
}

.summary-card,
.items-card,
.location-card {
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(255, 252, 246, 0.86);
  box-shadow: 0 24px 55px rgba(53, 77, 49, 0.08);
  backdrop-filter: blur(14px);
  border-radius: 26px;
  padding: 16px;
}

.summary-card h2 {
  margin: 0;
  color: var(--ion-color-dark);
}

.summary-meta {
  margin: 10px 0 0;
  display: grid;
  gap: 6px;
  color: var(--ion-color-medium);
}

.summary-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.total {
  color: var(--ion-color-dark);
}

.location-copy {
  margin: 0;
  color: var(--ion-color-medium);
  line-height: 1.6;
}

.items-title {
  font-weight: 900;
  color: var(--ion-color-dark);
  margin-bottom: 10px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px;
  border-radius: 18px;
  border: 1px solid rgba(72, 105, 76, 0.08);
  background: rgba(72, 105, 76, 0.04);
  margin-bottom: 10px;
}

.thumb {
  --size: 56px;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  flex: 0 0 auto;
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(255, 252, 246, 0.92);
}

.item-row:last-child {
  margin-bottom: 0;
}

.item-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.item-meta {
  margin: 6px 0 0;
  color: var(--ion-color-medium);
}

.item-right small {
  font-weight: 900;
  color: var(--ion-color-dark);
}

@media (max-width: 767px) {
  .summary-grid { grid-template-columns: 1fr; }
  .filters { grid-template-columns: 1fr; }
}
</style>
