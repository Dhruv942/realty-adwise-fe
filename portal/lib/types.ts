/** Portal area. The backend calls executives `SALES`; the session stores them as EXECUTIVE. */
export type Role = "ADMIN" | "MANAGER" | "EXECUTIVE";

export type Designation = "MANAGER" | "SALES_EXECUTIVE" | "EXECUTIVE_MANAGER";
export const DESIGNATION_LABEL: Record<Designation, string> = {
  MANAGER: "Manager",
  SALES_EXECUTIVE: "Sales Executive",
  EXECUTIVE_MANAGER: "Executive Manager",
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  designation?: Designation;
};

export type TeamRef = { id: string; name: string; isActive: boolean };
export type ManagerRef = { id: string; name: string };

export type Team = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  manager?: ManagerRef | null;
  executiveCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Executive = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  username: string;
  role: "SALES" | "EXECUTIVE";
  designation?: Designation;
  isActive: boolean;
  team: TeamRef | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamDetail = Team & { executives: Executive[] };

export type Manager = Omit<Executive, "role" | "team"> & { role: "MANAGER"; team: TeamRef | null };
export type ManagerDetail = Manager & { managedTeams: Team[] };

/** Raw login payload: executives come back with role `SALES`. */
export type LoginResponse = { accessToken: string; user: Omit<SessionUser, "role"> & { role: Role | "SALES" } };

export type FieldErrors = Record<string, string>;

/** Result of a server action, rendered by the form that submitted it. */
export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: FieldErrors;
  /** Submitted values echoed back so the form keeps them after an error. */
  values?: Record<string, string>;
};

export const idleState: FormState = { status: "idle" };

export const LEAD_STATUSES = ["PENDING_ASSIGNMENT", "INCOMING", "RINGING", "CONNECTED", "CLOSED", "LOST", "BROKER"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export const LEAD_SOURCES = ["99ACRES", "MAGICBRICKS"] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export type Property = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  isActive: boolean;
  isStub: boolean;
  assignedExecutiveCount: number;
  needsAssignment: boolean;
  pendingLeadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PropertyExecutive = { id: string; name: string; username: string; isActive: boolean };
export type PropertyDetail = Property & { executives: PropertyExecutive[] };

export type Lead = {
  id: string;
  status: LeadStatus;
  message: string | null;
  budget: number | null;
  requestedPropertyName: string;
  externalLeadId: string | null;
  source: LeadSource;
  customer: { id: string; name: string; mobile: string; email: string | null; type: CustomerType };
  property: { id: string; name: string; location: string | null };
  assignedExecutive: { id: string; name: string } | null;
  leadNo: number;
  requirement: string | null;
  isImportant: boolean;
  isNew: boolean;
  assignedAt: string | null;
  /** The backend's SLA for the assigned executive, while the lead is Incoming. The portal only counts down to it. */
  sla: { minutes: number; deadline: string; now: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerType = "INDIVIDUAL" | "COMPANY";

/** One of the client's other enquiries, as shown in lead detail. */
export type HistoryEntry = Omit<Lead, "customer" | "property" | "assignedExecutive" | "sla"> & {
  property: { id?: string; name: string; location?: string | null };
  assignedExecutive: { id?: string; name: string } | null;
};

export type ActivityType = "LEAD_RECEIVED" | "ASSIGNED" | "SLA_STARTED" | "STATUS_CHANGED" | "SLA_BREACHED" | "AUTO_REASSIGNED";
export type ActivityEntry = {
  id: string;
  type: ActivityType;
  message: string;
  actor: { id: string; name: string | null } | null;
  executiveId: string | null;
  createdAt: string;
};

export type LeadDetail = Lead & { customerEnquiryCount: number; customerHistory: HistoryEntry[]; activity: ActivityEntry[] };

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  type: CustomerType;
  createdAt: string;
  updatedAt: string;
};

export type CustomerDetail = Customer & { leads: Omit<Lead, "customer">[] };

export type LeadSummary = { newLeads: number; totalLeads: number; byStatus: Partial<Record<LeadStatus, number>> };

export type AssignmentRuleSetting = {
  rule: string;
  defaultRule: string;
  isDefault: boolean;
  availableRules: { value: string; label: string; description: string }[];
  updatedAt: string | null;
  updatedBy: { id: string; name: string } | null;
};

export type AssignmentHistoryEntry = {
  id: string;
  leadId: string;
  executive: { id: string; name: string; username: string };
  method: "ROUND_ROBIN" | "MANUAL" | "TIMEOUT";
  assignedBy: { id: string; name: string } | null;
  createdAt: string;
};

export type LeadTimeoutSetting = {
  minutes: number;
  defaultMinutes: number;
  isDefault: boolean;
  minMinutes: number;
  maxMinutes: number;
  updatedAt: string | null;
  updatedBy: { id: string; name: string } | null;
};

export type NotificationType = "LEAD_CREATED" | "LEAD_ASSIGNED" | "LEAD_REASSIGNED" | "LEAD_STATUS_UPDATED" | "SLA_WARNING" | "SLA_EXPIRED";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: "LEAD";
  /** The lead id. */
  entityId: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};
