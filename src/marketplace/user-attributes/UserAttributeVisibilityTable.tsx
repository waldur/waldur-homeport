import { get } from 'es-toolkit/compat';
import { FC, ReactNode, useMemo } from 'react';

import { PropertyCard, PropertyList, PropertyItem } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StaffOnlyIndicator } from '@/core/StaffOnlyIndicator';
import { isFeatureVisible } from '@/features/connect';
import { FieldEditButton } from '@/form/FieldEditButton';
import { SwitchField } from '@/form/SwitchField';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { isProfileAttributeEnabled } from '@/user/support/profileAttributes';
import { useUser } from '@/workspace/hooks';

import { ALL_ATTRIBUTE_FIELDS } from './fields';

interface UserAttributeVisibilityTableProps {
  title: ReactNode;
  config: Record<string, boolean | undefined> | null | undefined;
  update: (formData: Record<string, boolean>) => Promise<any>;
  isLoading?: boolean;
  error?: unknown;
  refetch?: () => void;
  emptyHint?: ReactNode;
  className?: string;
  // 'staff'  – show edit pencil to staff only (default; for offerings)
  // 'always' – show edit pencil to anyone (call configuration is gated upstream)
  editGate?: 'staff' | 'always';
  disabled?: boolean;
}

export const UserAttributeVisibilityTable: FC<
  UserAttributeVisibilityTableProps
> = ({
  title,
  config,
  update,
  isLoading,
  error,
  refetch,
  emptyHint,
  className = 'mb-5.5',
  editGate = 'staff',
  disabled = false,
}) => {
  const user = useUser();
  const canEdit =
    !disabled && (editGate === 'always' || Boolean(user?.is_staff));

  const visibleFields = useMemo(
    () =>
      ALL_ATTRIBUTE_FIELDS.filter(
        (field) =>
          (!field.attribute || isProfileAttributeEnabled(field.attribute)) &&
          (!field.featureFlag || isFeatureVisible(field.featureFlag)),
      ),
    [],
  );

  if (isLoading) {
    return (
      <PropertyCard bordered title={title} className={className}>
        <LoadingSpinner />
      </PropertyCard>
    );
  }

  if (error) {
    return (
      <PropertyCard bordered title={title} className={className}>
        <LoadingErred
          message={translate('Unable to load user attribute configuration.')}
          loadData={refetch}
        />
      </PropertyCard>
    );
  }

  return (
    <PropertyCard bordered title={title} className={className}>
      {emptyHint}
      <PropertyList>
        {visibleFields.map((field) => (
          <PropertyItem
            key={field.key}
            label={field.label}
            description={field.description}
            value={propVal.boolean(get(config, field.key), {
              wording: 'enabled',
            })}
            actions={
              canEdit ? (
                <>
                  {editGate === 'staff' && <StaffOnlyIndicator />}
                  <FieldEditButton
                    title={field.label}
                    scope={config}
                    name={field.key}
                    callback={update}
                    fieldComponent={SwitchField}
                    hideLabel={field.hideLabel}
                  />
                </>
              ) : null
            }
          />
        ))}
      </PropertyList>
    </PropertyCard>
  );
};
