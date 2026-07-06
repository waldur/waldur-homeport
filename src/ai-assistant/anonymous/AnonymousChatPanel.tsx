import { FC } from 'react';

import { AnonymousThread } from './AnonymousThread';
import { AnonymousThreadRuntimeProvider } from './AnonymousThreadRuntimeProvider';

export const AnonymousChatPanel: FC = () => (
  <AnonymousThreadRuntimeProvider>
    <div className="h-100 w-100 d-flex flex-column">
      <AnonymousThread />
    </div>
  </AnonymousThreadRuntimeProvider>
);
