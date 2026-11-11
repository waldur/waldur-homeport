import { XIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  marketplaceResourcesList,
  marketplaceUserOfferingConsentsRevoke,
} from 'waldur-js-client';

import {
  BaseButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ResourceNameField } from '@/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
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
      subtitle={
        <ScopeSubtitle
          label={translate('Offering name')}
          name={offering?.name}
        />
      }
      iconNode={<XIcon weight="bold" />}
      iconColor="danger"
      footer={
        <>
          <CloseDialogButton className="flex-1" />
          <BaseButton
            pending={revokeMutation.isPending}
            variant="danger"
            className="flex-1"
            onClick={() => revokeMutation.mutate()}
            label={translate('Revoke')}
            size="lg"
          />
        </>
      }
    >
      <p className="mb-3">
        {translate(
          'Are you sure you want to revoke your consent for Terms of service version {version} for {offeringName}? This action can be reversed by accepting the ToS again.',
          {
            version: tos.version || 'v1.0',
            offeringName: offering.name,
          },
        )}
      </p>
      {resourcesLoading ? (
        <div className="text-center py-3">
          <LoadingSpinner />
          <p className="text-quaternary mt-1.5">
            {translate('Loading affected resources...')}
          </p>
        </div>
      ) : (
        resources &&
        resources.length > 0 && (
          <div className="mb-3">
            <h6 className="mb-2.5">
              {translate('Resources that will be affected:')}
            </h6>
            <Card variant="table" bordered>
              <CardContent className="p-0">
                <Table className="align-middle mb-0">
                  <TableHeader>
                    <TableRow className="align-middle">
                      <TableHead>{translate('Name')}</TableHead>
                      <TableHead>{translate('Project')}</TableHead>
                      <TableHead>{translate('Category')}</TableHead>
                      <TableHead>{translate('Created')}</TableHead>
                      <TableHead>{translate('State')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource: any) => (
                      <TableRow key={resource.uuid}>
                        <TableCell>
                          <ResourceNameField row={resource} />
                        </TableCell>
                        <TableCell>
                          {renderFieldOrDash(resource.project_name)}
                        </TableCell>
                        <TableCell>{resource.category_title}</TableCell>
                        <TableCell>
                          {formatDateTime(resource.created)}
                        </TableCell>
                        <TableCell>
                          <ResourceStateField
                            resource={resource}
                            tone="outline"
                            shape="pill"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )
      )}
    </ModalDialog>
  );
};
