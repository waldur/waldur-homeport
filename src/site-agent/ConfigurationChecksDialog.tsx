import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplaceProviderOfferingsCheckConfigurationList } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { ConfigurationFindingsTable } from '@/administration/offering-templates/OfferingTemplateFindings';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface ConfigurationChecksDialogProps {
  resolve: { offering: { uuid: string; name: string } };
}

/** What the site-agent consistency rules find in the offering as it is now. */
export const ConfigurationChecksDialog: FC<ConfigurationChecksDialogProps> = ({
  resolve: { offering },
}) => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['offering-check-configuration', offering.uuid],
    queryFn: () =>
      marketplaceProviderOfferingsCheckConfigurationList({
        path: { uuid: offering.uuid },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });
  const errors = data?.filter((finding) => finding.severity === 'error') ?? [];
  return (
    <ModalDialog
      title={translate('Configuration checks')}
      subtitle={offering.name}
      footer={
        <>
          <CloseDialogButton />
          <BaseButton
            variant="primary"
            label={translate('Check again')}
            pending={isFetching}
            onClick={() => refetch()}
            data-testid="configuration-recheck"
          />
        </>
      }
    >
      {isFetching ? (
        <LoadingSpinner />
      ) : error || !data ? (
        <LoadingErred
          message={translate('Unable to check the offering.')}
          loadData={refetch}
        />
      ) : (
        <div data-testid="configuration-checks">
          <AlertItem
            type="floating"
            variant={
              errors.length ? 'error' : data.length ? 'warning' : 'success'
            }
            title={
              errors.length
                ? translate(
                    'The site agent cannot work with the offering as it is: fix the errors below.',
                  )
                : data.length
                  ? translate(
                      'The checks found only warnings, which may be intended.',
                    )
                  : translate('The checks found nothing to fix.')
            }
            body={translate(
              "Checked against the offering's components, plans and agent configuration. A change to any of them is checked when you check again.",
            )}
          />
          {data.length ? (
            <div className="mt-4">
              <ConfigurationFindingsTable findings={data} />
            </div>
          ) : null}
        </div>
      )}
    </ModalDialog>
  );
};
