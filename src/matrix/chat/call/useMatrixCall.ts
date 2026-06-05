import { useContext } from 'react';

import { MatrixCallContext } from './MatrixCallContext';

export const useMatrixCall = () => useContext(MatrixCallContext);
