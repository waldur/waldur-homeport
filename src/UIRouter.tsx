import { pushStateLocationPlugin } from '@uirouter/react';
import { ConnectedUIRouter } from '@uirouter/redux/lib/react';
import { FunctionComponent } from 'react';

import { router } from './router';
import { states } from './states';

export const UIRouter: FunctionComponent = (props) => (
  <ConnectedUIRouter
    router={router}
    states={states}
    plugins={[pushStateLocationPlugin]}
  >
    <>{props.children}</>
  </ConnectedUIRouter>
);
