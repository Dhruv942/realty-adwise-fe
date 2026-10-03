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
