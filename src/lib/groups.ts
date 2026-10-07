import { supabase } from './supabase';

export type GroupSummary = {
  id: string;
  ad: string;
  invite_code: string;
  created_at: string;
  bulusma_gunu: number | null;
  bulusma_saati: string | null;
  bulusma_suresi_dakika: number;
  enlem: number | null;
  boylam: number | null;
  yaricap_metre: number;
  adres_metni: string | null;
};

export type GroupRole = 'yonetici' | 'uye' | 'stk_sorumlusu';

export type GroupMember = {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  rol: GroupRole;
  joined_at: string;
};

export async function listMyGroups(): Promise<GroupSummary[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getGroup(groupId: string): Promise<GroupSummary> {
  const { data, error } = await supabase.from('groups').select('*').eq('id', groupId).single();
  if (error) throw error;
  return data;
}

export async function createGroup(name: string): Promise<GroupSummary> {
  const { data, error } = await supabase.rpc('create_group', { p_name: name }).single();
  if (error) throw error;
  return data as GroupSummary;
}

export async function joinGroupWithCode(code: string): Promise<GroupSummary> {
  const { data, error } = await supabase.rpc('join_group', { p_code: code }).single();
  if (error) throw error;
  return data as GroupSummary;
}

export async function listGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase.rpc('group_member_profiles', { p_group_id: groupId });
  if (error) throw error;
  return (data ?? []) as GroupMember[];
}

export async function regenerateInviteCode(groupId: string): Promise<string> {
  const { data, error } = await supabase.rpc('regenerate_invite_code', { p_group_id: groupId });
  if (error) throw error;
  return data as string;
}

export async function transferGroupAdmin(groupId: string, newAdminUserId: string): Promise<void> {
  const { error } = await supabase.rpc('transfer_group_admin', {
    p_group_id: groupId,
    p_new_admin_id: newAdminUserId,
  });
  if (error) throw error;
}

export async function leaveGroup(groupId: string): Promise<void> {
  const { error } = await supabase.rpc('leave_group', { p_group_id: groupId });
  if (error) throw error;
}
