import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TranslateProps } from '@waldur/i18n';

import { ProviderUpdateForm } from './ProviderUpdateForm';
import { ProviderUpdateFormData } from './types';

interface ProviderUpdateComponentProps extends ProviderUpdateFormData, TranslateProps {
  fetchProvider: any;
  updateProvider: any;
  editable: boolean;
  defaultErrorMessage: string;
}

export class ProviderUpdateComponent extends React.Component<ProviderUpdateComponentProps> {
  componentDidMount() {
    this.props.fetchProvider();
  }

  render() {
    const { loaded, erred, editable, provider, translate } = this.props;

    if (erred) {
      return <h3>{translate('Unable to load provider.')}</h3>;
    }

    if (!loaded) {
      return <LoadingSpinner/>;
    }

    if (!editable) {
      return (
        <div className="bs-callout bs-callout-info">
          {translate('You don\'t have enough permissions to edit settings for <strong>{name}</strong> provider.', {name: provider.name})}
        </div>
      );
    }

    switch (provider.state) {
      case 'OK':
      return <ProviderUpdateForm {...this.props}/>;

      case 'Erred':
      return (
        <div>
          <div className="bs-callout bs-callout-danger">
            {provider.error_message || this.props.defaultErrorMessage}
          </div>
          <ProviderUpdateForm {...this.props}/>
        </div>
      );

      default:
      return (
        <div>
          <div className="bs-callout bs-callout-success">
            {translate('Please wait while provider is being configured.')}
          </div>
          <ProviderUpdateForm {...this.props}/>
        </div>
      );
    }
  }
}
