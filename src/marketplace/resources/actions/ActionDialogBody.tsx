import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';

import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';

import { ResourceActionMenuContext } from './ResourceActionMenuContext';

export const ActionDialogBody: FC<PropsWithChildren> = ({ children }) => {
  const [query, setQuery] = useState('');
  const queryContextValue = useMemo(() => ({ query }), [query]);

  return (
    <Modal.Body>
      <FilterBox
        type="search"
        placeholder={translate('Search by name') + ' ...'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className="scroll-y mh-400px">
        <ResourceActionMenuContext.Provider value={queryContextValue}>
          {children}
        </ResourceActionMenuContext.Provider>
      </div>
    </Modal.Body>
  );
};
