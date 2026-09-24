import { ROLE } from './types.ts'
import type { Capability, Role } from './types.ts'

/**
 * Ported 1:1 from PNW_Roles::role_capabilities() (the custom pnw_* caps
 * only) - except `pnw_manage_users`, which the real plugin has no
 * equivalent of (see its definition in types.ts). Given to both DEPUTY and
 * DIRECTOR by user request, not just DIRECTOR alone.
 */
const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  [ROLE.MK_LEADER]: ['pnw_submit_news'],
  [ROLE.DEPUTY]: ['pnw_review_news', 'pnw_view_audit_log', 'pnw_manage_published_news', 'pnw_manage_users'],
  [ROLE.DIRECTOR]: [
    'pnw_review_news',
    'pnw_view_audit_log',
    'pnw_manage_workflow',
    'pnw_manage_published_news',
    'pnw_manage_users',
  ],
}

/** Every role a user account can have, in the order they should list/select in. */
export const ALL_ROLES: Role[] = [ROLE.MK_LEADER, ROLE.DEPUTY, ROLE.DIRECTOR]

export function hasCapability(role: Role, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability)
}

export function canSubmit(role: Role): boolean {
  return hasCapability(role, 'pnw_submit_news')
}

export function canReview(role: Role): boolean {
  return hasCapability(role, 'pnw_review_news')
}

export function canManagePublished(role: Role): boolean {
  return hasCapability(role, 'pnw_manage_published_news')
}

export function canViewAuditLog(role: Role): boolean {
  return hasCapability(role, 'pnw_view_audit_log')
}

export function canManageUsers(role: Role): boolean {
  return hasCapability(role, 'pnw_manage_users')
}

/** Ported from PNW_Frontend_Shell_Trait::role_label(). */
export function roleLabel(role: Role): string {
  switch (role) {
    case ROLE.DIRECTOR:
      return 'Igazgató'
    case ROLE.DEPUTY:
      return 'Igazgatóhelyettes'
    case ROLE.MK_LEADER:
      return 'Munkaközösség-vezető'
    default:
      return 'Felhasználó'
  }
}
