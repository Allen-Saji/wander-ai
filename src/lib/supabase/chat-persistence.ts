import { createClient } from "@/lib/supabase/client";

export interface UserThread {
  id: string;
  user_id: string;
  tambo_thread_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Save a Tambo thread ID for the current user
 */
export async function saveUserThread(
  userId: string,
  tamboThreadId: string,
  title?: string
): Promise<UserThread | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_threads")
    .upsert(
      {
        user_id: userId,
        tambo_thread_id: tamboThreadId,
        title: title || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,tambo_thread_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to save user thread:", error);
    return null;
  }
  return data;
}

/**
 * Get all thread IDs for a user
 */
export async function getUserThreads(
  userId: string
): Promise<UserThread[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_threads")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user threads:", error);
    return [];
  }
  return data || [];
}

/**
 * Update a thread's title
 */
export async function updateThreadTitle(
  userId: string,
  tamboThreadId: string,
  title: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_threads")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("tambo_thread_id", tamboThreadId);

  if (error) {
    console.error("Failed to update thread title:", error);
  }
}

/**
 * Delete a thread mapping
 */
export async function deleteUserThread(
  userId: string,
  tamboThreadId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_threads")
    .delete()
    .eq("user_id", userId)
    .eq("tambo_thread_id", tamboThreadId);

  if (error) {
    console.error("Failed to delete user thread:", error);
  }
}

/**
 * Touch the updated_at timestamp (call when a message is sent)
 */
export async function touchThread(
  userId: string,
  tamboThreadId: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("user_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("tambo_thread_id", tamboThreadId);

  if (error) {
    console.error("Failed to touch thread:", error);
  }
}
