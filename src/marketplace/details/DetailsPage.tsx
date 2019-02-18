import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { getOffering, getCategory } from '../common/api';
import { OfferingDetails } from './OfferingDetails';
import { getTabs } from './OfferingTabs';
import { updateBreadcrumbs } from './utils';

// tslint:disable-next-line: variable-name
async function loadData(offering_uuid: string) {
  const offering = await getOffering(offering_uuid);
  const category = await getCategory(offering.category_uuid);
  const sections = category.sections;
  const tabs = getTabs({offering, sections});
  updateBreadcrumbs(offering);
  return { offering, tabs };
}

const OfferingDetailsPage: React.SFC<{}> = () => (
  <Query loader={loadData} variables={$state.params.offering_uuid}>
    {({ loading, data, error }) => {
      if (loading) {
        return <LoadingSpinner/>;
      }
      if (error) {
        return <h3>{translate('Unable to load offering details.')}</h3>;
      }
      return (
        <OfferingDetails offering={data.offering} tabs={data.tabs}/>
      );
    }}
  </Query>
);

export default connectAngularComponent(OfferingDetailsPage);
