import { XIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  marketplaceResourcesList,
  marketplaceUserOfferingConsentsRevoke,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ResourceNameField } from '@/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { renderFieldOrDash } from '@/table/utils';

export const RevokeTosDialog = ({
  resolve: { tos, offering, refetch, offeringUuid },
}) => {
  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['offering-resources-for-revoke', offeringUuid],
    queryFn: () =>
      marketplaceResourcesList({
        query: { offering_uuid: [offeringUuid] },
      }).then((response) => response.data || []),
  });

  const revokeMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceUserOfferingConsentsRevoke({
        path: { uuid: tos.user_consent.uuid },
      }),
    successMessage: translate(
      'Terms of service consent has been revoked successfully.',
    ),
    errorMessage: translate('Unable to revoke Terms of service consent.'),
    refetch,
  });

  return (
    <ModalDialog
      title={translate('Revoke ToS Consent')}
      iconNode={<XIcon weight="bold" />}
      iconColor="danger"
      footer={
        <>
          <CloseDialogButton className="flex-equal" />
          <SubmitButton
            submitting={revokeMutation.isPending}
            variant="danger"
            className="flex-equal"
            onClick={() => revokeMutation.mutate()}
            type="button"
            label={translate('Revoke')}
          />
        </>
      }
    >
      <p className="mb-4">
        {translate(
          'Are you sure you want to revoke your consent for Terms of service version {version} for {offeringName}? This action can be reversed by accepting the ToS again.',
          {
            version: tos.version || 'v1.0',
            offeringName: offering.name,
          },
        )}
      </p>
      {resourcesLoading ? (
        <div className="text-center py-4">
          <LoadingSpinner />
          <p className="text-muted mt-2">
            {translate('Loading affected resources...')}
          </p>
        </div>
      ) : (
        resources &&
        resources.length > 0 && (
          <div className="mb-4">
            <h6 className="mb-3">
              {translate('Resources that will be affected:')}
            </h6>
            <div className="card card-table card-bordered">
              <div className="card-body p-0">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr className="align-middle">
                      <th>{translate('Name')}</th>
                      <th>{translate('Project')}</th>
                      <th>{translate('Category')}</th>
                      <th>{translate('Created')}</th>
                      <th>{translate('State')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((resource: any) => (
                      <tr key={resource.uuid}>
                        <td>
                          <ResourceNameField row={resource} />
                        </td>
                        <td>{renderFieldOrDash(resource.project_name)}</td>
                        <td>{resource.category_title}</td>
                        <td>{formatDateTime(resource.created)}</td>
                        <td>
                          <ResourceStateField
                            resource={resource}
                            outline
                            pill
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </ModalDialog>
  );
};
