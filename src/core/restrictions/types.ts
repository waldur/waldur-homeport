export type RestrictionField =
  | 'user_email_patterns'
  | 'user_affiliations'
  | 'user_identity_sources'
  | 'user_nationalities'
  | 'user_organization_types'
  | 'user_assurance_levels';

// Helper to safely get array from unknown
export const getRestrictionsArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
};
