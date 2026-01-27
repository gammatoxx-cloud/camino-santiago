export type UserPlan = 'gratis' | 'basico' | 'completo';

export interface UserProfile {
  id: string;
  name: string;
  location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  avatar_url: string | null;
  phone_number: string | null;
  email?: string | null; // Email from auth.users (only available for team members)
  start_date: string; // ISO date string
  user_plan?: UserPlan;
  created_at: string;
  updated_at: string;
}

export interface WalkCompletion {
  id: string;
  user_id: string;
  week_number: number;
  day_of_week: string;
  distance_km: number;
  completed_at: string;
  created_at: string;
}

export interface PhaseUnlock {
  id: string;
  user_id: string;
  phase_number: number;
  unlocked_at: string;
  created_at: string;
}

export interface PhaseCompletion {
  id: string;
  user_id: string;
  phase_number: number;
  completed_at: string;
  created_at: string;
}

export interface TrainingDay {
  day: string; // e.g., "Monday"
  distance: number; // in km
  focus: string; // focus point for the walk
}

export interface Week {
  weekNumber: number;
  phaseNumber: number;
  days: TrainingDay[];
  weeklyTotal: number; // total km for the week
}

export interface Phase {
  number: number;
  name: string;
  weeks: number[]; // array of week numbers in this phase
  description: string;
  goals: string[];
  learning: string[]; // key learning points
}

export interface Team {
  id: string;
  name: string | null;
  created_by: string;
  max_members: number;
  whatsapp_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface TeamWithMembers extends Team {
  members: (TeamMember & { profile?: UserProfile })[];
  member_count: number;
  total_distance_km?: number; // OPTIONAL - backward compatible
}

export interface NearbyUser extends UserProfile {
  distance_miles: number;
  team_id?: string;
  team_name?: string;
  is_team_leader?: boolean;
  team_max_members?: number;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  invited_by: string;
  invited_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface TeamInvitationWithDetails extends TeamInvitation {
  team?: Team;
  inviter?: UserProfile;
}

export interface TeamJoinRequest {
  id: string;
  team_id: string;
  requested_by: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}

export interface TeamJoinRequestWithDetails extends TeamJoinRequest {
  requester?: UserProfile;
  team?: Team;
}

export interface TrailCompletion {
  id: string;
  user_id: string;
  trail_id: string;
  completed_at: string;
  created_at: string;
}

export interface BookCompletion {
  id: string;
  user_id: string;
  book_id: string;
  completed_at: string;
  created_at: string;
}

export interface VideoCompletion {
  id: string;
  user_id: string;
  video_id: string;
  completed_at: string;
  created_at: string;
}

export interface MagnoliasHike {
  id: string;
  numero: number;
  etapa: number;
  distancia: string;
  duracion_estimada: string;
  points: number;
}

export interface MagnoliasHikeCompletion {
  id: string;
  user_id: string;
  hike_id: string;
  completed_at: string;
  created_at: string;
}

export interface Insignia {
  etapa: number;
  km: number;
  title: string;
  description: string;
  image: string;
}

export interface BookInsignia {
  id: string;
  title: string;
  description: string;
  image: string;
  minBooks: number;
  maxBooks?: number; // Optional for 5+ requirement
}

export interface VideoInsignia {
  id: string;
  title: string;
  description: string;
  image: string;
  minVideos: number;
  maxVideos?: number; // Optional for 5+
}

export interface Subscription {
  id: string;
  user_id: string;
  wix_order_id: string | null;
  wix_payment_link_id: string | null;
  plan_id: string;
  status: 'pending' | 'active' | 'canceled' | 'expired' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

