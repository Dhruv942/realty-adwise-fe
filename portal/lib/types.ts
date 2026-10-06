export type Role = "ADMIN" | "EXECUTIVE";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type TeamRef = { id: string; name: string; isActive: boolean };

export type Team = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
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
  role: "EXECUTIVE";
  isActive: boolean;
  team: TeamRef | null;
  createdAt: string;
  updatedAt: string;
};

export type TeamDetail = Team & { executives: Executive[] };

export type LoginResponse = { accessToken: string; user: SessionUser };

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
  isNew: boolean;
  assignedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerType = "INDIVIDUAL" | "COMPANY";

/** One of the client's other enquiries, as shown in lead detail. */
export type HistoryEntry = Omit<Lead, "customer" | "property" | "assignedExecutive"> & {
  property: { id?: string; name: string; location?: string | null };
  assignedExecutive: { id?: string; name: string } | null;
};

export type LeadDetail = Lead & { customerEnquiryCount: number; customerHistory: HistoryEntry[] };

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
