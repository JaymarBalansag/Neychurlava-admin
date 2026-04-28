import { computed, ref } from 'vue';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

const session = ref<Session | null>(null);
const user = ref<User | null>(null);
const role = ref<string | null>(null);

let initPromise: Promise<void> | null = null;
let unsubscribe: (() => void) | null = null;
let rolePromise: Promise<void> | null = null;

export function useAuth() {
  const isAuthed = computed(() => Boolean(session.value));
  const isAdmin = computed(() => {
    const currentRole = (role.value ?? '').toLowerCase().trim();
    return currentRole === 'admin';
  });
  return { session, user, role, isAuthed, isAdmin };
}

async function refreshRole(newSession: Session | null) {
  if (!newSession?.user) {
    role.value = null;
    return;
  }

  rolePromise = (async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', newSession.user.id)
      .maybeSingle();

    if (error) {
      role.value = null;
      return;
    }

    role.value = (data?.role ?? null) as string | null;
  })();

  await rolePromise;
}

export function initAuth() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { data } = await supabase.auth.getSession();
    session.value = data.session ?? null;
    user.value = data.session?.user ?? null;
    await refreshRole(data.session ?? null);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession ?? null;
      user.value = newSession?.user ?? null;
      void refreshRole(newSession ?? null);
    });

    unsubscribe = () => {
      listener.subscription.unsubscribe();
    };
  })();

  return initPromise;
}

export async function waitForRole() {
  await rolePromise;
}

export function stopAuth() {
  unsubscribe?.();
  unsubscribe = null;
  initPromise = null;
  rolePromise = null;
  session.value = null;
  user.value = null;
  role.value = null;
}
