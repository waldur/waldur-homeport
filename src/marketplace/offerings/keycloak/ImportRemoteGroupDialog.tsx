import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOfferingUserRolesList,
  marketplaceResourcesList,
  offeringKeycloakGroupsImportRemote,
  offeringKeycloakGroupsRemoteGroupsList,
  OfferingUserRole,
  PublicOfferingDetails,
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

interface ImportRemoteGroupDialogProps {
  resolve: {
    offering: PublicOfferingDetails;
    refetch(): void;
  };
}

export const ImportRemoteGroupDialog: FC<ImportRemoteGroupDialogProps> = ({
  resolve,
}) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const {
    data: remoteGroups,
    isLoading: isLoadingRemote,
    error: errorRemote,
    refetch: refetchRemote,
  } = useQuery({
    queryKey: ['KeycloakRemoteGroups', resolve.offering.uuid],
    queryFn: async () => {
      const response = await offeringKeycloakGroupsRemoteGroupsList({
        query: { offering_uuid: resolve.offering.uuid, page_size: 100 },
      });
      return (
        Array.isArray(response.data) ? response.data : []
      ) as RemoteGroup[];
    },
    staleTime: SHORT_STALE_TIME,
  });

  const {
    data: roles,
    isLoading: isLoadingRoles,
    error: errorRoles,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ['OfferingRoles', resolve.offering.uuid],
    queryFn: () =>
      getAllPages((page) =>
        marketplaceOfferingUserRolesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            offering_uuid: [resolve.offering.uuid],
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  const scopeTypes = useMemo(() => {
    if (!roles) return [];
    return [...new Set(roles.map((r) => r.scope_type).filter(Boolean))];
  }, [roles]);

  const {
    data: resources,
    isLoading: isLoadingResources,
    error: errorResources,
    refetch: refetchResources,
  } = useQuery({
    queryKey: ['OfferingResources', resolve.offering.uuid],
    queryFn: () =>
      getAllPages((page) =>
        marketplaceResourcesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            offering_uuid: [resolve.offering.uuid],
            field: ['uuid', 'name', 'project_name', 'state'],
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  const save = useCallback(
    async (formData) => {
      try {
        const body: {
          offering_uuid: string;
          role_uuid: string;
          remote_group_id: string;
          resource_uuid?: string;
          scope_id?: string;
        } = {
          offering_uuid: resolve.offering.uuid,
          role_uuid: formData.role.uuid,
          remote_group_id: formData.remote_group.id,
        };
        if (formData.resource) {
          body.resource_uuid = formData.resource.uuid;
        }
        if (formData.scope_id) {
          body.scope_id = formData.scope_id;
        }
        await offeringKeycloakGroupsImportRemote({ body });
        showSuccess(translate('Remote group has been imported.'));
        await resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(error, translate('Unable to import remote group.'));
      }
    },
    [resolve, showSuccess, showErrorResponse, closeDialog],
  );

  return (
    <Form onSubmit={save}>
      {({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Import remote group')}
            subtitle={translate(
              'Link an existing Keycloak group to a local role',
            )}
            footer={
              <>
                <CloseDialogButton className="w-175px" />
                <SubmitButton
                  label={translate('Import')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary w-175px"
                />
              </>
            }
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
          >
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

            {errorRoles && (
              <LoadingErred
                loadData={refetchRoles}
                message={translate('Unable to load roles')}
              />
            )}
            <FormGroup label={translate('Role')} required>
              <Field
                name="role"
                validate={required}
                component={SelectField as any}
                isLoading={isLoadingRoles}
                options={roles || []}
                getOptionValue={(opt: OfferingUserRole) => opt.uuid}
                getOptionLabel={(opt: OfferingUserRole) =>
                  opt.scope_type ? `${opt.name} (${opt.scope_type})` : opt.name
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
