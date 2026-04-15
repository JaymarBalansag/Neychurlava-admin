<template>
  <ion-page>
    <ion-header :translucent="true" class="page-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Products</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" class="icon-chip" :disabled="loading" @click="fetchProducts({ reset: true })">
            <ion-icon :icon="refreshOutline"></ion-icon>
          </ion-button>
          <ion-button fill="clear" class="icon-chip" @click="openCreate">
            <ion-icon :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="page-content">
      <div class="shell">
        <section class="top-card">
          <p class="eyebrow">Menu</p>
          <h1>Product Manager</h1>
          <p class="subcopy">Add, edit, delete, and toggle availability.</p>

          <div class="filters">
            <ion-select
              class="filter"
              interface="popover"
              label="Availability"
              label-placement="stacked"
              :value="availabilityFilter"
              @ionChange="onAvailabilityChange"
            >
              <ion-select-option value="all">all</ion-select-option>
              <ion-select-option value="available">available</ion-select-option>
              <ion-select-option value="unavailable">unavailable</ion-select-option>
            </ion-select>
          </div>

          <ion-searchbar
            v-model="query"
            placeholder="Search products by name"
            inputmode="search"
            class="search"
          ></ion-searchbar>
        </section>

        <ion-list lines="none" class="list-card">
          <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
          <div v-if="loading" class="loading">
            <ion-spinner name="crescent"></ion-spinner>
            <span>Loading products...</span>
          </div>

          <ion-item v-for="p in productsFiltered" :key="p.id" :detail="false" class="row">
            <ion-thumbnail class="thumb" v-if="p.image_url">
              <ion-img :src="p.image_url" :alt="p.name"></ion-img>
            </ion-thumbnail>

            <ion-label>
              <div class="title-row">
                <strong>{{ p.name }}</strong>
                <ion-badge :color="p.is_available ? 'success' : 'warning'">
                  {{ p.is_available ? 'available' : 'unavailable' }}
                </ion-badge>
              </div>
              <p class="meta">
                <span>{{ formatCurrency(p.price) }}</span>
                <span v-if="p.created_at">Created: {{ formatDate(p.created_at) }}</span>
              </p>
            </ion-label>

            <div class="right">
              <div class="toggle">
                <small>Available</small>
                <ion-toggle
                  :checked="Boolean(p.is_available)"
                  @click.stop
                  @ionChange="(ev) => onToggleAvailability(p, ev)"
                ></ion-toggle>
              </div>

              <div class="actions">
                <ion-button size="small" fill="clear" color="primary" @click.stop="openView(p)">More</ion-button>
                <ion-button size="small" fill="clear" color="primary" @click.stop="openEdit(p)">Edit</ion-button>
                <ion-button size="small" fill="clear" color="danger" @click.stop="askDelete(p)">Delete</ion-button>
              </div>
            </div>
          </ion-item>

          <div v-if="!loading && products.length === 0" class="empty">
            No products found.
          </div>

          <div v-if="!loading && products.length > 0" class="pager">
            <ion-button fill="outline" color="primary" :disabled="!hasMore || loadingMore" @click="loadMore">
              {{ !hasMore ? 'No more results' : loadingMore ? 'Loading...' : 'Load more' }}
            </ion-button>
            <small v-if="totalCount !== null" class="count">
              Showing {{ products.length }} of {{ totalCount }}
            </small>
          </div>
        </ion-list>
      </div>

      <ion-modal :is-open="editorOpen" :initial-breakpoint="0.92" :breakpoints="[0, 0.6, 0.92]" @didDismiss="closeEditor">
        <ion-header class="modal-header">
          <ion-toolbar>
            <ion-title>{{ editorMode === 'create' ? 'Add Product' : 'Edit Product' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button fill="clear" @click="closeEditor">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="modal-content">
          <div class="modal-shell">
            <div v-if="editorError" class="error">{{ editorError }}</div>

            <ion-item lines="none" class="field">
              <ion-label position="stacked">Name</ion-label>
              <ion-input :value="form.name" @ionInput="onFormName" placeholder="Product name"></ion-input>
            </ion-item>

            <ion-item lines="none" class="field">
              <ion-label position="stacked">Price</ion-label>
              <ion-input inputmode="decimal" :value="String(form.price)" @ionInput="onFormPrice" placeholder="0"></ion-input>
            </ion-item>

            <ion-item lines="none" class="field">
              <ion-label position="stacked">Image URL</ion-label>
              <ion-input :value="form.image_url" @ionInput="onFormImage" placeholder="https://..."></ion-input>
            </ion-item>

            <div class="field toggle-field">
              <ion-toggle :checked="Boolean(form.is_available)" @ionChange="onFormAvailable"></ion-toggle>
              <span>Available for ordering</span>
            </div>

            <ion-button expand="block" color="primary" :disabled="saving" @click="saveProduct">
              {{ saving ? 'Saving...' : 'Save' }}
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>

      <ion-modal :is-open="viewerOpen" :initial-breakpoint="0.92" :breakpoints="[0, 0.6, 0.92]" @didDismiss="closeViewer">
        <ion-header class="modal-header">
          <ion-toolbar>
            <ion-title>Product Info</ion-title>
            <ion-buttons slot="end">
              <ion-button fill="clear" @click="closeViewer">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="modal-content">
          <div class="modal-shell">
            <section class="info-card" v-if="activeProduct">
              <p class="eyebrow">Product</p>
              <h2>{{ activeProduct.name }}</h2>
              <div class="info-row">
                <ion-badge :color="activeProduct.is_available ? 'success' : 'warning'">
                  {{ activeProduct.is_available ? 'available' : 'unavailable' }}
                </ion-badge>
                <strong class="price">{{ formatCurrency(activeProduct.price) }}</strong>
              </div>

              <p class="info-meta">
                <span>ID: <strong>{{ activeProduct.id }}</strong></span>
                <span v-if="activeProduct.created_at">Created: <strong>{{ formatDate(activeProduct.created_at) }}</strong></span>
              </p>

              <div v-if="activeProduct.image_url" class="preview">
                <ion-img :src="activeProduct.image_url" :alt="activeProduct.name"></ion-img>
              </div>
            </section>
          </div>
        </ion-content>
      </ion-modal>

      <ion-alert
        :is-open="deleteAlertOpen"
        header="Delete product?"
        :message="deleteAlertMessage"
        :buttons="deleteButtons"
        @didDismiss="deleteAlertOpen = false"
      ></ion-alert>
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
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonList,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonThumbnail,
  IonToggle,
  IonTitle,
  IonToolbar,
  IonAlert,
} from '@ionic/vue';
import { addOutline, refreshOutline } from 'ionicons/icons';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { supabase } from '../supabase';

type ProductRow = {
  id: string | number;
  name: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string | null;
};

const query = ref('');
const availabilityFilter = ref<'all' | 'available' | 'unavailable'>('all');

const products = ref<ProductRow[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const errorMsg = ref('');

const PAGE_SIZE = 20;
const page = ref(0);
const hasMore = ref(true);
const totalCount = ref<number | null>(null);

let searchTimer: any = null;

function formatCurrency(value: number) {
  return `PHP ${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function onAvailabilityChange(ev: CustomEvent<{ value: string }>) {
  availabilityFilter.value = (String(ev.detail.value) as any) || 'all';
  void fetchProducts({ reset: true });
}

async function fetchProducts(opts: { reset: boolean }) {
  if (opts.reset) {
    loading.value = true;
    page.value = 0;
    hasMore.value = true;
    totalCount.value = null;
    products.value = [];
  } else {
    loadingMore.value = true;
  }

  errorMsg.value = '';

  try {
    const offset = page.value * PAGE_SIZE;
    const from = offset;
    const to = offset + PAGE_SIZE - 1;

    // NOTE: this assumes `products` has `is_available` boolean column.
    let q = supabase
      .from('products')
      .select('id,name,price,image_url,is_available,created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    const search = query.value.trim();
    if (search.length >= 2) {
      q = q.ilike('name', `%${search}%`);
    }

    if (availabilityFilter.value === 'available') q = q.eq('is_available', true);
    if (availabilityFilter.value === 'unavailable') q = q.eq('is_available', false);

    const { data, error, count } = await q;
    if (error) throw error;

    totalCount.value = typeof count === 'number' ? count : totalCount.value;

    const rows = (data ?? []) as unknown as ProductRow[];
    products.value = opts.reset ? rows : [...products.value, ...rows];
    hasMore.value = rows.length === PAGE_SIZE;
  } catch (err) {
    errorMsg.value =
      err instanceof Error
        ? err.message
        : "Failed to load products. Check RLS policies and ensure 'products.is_available' exists.";
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

async function loadMore() {
  if (!hasMore.value || loading.value || loadingMore.value) return;
  page.value += 1;
  await fetchProducts({ reset: false });
}

const productsFiltered = computed(() => {
  // Keep a lightweight client filter for small queries (<2 chars).
  const q = query.value.trim().toLowerCase();
  if (q.length >= 2) return products.value;
  if (q.length === 0) return products.value;
  return products.value.filter((p) => p.name.toLowerCase().includes(q));
});

watch(
  () => query.value,
  () => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => void fetchProducts({ reset: true }), 300);
  }
);

type ToggleEvent = CustomEvent<{ checked: boolean }>;

async function onToggleAvailability(p: ProductRow, ev: ToggleEvent) {
  const next = Boolean(ev.detail.checked);
  const before = products.value.slice();
  products.value = products.value.map((row) => (String(row.id) === String(p.id) ? { ...row, is_available: next } : row));

  try {
    const { error } = await supabase.from('products').update({ is_available: next }).eq('id', p.id);
    if (error) throw error;
  } catch (err) {
    products.value = before;
    errorMsg.value = err instanceof Error ? err.message : 'Failed to update availability.';
  }
}

const editorOpen = ref(false);
const editorMode = ref<'create' | 'edit'>('create');
const editorError = ref('');
const saving = ref(false);

const form = ref({
  id: null as string | number | null,
  name: '',
  price: 0,
  image_url: '',
  is_available: true,
});

type IonInputEvent = CustomEvent<{ value?: string | null }>;

function onFormName(ev: IonInputEvent) {
  form.value.name = ev.detail.value ?? '';
}
function onFormPrice(ev: IonInputEvent) {
  const raw = ev.detail.value ?? '';
  const n = Number(raw);
  form.value.price = Number.isFinite(n) ? n : 0;
}
function onFormImage(ev: IonInputEvent) {
  form.value.image_url = ev.detail.value ?? '';
}
function onFormAvailable(ev: ToggleEvent) {
  form.value.is_available = Boolean(ev.detail.checked);
}

function openCreate() {
  editorMode.value = 'create';
  editorError.value = '';
  form.value = { id: null, name: '', price: 0, image_url: '', is_available: true };
  editorOpen.value = true;
}

function openEdit(p: ProductRow) {
  editorMode.value = 'edit';
  editorError.value = '';
  form.value = {
    id: p.id,
    name: p.name ?? '',
    price: Number(p.price ?? 0),
    image_url: p.image_url ?? '',
    is_available: Boolean(p.is_available),
  };
  editorOpen.value = true;
}

function closeEditor() {
  editorOpen.value = false;
}

async function saveProduct() {
  if (saving.value) return;
  editorError.value = '';

  const name = form.value.name.trim();
  if (!name) {
    editorError.value = 'Name is required.';
    return;
  }

  saving.value = true;
  try {
    const payload = {
      name,
      price: Number(form.value.price ?? 0),
      image_url: form.value.image_url?.trim() || null,
      is_available: Boolean(form.value.is_available),
    };

    if (editorMode.value === 'create') {
      const { error } = await supabase.from('products').insert(payload);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('products').update(payload).eq('id', form.value.id);
      if (error) throw error;
    }

    editorOpen.value = false;
    await fetchProducts({ reset: true });
  } catch (err) {
    editorError.value = err instanceof Error ? err.message : 'Failed to save product.';
  } finally {
    saving.value = false;
  }
}

const viewerOpen = ref(false);
const activeProduct = ref<ProductRow | null>(null);

function openView(p: ProductRow) {
  activeProduct.value = p;
  viewerOpen.value = true;
}

function closeViewer() {
  viewerOpen.value = false;
  activeProduct.value = null;
}

const deleteAlertOpen = ref(false);
const deleteTarget = ref<ProductRow | null>(null);
const deleteAlertMessage = computed(() => {
  if (!deleteTarget.value) return '';
  return `This will permanently delete <strong>${deleteTarget.value.name}</strong>.`;
});

const deleteButtons = [
  { text: 'Cancel', role: 'cancel' },
  {
    text: 'Delete',
    role: 'destructive',
    handler: async () => {
      if (!deleteTarget.value) return;
      const id = deleteTarget.value.id;
      deleteAlertOpen.value = false;
      deleteTarget.value = null;
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        await fetchProducts({ reset: true });
      } catch (err) {
        errorMsg.value = err instanceof Error ? err.message : 'Failed to delete product.';
      }
    },
  },
];

function askDelete(p: ProductRow) {
  deleteTarget.value = p;
  deleteAlertOpen.value = true;
}

onMounted(async () => {
  await fetchProducts({ reset: true });
});

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
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
    radial-gradient(circle at top, rgba(203, 232, 195, 0.28), transparent 26%),
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

.thumb {
  --size: 56px;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  flex: 0 0 auto;
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(255, 252, 246, 0.92);
  margin-right: 12px;
}

.row strong {
  display: block;
  margin-bottom: 6px;
  color: var(--ion-color-dark);
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
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

.toggle {
  display: grid;
  justify-items: end;
  gap: 4px;
}

.actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
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
  gap: 12px;
}

.field {
  --background: transparent;
  --inner-padding-end: 0px;
  border-radius: 20px;
  margin-bottom: 12px;
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(72, 105, 76, 0.05);
}

.toggle-field {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}

.info-card {
  border: 1px solid rgba(72, 105, 76, 0.12);
  background: rgba(255, 252, 246, 0.86);
  box-shadow: 0 24px 55px rgba(53, 77, 49, 0.08);
  backdrop-filter: blur(14px);
  border-radius: 26px;
  padding: 16px;
}

.info-card h2 {
  margin: 0;
  color: var(--ion-color-dark);
}

.info-row {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.price {
  color: var(--ion-color-dark);
}

.info-meta {
  margin: 10px 0 0;
  display: grid;
  gap: 6px;
  color: var(--ion-color-medium);
}

.preview {
  margin-top: 14px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(72, 105, 76, 0.12);
}

@media (max-width: 767px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
