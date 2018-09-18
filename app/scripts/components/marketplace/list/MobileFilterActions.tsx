import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import './MobileFilterActions.scss';

import * as actions from './store/actions';

interface MobileFilterActionsProps {
  showAttributeFilterDialog?(): void;
}

export const PureMobileFilterActions: React.SFC<MobileFilterActionsProps> = (props: MobileFilterActionsProps & TranslateProps) => (
  <div className="mobile-filter-actions">
    <button
      type="button"
      id="attribute-filter-btn"
      className="btn btn-outline btn-info"
      onClick={props.showAttributeFilterDialog}>
      <i className="fa fa-filter"/>
      {' '}
      {props.translate('Filter')}
    </button>
  </div>
);

const mapDispatchToProps = dispatch => ({
  showAttributeFilterDialog: () => dispatch(actions.showAttributeFilter()),
});

const enhance = compose(
  withTranslation,
  connect(null, mapDispatchToProps),
);

export const MobileFilterActions = enhance(PureMobileFilterActions);
