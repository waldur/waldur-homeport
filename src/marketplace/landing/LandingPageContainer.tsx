import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { offeringsAutocomplete } from '@waldur/marketplace/landing/store/api';
import { CategoriesListType, OfferingsListType } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { LandingPage } from './LandingPage';
import * as actions from './store/actions';
import * as selectors from './store/selectors';

interface LandingPageContainerProps {
  getCategories: () => void;
  getOfferings: () => void;
  gotoOffering(offeringId: string): void;
  categories: CategoriesListType;
  offerings: OfferingsListType;
}

export class LandingPageContainer extends React.Component<LandingPageContainerProps & TranslateProps> {
  componentDidMount() {
    this.props.getCategories();
    this.props.getOfferings();
  }

  render() {
    return (
      <LandingPage {...this.props}
        loadOfferings={query => offeringsAutocomplete(query)}
      />
    );
  }
}

const mapDispatchToProps = dispatch => ({
  getCategories: () => dispatch(actions.categoriesFetchStart()),
  getOfferings: () => dispatch(actions.offeringsFetchStart()),
  gotoOffering: (offeringId: string) => dispatch(actions.gotoOffering(offeringId)),
});

const mapStateToProps = state => ({
  categories: selectors.getCategories(state),
  offerings: selectors.getOfferings(state),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps)
);

export default connectAngularComponent(enhance(LandingPageContainer));
