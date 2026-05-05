import { FC } from 'react';
import { Alert } from 'react-bootstrap';
import type { ArrowCustomerMapping } from 'waldur-js-client';

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
          <Alert variant="info" className="mb-0">
            <strong>{translate('How linking works:')}</strong>{' '}
            {translate(
              'Set the backend_id of a Waldur resource to an Arrow License Reference to enable consumption tracking. The backend_id will be used to fetch consumption data from Arrow API.',
            )}
          </Alert>

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
              <Alert variant="light">
                <strong>{translate('Manual linking:')}</strong>{' '}
                {translate(
                  'To manually link a resource, find the resource in Waldur and set its backend_id to the Arrow License Reference (e.g., XSP12345).',
                )}
              </Alert>
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
