<template>
  <ion-page>
    <ion-header :translucent="true" class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Orders</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="icon-chip" :disabled="loading" @click="fetchOrders({ reset: true })">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="shell">
        <section class="top-card">
          <p class="eyebrow">Dispatch</p>
          <h1>Order Queue</h1>
          <p class="subcopy">Filter by status and time range. Update status as you work.</p>
          <p class="tiny">Signed in as: <strong>{{ signedInAs }}</strong></p>

          <div class="filters">
            <ion-select
              class="filter"
              interface="popover"
              label="Status"
              label-placement="stacked"
              :value="statusFilter"
              @ionChange="onStatusFilterChange"
            >
              <ion-select-option value="pending">pending</ion-select-option>
              <ion-select-option value="preparing">preparing</ion-select-option>
              <ion-select-option value="delivering">delivering</ion-select-option>
              <ion-select-option value="delivered">delivered</ion-select-option>
            </ion-select>

            <ion-select
              class="filter"
              interface="popover"
              label="Created"
              label-placement="stacked"
              :value="dateFilter"
              @ionChange="onDateFilterChange"
            >
              <ion-select-option value="today">today</ion-select-option>
              <ion-select-option value="7d">last 7 days</ion-select-option>
              <ion-select-option value="30d">last 30 days</ion-select-option>
              <ion-select-option value="all">all time</ion-select-option>
            </ion-select>
          </div>

          <ion-searchbar
            v-model="query"
            placeholder="Search by address, rider, or code"
            inputmode="search"
            class="search"
          ></ion-searchbar>
        </section>

        <ion-list lines="none" class="list-card">
          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
          <div v-if="loading" class="loading">
            <ion-spinner name="crescent"></ion-spinner>
            <span>Loading orders...</span>
          </div>

          <ion-item
            v-for="order in visibleOrders"
            :key="order.id"
            button
            :detail="false"
            class="row"
          >
            <ion-label>
              <strong>Order #{{ order.id }}</strong>
              <p class="meta">
                <span>User: {{ order.user_id }}</span>
                <span>Created: {{ formatDate(order.created_at) }}</span>
              </p>
            </ion-label>

            <div class="right">
              <ion-badge :color="badgeColor(order.status)">{{ normalizeStatus(order.status) }}</ion-badge>
              <small>{{ formatCurrency(order.total_price) }}</small>

              <ion-button
                fill="clear"
                color="primary"
                class="view-items"
                size="small"
                @click.stop="openItemsModal(order.id)"
              >
                <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
                View items
              </ion-button>

              <ion-select
                class="status"
                interface="popover"
                placeholder="Update status"
                @click.stop
                :disabled="updatingId === order.id"
                @ionChange="(ev) => onStatusChange(order.id, ev)"
              >
                <ion-select-option value="pending">pending</ion-select-option>
                <ion-select-option value="preparing">preparing</ion-select-option>
                <ion-select-option value="delivering">delivering</ion-select-option>
                <ion-select-option value="delivered">delivered</ion-select-option>
              </ion-select>
            </div>
          </ion-item>

          <div v-if="!loading && visibleOrders.length === 0" class="empty">
            No {{ normalizeStatus(statusFilter) }} orders right now.
            <div class="empty-hint">{{ emptyHint }}</div>
          </div>

          <div v-if="!loading && visibleOrders.length > 0" class="pager">
            <ion-button
              fill="outline"
              color="primary"
              :disabled="!hasMore || loadingMore"
              @click="loadMore"
            >
              {{ !hasMore ? 'No more results' : loadingMore ? 'Loading...' : 'Load more' }}
            </ion-button>
            <small v-if="totalCount !== null" class="count">
              Showing {{ orders.length }} of {{ totalCount }}
            </small>
          </div>
        </ion-list>

        <ion-modal
          :is-open="itemsModalOpen"
          :initial-breakpoint="0.92"
          :breakpoints="[0, 0.6, 0.92]"
          @didDismiss="closeItemsModal"
        >
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
                  <ion-badge :color="badgeColor((activeOrder?.status ?? statusFilter) as any)">
                    {{ normalizeStatus((activeOrder?.status ?? statusFilter) as any) }}
                  </ion-badge>
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
                        Price {{ formatCurrency(productPrice(it)) }} • Qty {{ it.quantity }}
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
  IonBadge,
  IonButton,
  IonButtons,
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { supabase } from '../supabase';
import { useAuth } from '../auth';

type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'delivered';

type Order = {
  id: string | number;
  user_id: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
};

const query = ref('');
const loading = ref(false);
const loadingMore = ref(false);
const errorMsg = ref('');
const updatingId = ref<string | number | null>(null);

type Product = {
  name: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
};

type OrderItem = {
  id: string | number;
  order_id: string | number;
  product_id: string | number;
  quantity: number;
  unit_price: number;
  created_at: string;
  product: Product | null;
};

const orders = ref<Order[]>([]);
const itemsByOrderId = ref<Record<string, OrderItem[]>>({});
const itemsModalOpen = ref(false);
const activeOrderId = ref<string | number | null>(null);
const itemsLoading = ref(false);

const channel = supabase.channel('orders-admin-pending');

const { user } = useAuth();
const signedInAs = computed(() => user.value?.email ?? user.value?.id ?? 'unknown');
const emptyHint = computed(() => {
  return "If you know there are pending orders, this is usually RLS filtering rows. Add a SELECT policy for admin on the 'orders' table, and make sure status values match 'pending'.";
});

const PAGE_SIZE = 20;
const page = ref(0); // 0-based page index
const hasMore = ref(true);
const totalCount = ref<number | null>(null);

const statusFilter = ref<OrderStatus>('pending');
const dateFilter = ref<'today' | '7d' | '30d' | 'all'>('today');

function onStatusFilterChange(ev: CustomEvent<{ value: string }>) {
  statusFilter.value = (String(ev.detail.value) as OrderStatus) || 'pending';
  void fetchOrders({ reset: true });
}

function onDateFilterChange(ev: CustomEvent<{ value: string }>) {
  dateFilter.value = (String(ev.detail.value) as any) || 'today';
  void fetchOrders({ reset: true });
}

function formatCurrency(value: number) {
  // Keep it simple; you can localize later.
  return `PHP ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function normalizeStatus(value: string) {
  return String(value ?? '').trim().toLowerCase();
}

function badgeColor(status: OrderStatus) {
  const s = normalizeStatus(status);
  if (s === 'pending') return 'warning';
  if (s === 'preparing') return 'medium';
  if (s === 'delivering') return 'primary';
  return 'success';
}

function createdAtGte() {
  const now = new Date();
  if (dateFilter.value === 'all') return null;
  if (dateFilter.value === 'today') {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  const days = dateFilter.value === '7d' ? 7 : 30;
  const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function statusVariants(status: OrderStatus) {
  const s = String(status);
  const cap = s.length ? s[0].toUpperCase() + s.slice(1) : s;
  return [s, cap, s.toUpperCase()];
}

async function fetchOrders(opts: { reset: boolean }) {
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
    const offset = page.value * PAGE_SIZE;
    const from = offset;
    const to = offset + PAGE_SIZE - 1;

    let q = supabase
      .from('orders')
      .select('id,user_id,total_price,status,created_at', { count: 'exact' })
      .in('status', statusVariants(statusFilter.value))
      .order('created_at', { ascending: false })
      .range(from, to);

    const gte = createdAtGte();
    if (gte) q = q.gte('created_at', gte);

    const { data, error, count } = await q;

    if (error) throw error;
    totalCount.value = typeof count === 'number' ? count : totalCount.value;

    const rows = (data ?? []) as unknown as Order[];
    orders.value = opts.reset ? rows : [...orders.value, ...rows];

    hasMore.value = rows.length === PAGE_SIZE;

    // eslint-disable-next-line no-console
    console.info('[Orders] fetched:', rows.length, 'page', page.value + 1, 'status', statusFilter.value);
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Failed to load orders.';
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

async function loadMore() {
  if (!hasMore.value || loading.value || loadingMore.value) return;
  page.value += 1;
  await fetchOrders({ reset: false });
}

async function fetchOrderItems(orderId: string | number) {
  const key = String(orderId);
  if (itemsByOrderId.value[key]) return;

  itemsLoading.value = true;
  try {
    // Try to join products via FK relationship: order_items.product_id -> products.id
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
    // Keep UI usable even if relation names differ in DB; show a lightweight error.
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

type IonSelectChangeEvent = CustomEvent<{ value: string }>;

async function onStatusChange(orderId: string | number, ev: IonSelectChangeEvent) {
  const next = String(ev.detail.value) as OrderStatus;
  if (!next) return;

  updatingId.value = orderId;
  errorMsg.value = '';

  // Optimistic: if the order will no longer match the current filter, remove it immediately.
  const before = orders.value.slice();
  const shouldRemove = normalizeStatus(next) !== normalizeStatus(statusFilter.value);
  if (shouldRemove) {
    orders.value = orders.value.filter((o) => o.id !== orderId);
  } else {
    // Otherwise, optimistically update the row in place.
    orders.value = orders.value.map((o) => (String(o.id) === String(orderId) ? { ...o, status: next } : o));
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: next })
      .eq('id', orderId);

    if (error) throw error;
  } catch (err) {
    orders.value = before;
    errorMsg.value = err instanceof Error ? err.message : 'Failed to update status.';
  } finally {
    updatingId.value = null;
  }
}

function upsertFilteredOrder(newOrder: any) {
  const status = normalizeStatus(newOrder?.status ?? '');
  if (!newOrder || status !== normalizeStatus(statusFilter.value)) return;
  // Only keep realtime inserts on the first page so paging doesn't jump around.
  if (page.value !== 0) return;

  const idx = orders.value.findIndex((o) => String(o.id) === String(newOrder.id));
  const normalized: Order = {
    id: newOrder.id,
    user_id: newOrder.user_id,
    total_price: Number(newOrder.total_price ?? 0),
    status: statusFilter.value,
    created_at: newOrder.created_at,
  };

  if (idx === -1) {
    orders.value = [normalized, ...orders.value];
  } else {
    const copy = orders.value.slice();
    copy[idx] = normalized;
    orders.value = copy;
  }
}

function removeOrder(orderId: any) {
  orders.value = orders.value.filter((o) => String(o.id) !== String(orderId));
}

const activeOrder = computed(() => {
  if (activeOrderId.value == null) return null;
  return orders.value.find((o) => String(o.id) === String(activeOrderId.value)) ?? null;
});

const activeItems = computed(() => {
  if (activeOrderId.value == null) return null;
  return itemsByOrderId.value[String(activeOrderId.value)] ?? null;
});

const visibleOrders = computed(() => {
  const q = query.value.trim().toLowerCase();

  return orders.value.filter((order) => {
    const matchesQuery =
      q.length === 0 ||
      String(order.id).toLowerCase().includes(q) ||
      String(order.user_id).toLowerCase().includes(q);

    return matchesQuery;
  });
});

onMounted(async () => {
  await fetchOrders({ reset: true });

  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
      if (payload.eventType === 'DELETE') {
        removeOrder(payload.old?.id);
        return;
      }

      const row = payload.new;
      if (!row) return;

      if (normalizeStatus(row.status) === normalizeStatus(statusFilter.value)) upsertFilteredOrder(row);
      else removeOrder(row.id);
    })
    .subscribe();
});

onBeforeUnmount(() => {
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

.subcopy strong {
  color: var(--ion-color-dark);
}

.tiny {
  margin: 10px 0 0;
  color: var(--ion-color-medium);
}

.tiny strong {
  color: var(--ion-color-dark);
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

.status {
  margin-top: 6px;
  --padding-start: 10px;
  --padding-end: 10px;
  --border-radius: 999px;
  border: 1px solid rgba(72, 105, 76, 0.14);
  background: rgba(255, 252, 246, 0.88);
  font-weight: 800;
  text-transform: lowercase;
}

.view-items {
  --border-radius: 999px;
  font-weight: 800;
  text-transform: none;
}

.items-shell {
  display: none;
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

.empty {
  padding: 14px 12px 8px;
  text-align: center;
  color: var(--ion-color-medium);
  font-weight: 700;
}

.empty-hint {
  margin-top: 8px;
  font-weight: 600;
  line-height: 1.4;
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

@media (max-width: 767px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
