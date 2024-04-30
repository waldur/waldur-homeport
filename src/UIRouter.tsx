import { pushStateLocationPlugin } from '@uirouter/react';
import { ConnectedUIRouter } from '@uirouter/redux/lib/react';
import { FunctionComponent, PropsWithChildren } from 'react';

import { router } from './router';
import { states } from './states';

export const UIRouter: FunctionComponent<PropsWithChildren> = (props) => (
  <ConnectedUIRouter
    router={router}
    states={states}
    plugins={[pushStateLocationPlugin]}
  >
    <>{props.children}</>
  </ConnectedUIRouter>
);
