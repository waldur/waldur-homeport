import { FC } from 'react';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { ActionButton } from '@/table/ActionButton';

import { useDiscoverLicenses } from '../api';

import { ArrowLicensesList } from './ArrowLicensesList';
import { SuggestedMatches } from './SuggestedMatches';
import { WaldurResourcesList } from './WaldurResourcesList';

interface LinkResourcesDialogProps {
  resolve: {
    mapping: ArrowCustomerMapping;
  };
}

export const LinkResourcesDialog: FC<LinkResourcesDialogProps> = ({
  resolve,
}) => {
  const { mapping } = resolve;
  const { closeDialog } = useModal();

  const { data, isLoading, error, refetch } = useDiscoverLicenses(mapping.uuid);

  return (
    <ModalDialog
      title={translate('Link Resources to Arrow Licenses')}
      subtitle={mapping.arrow_company_name}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Failed to load license data')}
          loadData={refetch}
        />
      ) : data ? (
        <div className="d-flex flex-column gap-6">
          {/* Explanation */}
          <AlertItem
            type="floating"
            variant="info"
            className="mb-0"
            title={translate('How linking works:')}
            body={translate(
              'Set the backend_id of a Waldur resource to an Arrow License Reference to enable consumption tracking. The backend_id will be used to fetch consumption data from Arrow API.',
            )}
          />

          <SuggestedMatches
            mappingUuid={mapping.uuid}
            suggestions={data.suggestions}
          />

          <ArrowLicensesList licenses={data.arrow_licenses} />

          <WaldurResourcesList resources={data.waldur_resources} />

          {/* Manual linking form hint */}
          {data.waldur_resources &&
            data.waldur_resources.length > 0 &&
            data.arrow_licenses &&
            data.arrow_licenses.length > 0 && (
              <AlertItem
                type="floating"
                variant="info"
                title={translate('Manual linking:')}
                body={translate(
                  'To manually link a resource, find the resource in Waldur and set its backend_id to the Arrow License Reference (e.g., XSP12345).',
                )}
              />
            )}

          {/* Close button */}
          <div className="d-flex justify-content-end">
            <ActionButton
              action={closeDialog}
              variant="secondary"
              title={translate('Close')}
            />
          </div>
        </div>
      ) : null}
    </ModalDialog>
  );
};
