export type UserRole = "user" | "admin";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type ActivityAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "STATUS_CHANGED"
  | "NOTE_ADDED"
  | "TASK_COMPLETED"
  | "DEAL_WON";

export type EntityType = "LEAD" | "NOTE" | "TASK";

export type SafeUser = {
  id: number;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date;
};

export type Lead = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  value: string;
  notes: string | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadNote = {
  id: number;
  content: string;
  leadId: number;
  createdAt: Date;
};

export type LeadTask = {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
  completed: boolean;
  leadId: number;
  userId: number;
  createdAt: Date;
};

export type ActivityLog = {
  id: number;
  action: ActivityAction;
  entityType: EntityType;
  entityId: number;
  description: string;
  userId: number;
  createdAt: Date;
};
