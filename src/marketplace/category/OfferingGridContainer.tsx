import debounce from 'lodash.debounce';
import { Component } from 'react';
import { connect } from 'react-redux';
import { reset } from 'redux-form';

import { router } from '@waldur/router';
import { RootState } from '@waldur/store/reducers';

import { OfferingGrid } from '../common/OfferingGrid';
import * as actions from '../landing/store/actions';

import { loadOfferingsStart, loadDataStart } from './store/actions';
import { MARKETPLACE_FILTER_FORM } from './store/constants';
import {
  getOfferings,
  isOfferingsLoading,
  isOfferingsLoaded,
  getFilterAttributes,
  getFilterName,
} from './store/selectors';

const mapStateToProps = (state: RootState) => ({
  items: getOfferings(state),
  loading: isOfferingsLoading(state),
  loaded: isOfferingsLoaded(state),
  filterCategory: router.globals.params.category_uuid,
  filterAttributes: getFilterAttributes(state),
  filterName: getFilterName(state),
});

const mapDispatchToProps = (dispatch) => ({
  loadCategories: () => {
    dispatch(loadDataStart());
  },
  getCategories: () => {
    dispatch(actions.categoriesFetchStart());
  },
  resetForm: () => {
    dispatch(reset(MARKETPLACE_FILTER_FORM));
  },
  loadOfferings: () => {
    dispatch(loadOfferingsStart());
  },
});

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type OfferingGridWrapperProps = StateProps & DispatchProps;

class OfferingGridWrapper extends Component<OfferingGridWrapperProps> {
  componentDidMount() {
    this.props.getCategories();
    this.props.loadCategories();
    this.loadOfferings();
  }

  loadOfferings = debounce(() => this.props.loadOfferings(), 100);

  componentDidUpdate(prevProps: OfferingGridWrapperProps) {
    if (this.props.filterCategory !== prevProps.filterCategory) {
      if (
        this.props.filterAttributes &&
        Object.keys(this.props.filterAttributes).length > 0
      ) {
        this.props.resetForm();
      }
    } else if (this.props.filterAttributes !== prevProps.filterAttributes) {
      this.loadOfferings();
    } else if (this.props.filterName !== prevProps.filterName) {
      this.loadOfferings();
    }
  }

  render() {
    return (
      <OfferingGrid
        width={4}
        items={this.props.items}
        loading={this.props.loading}
        loaded={this.props.loaded}
      />
    );
  }
}

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const OfferingGridContainer = enhance(OfferingGridWrapper);
