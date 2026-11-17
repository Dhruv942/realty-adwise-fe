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

/** The manager an executive reports to (there are no teams). */
export type ManagerRef = { id: string; name: string; isActive: boolean };

export type Executive = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  username: string;
  role: "SALES" | "EXECUTIVE";
  designation?: Designation;
  isActive: boolean;
  manager: ManagerRef | null;
  createdAt: string;
  updatedAt: string;
};

/** Managers never have a manager of their own. */
export type Manager = Omit<Executive, "role"> & { role: "MANAGER" };
export type ManagerDetail = Manager & { executives: Executive[] };

/** Raw login payload: executives come back with role `SALES`. */
export type LoginResponse = { accessToken: string; refreshToken?: string; user: Omit<SessionUser, "role"> & { role: Role | "SALES" } };

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
export const SOURCE_LABEL: Record<string, string> = { MAGICBRICKS: "Magicbricks", "99ACRES": "99acres" };
export const sourceLabel = (source?: string | null) => (source ? SOURCE_LABEL[source] ?? source : "Unknown");

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
export type PropertyInquiry = {
  id: string;
  leadNo: number;
  customer: { id: string; name: string };
  source: LeadSource;
  status: LeadStatus;
  enquiryType: EnquiryType | null;
  message: string | null;
  assignedExecutive: { id: string; name: string } | null;
  manager: { id: string; name: string } | null;
  createdAt: string;
  followUpAt: string | null;
};
export type PropertyInquiryPagination = { limit: number; offset: number; returned: number; total: number };
export type PropertyDetail = Property & {
  executives: PropertyExecutive[];
  inquiryCount?: number;
  assignedInquiryCount?: number;
  pendingInquiryCount?: number;
  inquiries?: PropertyInquiry[];
  inquiryPagination?: PropertyInquiryPagination;
};

export type Lead = {
  id: string;
  status: LeadStatus;
  message: string | null;
  budget: number | null;
  requestedPropertyName: string;
  externalLeadId: string | null;
  source: LeadSource;
  customer: { id: string; name: string; mobile: string; email: string | null };
  property: { id: string; name: string; location: string | null };
  assignedExecutive: { id: string; name: string } | null;
  leadNo: number;
  requirement: string | null;
  /** Rent or buy. Null for older leads and feed leads. */
  enquiryType: EnquiryType | null;
  isImportant: boolean;
  isNew: boolean;
  /** The lead's next follow-up, or null when nothing is scheduled. */
  followUp: LeadFollowUp | null;
  assignedAt: string | null;
  /** The backend's SLA for the assigned executive, while the lead is Incoming. The portal only counts down to it. */
  sla: { minutes: number; deadline: string; now: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type FollowUpState = "OVERDUE" | "TODAY" | "UPCOMING";
export type LeadFollowUp = {
  /** UTC ISO-8601 instant. */
  at: string;
  note: string | null;
  /** Computed by the backend when the response was built; recompute from `at` on long-open screens. */
  state: FollowUpState;
  updatedBy: { id: string; name: string } | null;
  updatedAt: string;
};
export const FOLLOW_UP_FILTERS = ["overdue", "today", "upcoming", "none"] as const;

export type EnquiryType = "RENT" | "BUY";
export const ENQUIRY_LABEL: Record<EnquiryType, string> = { RENT: "Rent", BUY: "Buy" };

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
