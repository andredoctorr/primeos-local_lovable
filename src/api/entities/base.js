// @ts-nocheck
import { supabase } from '@/lib/supabase';

/** Remove valores vazios/indefinidos para não quebrar colunas numéricas/booleanas. */
function sanitize(payload = {}) {
  const out = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined) return;
    if (typeof value === 'function') return;
    if (value === '') {
      out[key] = null;
      return;
    }
    out[key] = value;
  });
  return out;
}

export function createEntity(tableName) {
  return {
    async list(options = {}) {
      const opts = typeof options === 'string' ? { orderBy: options } : options || {};
      let query = supabase.from(tableName).select('*');
      if (opts.filters) {
        opts.filters.forEach(({ field, operator, value }) => {
          query = query.filter(field, operator || 'eq', value);
        });
      }
      if (opts.orderBy) {
        const desc = opts.orderBy.startsWith('-');
        const field = desc ? opts.orderBy.slice(1) : opts.orderBy;
        query = query.order(field, { ascending: opts.ascending ?? !desc });
      }
      if (opts.limit) {
        query = query.limit(opts.limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async create(payload) {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData?.session?.user?.email ?? null;
      const { data, error } = await supabase
        .from(tableName)
        .insert([{
          ...sanitize(payload),
          created_by: payload?.created_by ?? email,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async bulkCreate(items = []) {
      const rows = items.map((item) => ({
        ...sanitize(item),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      }));
      const { data, error } = await supabase.from(tableName).insert(rows).select();
      if (error) throw error;
      return data || [];
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(tableName)
        .update({ ...sanitize(payload), updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },

    async filter(field, value) {
      let query = supabase.from(tableName).select('*');
      if (field && typeof field === 'object') {
        Object.entries(field).forEach(([key, val]) => {
          query = query.eq(key, val);
        });
      } else if (field) {
        query = query.eq(field, value);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  };
}
