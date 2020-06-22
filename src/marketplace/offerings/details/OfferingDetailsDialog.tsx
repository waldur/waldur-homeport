import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOffering, getCategory } from '@waldur/marketplace/common/api';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface OfferingDetailsDialogProps {
  resolve: { offeringUuid: string };
}

async function loadData(offering_uuid: string) {
  const offering = await getOffering(offering_uuid);
  const category = await getCategory(offering.category_uuid);
  const sections = category.sections;
  const tabs = getTabs({ offering, sections });
  return {
    offering,
    tabs,
  };
}

export const OfferingDetailsDialog: React.FC<OfferingDetailsDialogProps> = (
  props,
) => {
  const { loading, error, value } = useAsync(
    () => loadData(props.resolve.offeringUuid),
    [props.resolve.offeringUuid],
  );
  return (
    <ModalDialog
      title={translate('Offering details')}
      footer={<CloseDialogButton />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <h3>{translate('Unable to load offering details.')}</h3>
      ) : (
        <>
          <h3>{value.offering.name}</h3>
          <p>
            <strong>{translate('Service provider:')}</strong>{' '}
            {value.offering.customer_name}
          </p>

          {value.offering.description && (
            <p className="bs-callout bs-callout-success">
              <FormattedHtml html={value.offering.description} />
            </p>
          )}
          <OfferingTabsComponent tabs={value.tabs} />
        </>
      )}
    </ModalDialog>
  );
};
