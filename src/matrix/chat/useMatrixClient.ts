import { useContext } from 'react';

import { MatrixChatContext } from './MatrixChatContext';

export const useMatrixClient = () => useContext(MatrixChatContext);
