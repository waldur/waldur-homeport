import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { TranslateProps } from '@waldur/i18n';
import { ServiceProvider } from '@waldur/marketplace/types';
import { ActionButton } from '@waldur/table/ActionButton';

interface ServiceProviderRegisterButtonProps extends TranslateProps {
  registering: boolean;
  loading: boolean;
  serviceProvider: ServiceProvider;
  canRegisterServiceProvider: boolean;
  registerServiceProvider?(): void;
}

export const ServiceProviderRegisterButton: FunctionComponent<ServiceProviderRegisterButtonProps> = (
  props,
) => {
  if (props.loading) {
    return <LoadingSpinner />;
  } else if (props.serviceProvider) {
    return (
      <>{`${props.translate('Registered at:')} ${formatDateTime(
        props.serviceProvider.created,
      )}`}</>
    );
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
    return <>{props.translate('Not a service provider.')}</>;
  }
};
