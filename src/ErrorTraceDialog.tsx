import { FallbackRender } from '@sentry/react';

import { translate } from '@/i18n';

import { ModalDialog } from './modal/ModalDialog';

export const ErrorTraceDialog: FallbackRender = (props) => {
  return (
    <ModalDialog title={translate('Error trace')}>
      <div className="text-muted mh-300px scroll-y">
        {props.componentStack || (props.error as Error).stack}
      </div>
    </ModalDialog>
  );
};
