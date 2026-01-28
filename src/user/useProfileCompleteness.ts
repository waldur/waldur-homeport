import { useMemo } from 'react';
import { User } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import {
  isProfileAttributeEnabled,
  ProfileAttribute,
} from '@waldur/user/support/profileAttributes';

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
 * Check if a field is visible in the UI based on configuration
 */
const isFieldVisibleInUI = (field: string): boolean => {
  return isProfileAttributeEnabled(field as ProfileAttribute);
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
    // Filter out fields that aren't visible in the UI
    const visibleMissingFields =
      serverCompleteness.missing_fields.filter(isFieldVisibleInUI);
    return {
      ...serverCompleteness,
      missing_fields: visibleMissingFields,
      is_complete: visibleMissingFields.length === 0,
    };
  }

  // Fall back to local calculation
  const mandatoryAttributes =
    ENV.plugins.WALDUR_CORE.MANDATORY_USER_ATTRIBUTES || [];
  const enforcementEnabled =
    ENV.plugins.WALDUR_CORE.ENFORCE_MANDATORY_USER_ATTRIBUTES || false;

  // Only consider fields that are visible in the UI
  const visibleMandatoryAttributes =
    mandatoryAttributes.filter(isFieldVisibleInUI);
  const missingFields = visibleMandatoryAttributes.filter(
    (field) => !user[field],
  );

  return {
    is_complete: missingFields.length === 0,
    missing_fields: missingFields,
    mandatory_fields: visibleMandatoryAttributes,
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
