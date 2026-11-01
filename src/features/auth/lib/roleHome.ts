import type { UserRole } from "../../../types/auth";

const ROLE_HOME: Record<UserRole, string> = {
  agent: "/agent",
  client: "/client",
  fournisseur: "/fournisseur",
  super_admin: "/admin",
};

export function getRoleHome(role: UserRole): string {
  return ROLE_HOME[role];
}
