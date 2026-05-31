import { get } from 'lodash-es';
import { FC, ReactNode, useMemo } from 'react';

import { CheckOrX } from '@/core/CheckOrX';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { StaffOnlyIndicator } from '@/core/StaffOnlyIndicator';
import { isFeatureVisible } from '@/features/connect';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { FieldEditButton } from '@/marketplace/offerings/update/integration/FieldEditButton';
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
  className = 'card-bordered mb-7',
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
      <FormTable.Card title={title} className={className}>
        <LoadingSpinner />
      </FormTable.Card>
    );
  }

  if (error) {
    return (
      <FormTable.Card title={title} className={className}>
        <LoadingErred
          message={translate('Unable to load user attribute configuration.')}
          loadData={refetch}
        />
      </FormTable.Card>
    );
  }

  return (
    <FormTable.Card title={title} className={className}>
      {emptyHint}
      <FormTable>
        {visibleFields.map((field) => (
          <FormTable.Item
            key={field.key}
            label={field.label}
            description={field.description}
            value={<CheckOrX value={get(config, field.key)} />}
            actions={
              canEdit ? (
                <>
                  {editGate === 'staff' && <StaffOnlyIndicator />}
                  <FieldEditButton
                    title={field.label}
                    scope={config}
                    name={field.key}
                    callback={update}
                    fieldComponent={AwesomeCheckboxField}
                    hideLabel={field.hideLabel}
                  />
                </>
              ) : null
            }
          />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
