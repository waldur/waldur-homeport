import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, FC, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  AttributeSourceDetail,
  IdentityBridgeUserStatus,
  User,
  usersIdentityBridgeStatusRetrieve,
  usersPartialUpdate,
} from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Badge } from '@waldur/core/Badge';
import { SHORT_STALE_TIME } from '@waldur/core/constants';
import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SubmitButton } from '@waldur/form';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import FormTable from '@waldur/form/FormTable';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

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
    <span className="d-inline-flex align-items-center gap-2">
      <span
        className={`rounded-circle ${color}`}
        style={{ width: 8, height: 8, display: 'inline-block' }}
      />
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
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { showSuccess, showErrorResponse } = useNotify();

  const initialValues = {
    managed_isds: resolve.managedIsds?.join(', ') || '',
  };

  const processRequest = useCallback(
    async (values: { managed_isds: string }) => {
      const raw = values.managed_isds.trim();
      const isds = raw
        ? raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => (s.startsWith('isd:') ? s : `isd:${s}`))
        : [];
      try {
        await usersPartialUpdate({
          path: { uuid: resolve.user.uuid },
          body: { managed_isds: isds } as any,
        });
        resolve.onUpdated(isds);
        showSuccess(translate('Managed ISDs have been updated.'));
        await queryClient.invalidateQueries({
          queryKey: ['user-identity-bridge-status', resolve.user.uuid],
        });
        dispatch(closeModalDialog());
      } catch (error) {
        showErrorResponse(error, translate('Unable to update managed ISDs.'));
      }
    },
    [resolve.user.uuid, dispatch, queryClient, showSuccess, showErrorResponse],
  );

  return (
    <Form
      onSubmit={processRequest}
      initialValues={initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            headerLess
            footer={
              <>
                <CloseDialogButton variant="tertiary" className="flex-equal" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <FormGroup
              label={translate('Managed ISDs')}
              description={translate(
                'Comma-separated list of ISDs, e.g. isd:puhuri, isd:fenix',
              )}
            >
              <Field
                name="managed_isds"
                component={StringField as any}
                placeholder="e.g. isd:puhuri, isd:fenix"
                spaceless
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};

const IdentityManagerSettings: FC<{ user: User }> = ({ user }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { showSuccess, showErrorResponse } = useNotify();
  const [toggling, setToggling] = useState(false);
  const [isManager, setIsManager] = useState(Boolean(user.is_identity_manager));
  const [managedIsds, setManagedIsds] = useState<string[]>(
    (user.managed_isds as string[]) || [],
  );

  const toggleIdentityManager = async (checked: boolean) => {
    setToggling(true);
    try {
      const body: any = { is_identity_manager: checked };
      if (!checked) {
        body.managed_isds = [];
      }
      await usersPartialUpdate({
        path: { uuid: user.uuid },
        body,
      });
      setIsManager(checked);
      if (!checked) {
        setManagedIsds([]);
      }
      showSuccess(translate('User has been updated.'));
      await queryClient.invalidateQueries({
        queryKey: ['user-identity-bridge-status', user.uuid],
      });
    } catch (error) {
      showErrorResponse(error, translate('Unable to update user.'));
    } finally {
      setToggling(false);
    }
  };

  const openEditIsdsDialog = () => {
    dispatch(
      openModalDialog(EditManagedIsdsDialog, {
        resolve: { user, managedIsds, onUpdated: setManagedIsds },
        size: 'sm',
      }),
    );
  };

  return (
    <FormTable detailsMode className="gy-5">
      <FormTable.Item
        label={translate('Identity manager')}
        value={
          <AwesomeCheckbox
            value={isManager}
            onChange={toggleIdentityManager}
            label={isManager ? translate('Enabled') : translate('Disabled')}
            disabled={toggling}
          />
        }
      />
      {isManager && (
        <FormTable.Item
          label={translate('Managed ISDs')}
          value={<IsdBadges isds={managedIsds} />}
          actions={<CompactEditButton onClick={openEditIsdsDialog} />}
        />
      )}
    </FormTable>
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
      }).then((res) => res.data as IdentityBridgeUserStatus),
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
    <div className="d-flex flex-column gap-6">
      {/* Section: Identity Manager Settings */}
      <div>
        <h5 className="mb-4">{translate('Identity manager settings')}</h5>
        <IdentityManagerSettings user={user} />
      </div>

      {/* Section A: Status Summary */}
      <FormTable hideActions detailsMode className="gy-5">
        <FormTable.Item
          label={translate('Federation status')}
          value={
            status.is_federated ? (
              <Badge variant="success" pill outline>
                {translate('Federated')}
              </Badge>
            ) : (
              <Badge variant="secondary" pill outline>
                {translate('Local')}
              </Badge>
            )
          }
        />
        <FormTable.Item
          label={translate('Connected ISDs')}
          value={<IsdBadges isds={status.active_isds} />}
        />
        {status.managed_isds?.length > 0 && (
          <FormTable.Item
            label={translate('Managed ISDs')}
            value={<IsdBadges isds={status.managed_isds} />}
          />
        )}
      </FormTable>

      {/* Section B: Attribute Provenance Table */}
      {attributeEntries.length > 0 && (
        <div>
          <h5 className="mb-4">{translate('Attribute provenance')}</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>{translate('Attribute')}</th>
                  <th>{translate('Source')}</th>
                  <th>{translate('Last updated')}</th>
                  <th>{translate('Freshness')}</th>
                </tr>
              </thead>
              <tbody>
                {attributeEntries.map(([attr, info]) => {
                  const isStale =
                    status.stale_attributes?.includes(attr) || info.is_stale;
                  return (
                    <tr
                      key={attr}
                      className={isStale ? 'table-warning' : undefined}
                    >
                      <td>{attr}</td>
                      <td>
                        <Badge variant="primary" size="sm" pill outline>
                          {formatIsdName(info.source)}
                        </Badge>
                      </td>
                      <td>
                        {info.timestamp
                          ? formatDateTime(info.timestamp)
                          : DASH_ESCAPE_CODE}
                      </td>
                      <td>
                        <FreshnessDot ageDays={info.age_days} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section C: Effective Bridge Fields */}
      {status.effective_bridge_fields?.length > 0 && (
        <div>
          <h5 className="mb-4">{translate('Effective bridge fields')}</h5>
          <p className="text-muted mb-3">
            {translate('These fields can be synced via the Identity Bridge.')}
          </p>
          <div className="d-flex flex-wrap gap-2">
            {status.effective_bridge_fields.map((field) => (
              <Badge key={field} variant="secondary" pill outline>
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
