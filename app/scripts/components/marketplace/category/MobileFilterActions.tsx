import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import * as actions from './store/actions';
import { MARKETPLACE_FILTER_FORM } from './store/constants';
import { countSelectedFilters } from './utils';

interface MobileFilterActionsProps {
  showAttributeFilterDialog?(): void;
  filterValues?: any;
}

export const PureMobileFilterActions: React.SFC<MobileFilterActionsProps> = (props: MobileFilterActionsProps & TranslateProps) => (
  <button
    type="button"
    className="btn btn-primary btn-info"
    onClick={props.showAttributeFilterDialog}>
    <i className="fa fa-filter"/>
    {' '}
    {props.translate('Filter')}
    {' '}
    {props.filterValues && `(${countSelectedFilters(props.filterValues)})`}
  </button>
);

const mapDispatchToProps = dispatch => ({
  showAttributeFilterDialog: () => dispatch(actions.showAttributeFilter()),
});

const mapStateToProps = state => ({
  filterValues: getFormValues(MARKETPLACE_FILTER_FORM)(state),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
);

export const MobileFilterActions = enhance(PureMobileFilterActions);
