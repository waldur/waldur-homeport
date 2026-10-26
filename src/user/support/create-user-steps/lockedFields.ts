import { getProtectedFieldProps } from '../getProtectedFieldProps';
import { UserFormDialogData } from '../UserFormTypes';

// The edited user's identity provider owns these fields and the API keeps
// their values, so the dialog shows them read-only, as the profile page does.
export const getLockReason = (
  data: UserFormDialogData | undefined,
  field: string,
) => {
  if (!data?.editMode || !data.user) return undefined;
  const { isProtected, tooltip } = getProtectedFieldProps(
    data.user,
    field,
    false,
    undefined,
  );
  return isProtected ? tooltip : undefined;
};

export const lockedProps = (
  data: UserFormDialogData | undefined,
  field: string,
) => {
  const reason = getLockReason(data, field);
  return reason ? { disabled: true, description: reason } : {};
};

export const lockedSelectProps = (
  data: UserFormDialogData | undefined,
  field: string,
) => {
  const reason = getLockReason(data, field);
  return reason ? { isDisabled: true, description: reason } : {};
};
