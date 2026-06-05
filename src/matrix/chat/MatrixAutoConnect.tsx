import { FC } from 'react';

import { useMatrixAutoConnect } from './useMatrixAutoConnect';

/** Renderless app-level mount point for {@link useMatrixAutoConnect}. */
export const MatrixAutoConnect: FC = () => {
  useMatrixAutoConnect();
  return null;
};
