import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';

import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';

import { ResourceActionMenuContext } from './ResourceActionMenuContext';

export const ActionDialogBody: FC<PropsWithChildren> = ({ children }) => {
  const [query, setQuery] = useState('');
  const queryContextValue = useMemo(() => ({ query }), [query]);

  return (
    <>
      <Modal.Header className="without-border pb-4">
        <FilterBox
          type="search"
          placeholder={translate('Search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="flex-grow-1"
        />
      </Modal.Header>
      <Modal.Body className="pt-0 px-0 h-400px">
        <ResourceActionMenuContext.Provider value={queryContextValue}>
          {children}
        </ResourceActionMenuContext.Provider>
      </Modal.Body>
    </>
  );
};
