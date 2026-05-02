import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';

import { useUser } from '@/workspace/hooks';

import { getProfileCompleteness } from './useProfileCompleteness';

interface ProfileCompletenessContextValue {
  /** True if non-exempt user has incomplete profile with enforcement enabled */
  shouldBlockNavigation: boolean;
  /** True if profile has all mandatory fields */
  isProfileComplete: boolean;
  /** True if user is staff or support (exempt from enforcement) */
  isUserExempt: boolean;
  /** List of missing mandatory field names */
  missingFields: string[];
  /** True if enforcement is enabled in settings */
  enforcementEnabled: boolean;
}

const defaultValue: ProfileCompletenessContextValue = {
  shouldBlockNavigation: false,
  isProfileComplete: true,
  isUserExempt: false,
  missingFields: [],
  enforcementEnabled: false,
};

const ProfileCompletenessContext =
  createContext<ProfileCompletenessContextValue>(defaultValue);

export const ProfileCompletenessProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const user = useUser();

  const value = useMemo<ProfileCompletenessContextValue>(() => {
    if (!user) {
      return defaultValue;
    }

    const completeness = getProfileCompleteness(user);
    const isUserExempt = Boolean(user.is_staff || user.is_support);
    const isProfileComplete = completeness.is_complete;
    const hasAgreementDate = Boolean(user.agreement_date);

    // Frontend always enforces profile completeness (enforcement_enabled is for API only)
    // Block navigation if:
    // 1. User is not exempt (not staff/support)
    // 2. Profile is incomplete OR agreement date is missing
    const shouldBlockNavigation =
      !isUserExempt && (!isProfileComplete || !hasAgreementDate);

    return {
      shouldBlockNavigation,
      isProfileComplete,
      isUserExempt,
      missingFields: completeness.missing_fields,
      enforcementEnabled: completeness.enforcement_enabled,
    };
  }, [user]);

  return (
    <ProfileCompletenessContext.Provider value={value}>
      {children}
    </ProfileCompletenessContext.Provider>
  );
};

export const useProfileCompletenessContext =
  (): ProfileCompletenessContextValue => {
    return useContext(ProfileCompletenessContext);
  };
