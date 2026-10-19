import { FC } from 'react';

import { ConfirmModalRoot as BaseConfirmModalRoot } from 'waldur-ui';

import { ModalErrorBoundary } from './ModalErrorBoundary';

/** waldur-ui's ConfirmModalRoot, reporting a crashed dialog to Sentry. */
export const ConfirmModalRoot: FC = () => (
  <BaseConfirmModalRoot errorBoundary={ModalErrorBoundary} />
);
