import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Form } from 'react-final-form';
import {
  AttributeSourceDetail,
  User,
  usersIdentityBridgeStatusRetrieve,
  usersPartialUpdate,
} from 'waldur-js-client';

import {
  Badge,
  PropertyItem,
  PropertyList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { SHORT_STALE_TIME } from '@/core/constants';
import { formatDateTime } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton, StringGroup } from '@/form';
import { CompactEditButton } from '@/form/CompactEditButton';
import { BooleanEditField, EditFieldProvider } from '@/form/editFields';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { propVal } from '@/property/propertyFields';
import { ROW_SECTIONS_CLASS, RowSection } from '@/proposals/ExpandableRowParts';
import { DASH_ESCAPE_CODE, ROW_VARIANT_CLASSES } from '@/table/constants';

import { formatIsdName, IsdBadges } from './IsdBadges';

const FreshnessDot: FC<{ ageDays: number }> = ({ ageDays }) => {
  let color: string;
  let label: string;
  if (ageDays < 7) {
    color = 'bg-success';
    label = translate('Fresh');
  } else if (ageDays < 14) {
    color = 'bg-warning';
    label = translate('Aging');
  } else {
    color = 'bg-danger';
    label = translate('Stale');
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block size-2 rounded-full ${color}`} />
      {label}
    </span>
  );
};

interface EditManagedIsdsDialogProps {
  resolve: {
    user: User;
    managedIsds: string[];
    onUpdated: (isds: string[]) => void;
  };
}

const EditManagedIsdsDialog: FC<EditManagedIsdsDialogProps> = ({ resolve }) => {
  const queryClient = useQueryClient();

  const initialValues = {
    managed_isds: resolve.managedIsds?.join(', ') || '',
  };

  const updateMutation = useManagedMutation<any, any, { managed_isds: string }>(
    {
      mutationFn: async (values) => {
        const raw = values.managed_isds.trim();
        const isds = raw
          ? raw
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => (s.startsWith('isd:') ? s : `isd:${s}`))
          : [];
        await usersPartialUpdate({
          path: { uuid: resolve.user.uuid },
          body: { managed_isds: isds },
        });
        return isds;
      },
      successMessage: translate('Managed ISDs have been updated.'),
      errorMessage: translate('Unable to update managed ISDs.'),
      onSuccess: async (isds) => {
        resolve.onUpdated(isds);
        await queryClient.invalidateQueries({
          queryKey: ['user-identity-bridge-status', resolve.user.uuid],
        });
      },
    },
  );

  return (
    <Form<{ managed_isds: string }>
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            headerLess
            footer={
              <>
                <CloseDialogButton variant="tertiary" className="flex-1" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                  variant="primary"
                  className="flex-1"
                />
              </>
            }
          >
            <StringGroup
              name="managed_isds"
              placeholder="e.g. isd:puhuri, isd:fenix"
              spaceless
              label={translate('Managed ISDs')}
              description={translate(
                'Comma-separated list of ISDs, e.g. isd:puhuri, isd:fenix',
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};

const IdentityManagerSettings: FC<{ user: User }> = ({ user }) => {
  const { openDialog } = useModal();
  const queryClient = useQueryClient();
  const [isManager, setIsManager] = useState(Boolean(user.is_identity_manager));
  const [managedIsds, setManagedIsds] = useState<string[]>(
    (user.managed_isds as string[]) || [],
  );

  const toggleMutation = useManagedMutation<any, any, boolean>({
    mutationFn: async (checked) => {
      const body: any = { is_identity_manager: checked };
      if (!checked) {
        body.managed_isds = [];
      }
      await usersPartialUpdate({
        path: { uuid: user.uuid },
        body,
      });
      return checked;
    },
    successMessage: translate('User has been updated.'),
    errorMessage: translate('Unable to update user.'),
    onSuccess: async (checked) => {
      setIsManager(checked);
      if (!checked) {
        setManagedIsds([]);
      }
      await queryClient.invalidateQueries({
        queryKey: ['user-identity-bridge-status', user.uuid],
      });
    },
  });

  const openEditIsdsDialog = () => {
    openDialog(EditManagedIsdsDialog, {
      resolve: { user, managedIsds, onUpdated: setManagedIsds },
      size: 'sm',
    });
  };

  return (
    <PropertyList detailsMode termWidth="md" className="gap-x-6">
      <EditFieldProvider
        scope={{ is_identity_manager: isManager }}
        callback={(values) =>
          toggleMutation.mutateAsync(Boolean(values.is_identity_manager))
        }
      >
        <BooleanEditField
          name="is_identity_manager"
          label={translate('Identity manager')}
          renderValue={(value) =>
            propVal.boolean(Boolean(value), { display: 'badge' })?.node
          }
        />
      </EditFieldProvider>
      {isManager && (
        <PropertyItem
          label={translate('Managed ISDs')}
          value={<IsdBadges isds={managedIsds} />}
          actions={
            <CompactEditButton
              variant="secondary"
              onClick={openEditIsdsDialog}
              fieldName={translate('Managed ISDs')}
            />
          }
        />
      )}
    </PropertyList>
  );
};

export const UserIdentityBridgeTab: FC<{ user: User }> = ({ user }) => {
  const {
    data: status,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-identity-bridge-status', user.uuid],
    queryFn: () =>
      usersIdentityBridgeStatusRetrieve({
        path: { uuid: user.uuid },
      }).then((res) => res.data),
    staleTime: SHORT_STALE_TIME,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <LoadingErred
        message={translate('Unable to load identity bridge status.')}
        loadData={refetch}
      />
    );
  if (!status) return null;

  const attributeSources = (status.attribute_sources || {}) as Record<
    string,
    AttributeSourceDetail
  >;
  const attributeEntries = Object.entries(attributeSources);

  return (
    <div className={ROW_SECTIONS_CLASS}>
      <RowSection title={translate('Identity manager settings')}>
        <IdentityManagerSettings user={user} />
      </RowSection>

      <RowSection title={translate('Status')}>
        <PropertyList variant="summary" space={1.5}>
          <PropertyItem
            label={translate('Federation status')}
            value={propVal.boolean(status.is_federated, {
              wording: [translate('Federated'), translate('Local')],
              display: 'badge',
            })}
          />
          <PropertyItem
            label={translate('Connected ISDs')}
            value={<IsdBadges isds={status.active_isds} />}
          />
          {status.managed_isds?.length > 0 && (
            <PropertyItem
              label={translate('Managed ISDs')}
              value={<IsdBadges isds={status.managed_isds} />}
            />
          )}
          <PropertyItem
            label={translate('Effective bridge fields')}
            value={propVal.list(status.effective_bridge_fields, {
              display: 'badges',
            })}
          />
        </PropertyList>
      </RowSection>

      {/* Section B: Attribute Provenance Table */}
      {attributeEntries.length > 0 && (
        <RowSection title={translate('Attribute provenance')}>
          <Table className="align-middle">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Attribute')}</TableHead>
                <TableHead>{translate('Source')}</TableHead>
                <TableHead>{translate('Last updated')}</TableHead>
                <TableHead>{translate('Freshness')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributeEntries.map(([attr, info]) => {
                const isStale =
                  status.stale_attributes?.includes(attr) || info.is_stale;
                return (
                  <TableRow
                    key={attr}
                    className={
                      isStale ? ROW_VARIANT_CLASSES.warning : undefined
                    }
                  >
                    <TableCell>{attr}</TableCell>
                    <TableCell>
                      <Badge
                        variant="primary"
                        size="sm"
                        shape="pill"
                        tone="outline"
                      >
                        {formatIsdName(info.source)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {info.timestamp
                        ? formatDateTime(info.timestamp)
                        : DASH_ESCAPE_CODE}
                    </TableCell>
                    <TableCell>
                      <FreshnessDot ageDays={info.age_days} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </RowSection>
      )}
    </div>
  );
};
