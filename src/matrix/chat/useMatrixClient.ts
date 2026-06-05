import { useContext } from 'react';

import { MatrixChatContext } from './MatrixChatProvider';

export const useMatrixClient = () => useContext(MatrixChatContext);
