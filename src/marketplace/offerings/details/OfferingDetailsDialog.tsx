import * as React from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';
import { getOffering, getCategory } from '@waldur/marketplace/common/api';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

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

const OfferingDetailsDialog: React.FC<OfferingDetailsDialogProps> = props => (
  <ModalDialog
    title={translate('Offering details')}
    footer={<CloseDialogButton />}
  >
    <Query loader={loadData} variables={props.resolve.offeringUuid}>
      {({ loading, data, error }) => {
        if (loading) {
          return <LoadingSpinner />;
        }
        if (error) {
          return <h3>{translate('Unable to load offering details.')}</h3>;
        }
        return (
          <>
            <h3>{data.offering.name}</h3>
            <p>
              <strong>{translate('Service provider:')}</strong>{' '}
              {data.offering.customer_name}
            </p>

            <p>
              {data.offering.description && (
                <div className="bs-callout bs-callout-success">
                  <FormattedHtml html={data.offering.description} />
                </div>
              )}
            </p>
            <OfferingTabsComponent tabs={data.tabs} />
          </>
        );
      }}
    </Query>
  </ModalDialog>
);

export default connectAngularComponent(OfferingDetailsDialog, ['resolve']);
