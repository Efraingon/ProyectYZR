/** Shared domain types for ProyectYZR. */

export type ProjectStatus = "pending" | "active" | "completed" | "archived";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus | string;
  start_date: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
}
