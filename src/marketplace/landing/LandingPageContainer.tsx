import * as React from 'react';
import { connect } from 'react-redux';

import { offeringsAutocomplete } from '@waldur/marketplace/common/autocompletes';
import {
  CategoriesListType,
  OfferingsListType,
} from '@waldur/marketplace/types';
import { withStore } from '@waldur/store/connect';
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

export class LandingPageContainer extends React.Component<
  LandingPageContainerProps
> {
  componentDidMount() {
    this.props.getCategories();
    this.props.getOfferings();
  }

  render() {
    return (
      <LandingPage
        {...this.props}
        loadOfferings={query =>
          offeringsAutocomplete({
            name: query,
            allowed_customer_uuid: this.props.customer.uuid,
          })
        }
      />
    );
  }
}

const mapDispatchToProps = {
  getCategories: actions.categoriesFetchStart,
  getOfferings: actions.offeringsFetchStart,
  gotoOffering: actions.gotoOffering,
};

const mapStateToProps = state => ({
  customer: getCustomer(state),
  categories: selectors.getCategories(state),
  offerings: selectors.getOfferings(state),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const MarketplaceLanding = withStore(enhance(LandingPageContainer));
