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
        <div className="empty-list-message">
          {translate('You don\'t have enough permissions to edit settings for <strong>{name}</strong> provider.', {name: provider.name})}
        </div>
      );
    }

    if (provider.state === 'PROCESSING') {
      return (
        <div className="success-message">
          {translate('Please wait while provider is being configured.')}
        </div>
      );
    }

    if (provider.state === 'Erred') {
      return (
        <div className="error-message">
          {provider.error_message || this.props.defaultErrorMessage}
        </div>
      );
    }

    return <ProviderUpdateForm {...this.props}/>;
  }
}
