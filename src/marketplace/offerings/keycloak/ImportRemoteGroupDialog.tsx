import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOfferingRolesList,
  marketplaceResourcesList,
  offeringKeycloakGroupsImportRemote,
  offeringKeycloakGroupsRemoteGroupsList,
  OfferingRole,
  PublicOfferingDetails,
  RemoteGroup,
  Resource,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { SHORT_STALE_TIME, UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { required } from '@/core/validators';
import { SelectField, StringField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ImportRemoteGroupDialogProps {
  resolve: {
    offering: PublicOfferingDetails;
    refetch(): void;
  };
}

export const ImportRemoteGroupDialog: FC<ImportRemoteGroupDialogProps> = ({
  resolve,
}) => {
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
        marketplaceOfferingRolesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            offering_uuid: resolve.offering.uuid,
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  const scopeTypes = useMemo(() => {
    if (!roles) return [];
    return [...new Set(roles.map((r) => r.content_type).filter(Boolean))];
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

  const saveMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
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
      return offeringKeycloakGroupsImportRemote({ body });
    },
    successMessage: translate('Remote group has been imported.'),
    errorMessage: translate('Unable to import remote group.'),
    refetch: resolve.refetch,
  });

  return (
    <Form onSubmit={(values) => saveMutation.mutateAsync(values)}>
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
                getOptionValue={(opt: OfferingRole) => opt.uuid}
                getOptionLabel={(opt: OfferingRole) =>
                  opt.content_type
                    ? `${opt.name} (${opt.content_type})`
                    : opt.name
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

            {scopeTypes.length > 0 && values?.role?.content_type && (
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
