import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceOfferingRolesList,
  marketplaceResourcesList,
  OfferingKeycloakGroup,
  offeringKeycloakGroupsRemoteGroupsList,
  offeringKeycloakGroupsSetBackendId,
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

interface RemapGroupDialogProps {
  resolve: {
    group: OfferingKeycloakGroup;
    offering_uuid: string;
    refetch(): void;
  };
}

export const RemapGroupDialog: FC<RemapGroupDialogProps> = ({ resolve }) => {
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
        marketplaceOfferingRolesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            offering_uuid: resolve.offering_uuid,
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  const scopeTypes = useMemo(() => {
    if (!roles) return [];
    return [...new Set(roles.map((r) => r.content_type).filter(Boolean))];
  }, [roles]);

  const saveMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
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
      return offeringKeycloakGroupsSetBackendId({
        path: { uuid: resolve.group.uuid },
        body,
      });
    },
    successMessage: translate('Group has been remapped.'),
    errorMessage: translate('Unable to remap group.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => saveMutation.mutateAsync(values)}
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
