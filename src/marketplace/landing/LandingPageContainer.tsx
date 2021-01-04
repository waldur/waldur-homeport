import React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import {
  CategoriesListType,
  OfferingsListType,
} from '@waldur/marketplace/types';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { LandingPage } from './LandingPage';
import * as actions from './store/actions';
import * as selectors from './store/selectors';

interface LandingPageContainerProps {
  getCategories: () => void;
  getOfferings: () => void;
  gotoOffering(offeringId: string): void;
  categories: CategoriesListType;
  offerings: OfferingsListType;
  customer: Customer;
}

export const LandingPageContainer: React.FC<LandingPageContainerProps> = (
  props,
) => {
  useTitle(translate('Marketplace'));
  const { getCategories, getOfferings } = props;

  React.useEffect(() => {
    getCategories();
    getOfferings();
  }, [getCategories, getOfferings]);

  return (
    <LandingPage
      {...props}
      loadOfferings={(query, prevOptions, { page }) =>
        offeringsAutocomplete(
          {
            name: query,
            allowed_customer_uuid: props.customer.uuid,
          },
          prevOptions,
          page,
        )
      }
    />
  );
};

const mapDispatchToProps = {
  getCategories: actions.categoriesFetchStart,
  getOfferings: actions.offeringsFetchStart,
  gotoOffering: actions.gotoOffering,
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  categories: selectors.getCategories(state),
  offerings: selectors.getOfferings(state),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const MarketplaceLanding = enhance(LandingPageContainer);
