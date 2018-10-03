import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { withTranslation, TranslateProps } from '@waldur/i18n';

import { Section } from '../../types';
import * as actions from '../store/actions';
import * as selectors from '../store/selectors';
import { AttributeFilterList } from './AttributeFilterList';

interface AttributeFilterListContainerState extends TranslateProps {
  sections: Section[];
  loading: boolean;
  loaded: boolean;
  loadData(): void;
}

class AttributeFilterListContainer extends React.Component<AttributeFilterListContainerState> {
  componentDidMount() {
    this.props.loadData();
  }

  render() {
    if (this.props.loading) {
      return <LoadingSpinner/>;
    }

    if (!this.props.loaded) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load category sections.')}
        </h3>
      );
    }

    if (this.props.loaded && !this.props.sections.length) {
      return (
        <h3 className="text-center">
          {this.props.translate('There are no category sections yet.')}
        </h3>
      );
    }

    return (
      <AttributeFilterList sections={this.props.sections}/>
    );
  }
}

const connector = connect(state => ({
  loading: selectors.isLoading(state),
  loaded: selectors.isLoaded(state),
  erred: selectors.isErred(state),
  sections: selectors.getSections(state),
}), dispatch => ({
  loadData: () => dispatch(actions.loadDataStart($state.params.category_uuid)),
}));

const enhance = compose(connector, withTranslation);

export default enhance(AttributeFilterListContainer);
