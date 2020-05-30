import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ModalRoot from '@waldur/modal/ModalRoot';
import { withStore } from '@waldur/store/connect';
const ModalContainer = withStore(ModalRoot);

export const renderModalContainer = () => {
  ReactDOM.render(<ModalContainer />, document.getElementById('react-root'));
};
