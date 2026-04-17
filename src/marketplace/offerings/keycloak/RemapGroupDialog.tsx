import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOfferingUserRolesList,
  marketplaceResourcesList,
  OfferingKeycloakGroup,
  offeringKeycloakGroupsRemoteGroupsList,
  offeringKeycloakGroupsSetBackendId,
  RemoteGroup,
  Resource,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { SHORT_STALE_TIME, UI_STALE_TIME } from '@waldur/core/constants';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import { SelectField, StringField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

interface RemapGroupDialogProps {
  resolve: {
    group: OfferingKeycloakGroup;
    offering_uuid: string;
    refetch(): void;
  };
}

export const RemapGroupDialog: FC<RemapGroupDialogProps> = ({ resolve }) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const {
    data: remoteGroups,
    isLoading: isLoadingRemote,
    error: errorRemote,
    refetch: refetchRemote,
  } = useQuery({
    queryKey: ['KeycloakRemoteGroups', resolve.offering_uuid],
    queryFn: async () => {
      const response = await offeringKeycloakGroupsRemoteGroupsList({
        query: { offering_uuid: resolve.offering_uuid, page_size: 100 },
      });
      return (
        Array.isArray(response.data) ? response.data : []
      ) as RemoteGroup[];
    },
    staleTime: SHORT_STALE_TIME,
  });

  const {
    data: resources,
    isLoading: isLoadingResources,
    error: errorResources,
    refetch: refetchResources,
  } = useQuery({
    queryKey: ['OfferingResources', resolve.offering_uuid],
    queryFn: () =>
      getAllPages((page) =>
        marketplaceResourcesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            offering_uuid: [resolve.offering_uuid],
            field: ['uuid', 'name', 'project_name', 'state'],
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  const { data: roles } = useQuery({
    queryKey: ['OfferingRoles', resolve.offering_uuid],
    queryFn: () =>
      getAllPages((page) =>
        marketplaceOfferingUserRolesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            offering_uuid: [resolve.offering_uuid],
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  const scopeTypes = useMemo(() => {
    if (!roles) return [];
    return [...new Set(roles.map((r) => r.scope_type).filter(Boolean))];
  }, [roles]);

  const save = useCallback(
    async (formData) => {
      try {
        const body: {
          backend_id: string;
          resource_uuid?: string | null;
          scope_id?: string | null;
        } = {
          backend_id: formData.remote_group.id,
        };
        if (formData.resource) {
          body.resource_uuid = formData.resource.uuid;
        } else if (resolve.group.resource) {
          body.resource_uuid = null;
        }
        if (formData.scope_id) {
          body.scope_id = formData.scope_id;
        }
        await offeringKeycloakGroupsSetBackendId({
          path: { uuid: resolve.group.uuid },
          body,
        });
        showSuccess(translate('Group has been remapped.'));
        await resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(error, translate('Unable to remap group.'));
      }
    },
    [resolve, showSuccess, showErrorResponse, closeDialog],
  );

  return (
    <Form
      onSubmit={save}
      initialValues={{
        resource: resolve.group.resource_uuid
          ? resources?.find((r) => r.uuid === resolve.group.resource_uuid)
          : undefined,
      }}
      keepDirtyOnReinitialize
    >
      {({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Remap group')}
            subtitle={translate('Link "{name}" to a different remote group', {
              name: resolve.group.name,
            })}
            footer={
              <>
                <CloseDialogButton className="w-175px" />
                <SubmitButton
                  label={translate('Remap')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary w-175px"
                />
              </>
            }
            iconNode={<ArrowsClockwiseIcon weight="bold" />}
            iconColor="warning"
          >
            {resolve.group.backend_id && (
              <p className="text-muted mb-4">
                {translate('Current backend ID: {id}', {
                  id: resolve.group.backend_id,
                })}
              </p>
            )}

            {errorRemote && (
              <LoadingErred
                loadData={refetchRemote}
                message={translate('Unable to load remote groups')}
              />
            )}
            <FormGroup label={translate('Remote group')} required>
              <Field
                name="remote_group"
                validate={required}
                component={SelectField as any}
                isLoading={isLoadingRemote}
                options={remoteGroups || []}
                getOptionValue={(opt: RemoteGroup) => opt.id}
                getOptionLabel={(opt: RemoteGroup) =>
                  opt.path ? `${opt.name} (${opt.path})` : opt.name
                }
              />
            </FormGroup>

            {errorResources && (
              <LoadingErred
                loadData={refetchResources}
                message={translate('Unable to load resources')}
              />
            )}
            <FormGroup label={translate('Resource')}>
              <Field
                name="resource"
                component={SelectField as any}
                isLoading={isLoadingResources}
                options={resources || []}
                getOptionValue={(opt: Resource) => opt.uuid}
                getOptionLabel={(opt: Resource) =>
                  opt.project_name
                    ? `${opt.name} (${opt.project_name})`
                    : opt.name
                }
                isClearable
              />
            </FormGroup>

            {scopeTypes.length > 0 && values?.role?.scope_type && (
              <FormGroup
                label={translate('Scope ID')}
                description={translate(
                  'Sub-entity UUID within a resource, e.g. Rancher Project UUID within a Cluster.',
                )}
                spaceless
              >
                <Field
                  name="scope_id"
                  component={StringField as any}
                  placeholder={translate('Sub-entity UUID')}
                />
              </FormGroup>
            )}
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
