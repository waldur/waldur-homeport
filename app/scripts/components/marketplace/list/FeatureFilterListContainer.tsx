import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { getCategory } from '@waldur/marketplace/common/api';

import { Section } from '../types';
import { FeatureFilterList } from './FeatureFilterList';

interface FeatureFilterListContainerState {
  sections: Section[];
  loading: boolean;
  loaded: boolean;
}

class FeatureFilterListContainer extends React.Component<TranslateProps, FeatureFilterListContainerState> {
  constructor(props) {
    super(props);
    this.state = {
      sections: [],
      loading: true,
      loaded: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const category_uuid = $state.params.category_uuid;
    try {
      const category = await getCategory(category_uuid);
      this.setState({
        sections: category.sections,
        loading: false,
        loaded: true,
      });
    } catch {
      this.setState({
        sections: [],
        loading: false,
        loaded: false,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }

    if (!this.state.loaded) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load category sections.')}
        </h3>
      );
    }

    if (this.state.loaded && !this.state.sections.length) {
      return (
        <h3 className="text-center">
          {this.props.translate('There are no category sections yet.')}
        </h3>
      );
    }

    return (
      <FeatureFilterList sections={this.state.sections}/>
    );
  }
}

export default withTranslation(FeatureFilterListContainer);
