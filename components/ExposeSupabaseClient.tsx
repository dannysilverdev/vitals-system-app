'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ExposeSupabaseClient() {
  useEffect(() => {
    try {
      // @ts-ignore
      window.supabase = supabase;
      console.log('🔍 window.supabase expuesto ✅', !!(window as any).supabase);
    } catch (err) {
      console.error('❌ Error exponiendo window.supabase', err);
    }
  }, []);

  return null;
}
