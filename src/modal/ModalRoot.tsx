import { FC } from 'react';

import { ModalRoot as BaseModalRoot } from 'waldur-ui';

import { ModalErrorBoundary } from './ModalErrorBoundary';

/** waldur-ui's ModalRoot, reporting a crashed dialog to Sentry. */
export const ModalRoot: FC = () => (
  <BaseModalRoot errorBoundary={ModalErrorBoundary} />
);
