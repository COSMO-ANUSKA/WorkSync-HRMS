import { supabase } from '@/lib/supabase/browser';

export async function invokeFunction<T>(functionName: string, body?: any): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    throw new Error(error.message || `Edge function error: ${functionName}`);
  }

  return data as T;
}
