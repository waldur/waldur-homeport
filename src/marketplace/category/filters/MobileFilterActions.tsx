import React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import * as actions from '../store/actions';
import { MARKETPLACE_FILTER_FORM } from '../store/constants';
import { countSelectedFilters } from '../utils';

interface MobileFilterActionsProps {
  showAttributeFilterDialog?(): void;
  filterValues?: any;
}

export const PureMobileFilterActions: React.FC<MobileFilterActionsProps> = (
  props,
) => (
  <button
    type="button"
    className="btn btn-primary btn-info"
    onClick={props.showAttributeFilterDialog}
  >
    <i className="fa fa-filter" /> {translate('Filter')}{' '}
    {props.filterValues && `(${countSelectedFilters(props.filterValues)})`}
  </button>
);

const mapDispatchToProps = (dispatch) => ({
  showAttributeFilterDialog: () => dispatch(actions.showAttributeFilter()),
});

const mapStateToProps = (state: RootState) => ({
  filterValues: getFormValues(MARKETPLACE_FILTER_FORM)(state),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const MobileFilterActions = enhance(PureMobileFilterActions);
