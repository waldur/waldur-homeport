import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { LandingPage } from './LandingPage';

interface LandingPageContainerState {
  items: Category[];
  loading: boolean;
  loaded: boolean;
}

export class LandingPageContainer extends React.Component<TranslateProps, LandingPageContainerState> {
  componentDidMount() {
    this.loadCategories();
  }

  async loadCategories() {
    this.setState({
      loading: true,
    });
    try {
      const categories = await getCategories();
      this.setState({
        loading: false,
        loaded: true,
        items: categories,
      });
    } catch {
      this.setState({
        loading: false,
        loaded: false,
      });
    }
  }

  render() {
    return (
      <LandingPage categories={this.state} translate={this.props.translate}/>
    );
  }
}

export default connectAngularComponent(withTranslation(LandingPageContainer));
