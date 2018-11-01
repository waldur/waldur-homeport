import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { dateTime } from '@waldur/core/utils';
import { TranslateProps } from '@waldur/i18n';
import { ServiceProvider } from '@waldur/marketplace/types';
import ActionButton from '@waldur/table-react/ActionButton';

interface ServiceProviderRegisterButtonProps extends TranslateProps {
  registering: boolean;
  loading: boolean;
  serviceProvider: ServiceProvider;
  canRegisterServiceProvider: boolean;
  registerServiceProvider?(): void;
}

const renderButton = (props: ServiceProviderRegisterButtonProps) => {
  if (props.loading) {
    return <LoadingSpinner/>;
  } else if (props.serviceProvider) {
    return `${props.translate('Registered at:')} ${dateTime(props.serviceProvider.created)}`;
  } else if (props.canRegisterServiceProvider) {
    return (
      <ActionButton
        title={props.translate('Register as service provider')}
        action={props.registerServiceProvider}
        className="btn btn-primary"
        icon={props.registering ? 'fa fa-spinner fa-spin' : undefined}
      />
    );
  } else {
    return props.translate('Not a service provider.');
  }
};

export const ServiceProviderRegisterButton = (props: ServiceProviderRegisterButtonProps) => (
  <>
    {renderButton(props)}
  </>
);
