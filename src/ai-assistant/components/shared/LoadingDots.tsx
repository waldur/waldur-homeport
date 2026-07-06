import type { FC } from 'react';

export const LoadingDots: FC = () => (
  <div className="aui-loading-indicator" role="status">
    <span className="dot" />
    <span className="dot" />
    <span className="dot" />
  </div>
);
