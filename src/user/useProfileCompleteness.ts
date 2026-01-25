import { useMemo } from 'react';
import { User } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';

interface ProfileCompleteness {
  is_complete: boolean;
  missing_fields: string[];
  mandatory_fields: string[];
  enforcement_enabled: boolean;
}

// Extended User type with profile_completeness (added by backend when MANDATORY_USER_ATTRIBUTES is configured)
type UserWithProfileCompleteness = User & {
  profile_completeness?: ProfileCompleteness;
};

/**
 * Extract profile completeness from user object or calculate locally
 */
export const getProfileCompleteness = (user: User): ProfileCompleteness => {
  // If backend provides profile_completeness, use it
  // Note: profile_completeness is added to User response when MANDATORY_USER_ATTRIBUTES is configured
  const userWithCompleteness = user as UserWithProfileCompleteness;
  const serverCompleteness = userWithCompleteness.profile_completeness;
  if (
    serverCompleteness &&
    typeof serverCompleteness.is_complete === 'boolean'
  ) {
    return serverCompleteness;
  }

  // Fall back to local calculation
  const mandatoryAttributes =
    ENV.plugins.WALDUR_CORE.MANDATORY_USER_ATTRIBUTES || [];
  const enforcementEnabled =
    ENV.plugins.WALDUR_CORE.ENFORCE_MANDATORY_USER_ATTRIBUTES || false;

  const missingFields = mandatoryAttributes.filter((field) => !user[field]);

  return {
    is_complete: missingFields.length === 0,
    missing_fields: missingFields,
    mandatory_fields: mandatoryAttributes,
    enforcement_enabled: enforcementEnabled,
  };
};

/**
 * Hook to get profile completeness status for a user.
 * Uses profile_completeness from API response if available,
 * otherwise calculates locally from MANDATORY_USER_ATTRIBUTES config.
 */
export const useProfileCompleteness = (
  user: User | undefined,
): ProfileCompleteness | null => {
  return useMemo(() => {
    if (!user) return null;
    return getProfileCompleteness(user);
  }, [user]);
};
