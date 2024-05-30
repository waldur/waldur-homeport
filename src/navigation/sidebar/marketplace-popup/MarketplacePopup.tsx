import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Col, FormControl, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import useOnScreen from '@waldur/core/useOnScreen';
import { translate } from '@waldur/i18n';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { getSidebarToggle } from '../Sidebar';

import { DataLoader } from './DataLoader';
import { MarketplacePopupTitle } from './MarketplacePopupTitle';

export const RECENTLY_ADDED_OFFERINGS_UUID =
  'recently_added_offerings_category';

export const MarketplacePopup: FunctionComponent = () => {
  const currentCustomer = useSelector(getCustomer);
  const currentProject = useSelector(getProject);
  const [filter, setFilter] = useState('');

  const refPopup = useRef<HTMLDivElement>();
  const refSearch = useRef<HTMLInputElement>();
  const isVisible = useOnScreen(refPopup);
  // Search input autofocus
  useEffect(() => {
    if (isVisible && refSearch.current) refSearch.current.focus();
  }, [isVisible, refSearch]);

  useEffect(() => {
    if (isVisible && refPopup.current) {
      refPopup.current.style.zIndex = '1055';
      refPopup.current.style.transform = 'translate(265px, 65px)';

      const control = getSidebarToggle();
      if (!control) {
        return;
      }

      if (document.body.hasAttribute('data-kt-aside-minimize')) {
        control.toggle();
      }
    }
  }, [isVisible]);

  return (
    <div
      id="marketplaces-selector"
      ref={refPopup}
      className="marketplaces-selector menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold rounded-0 pb-4 fs-6 h-100"
      data-kt-menu="true"
      data-popper-placement="end"
    >
      <div className="marketplaces-selector-header">
        <Row>
          <MarketplacePopupTitle isVisible={isVisible} />
          <Col xs={12} sm={7} xl={6}>
            <div className="form-group">
              <FormControl
                id="marketplaces-selector-search-box"
                ref={refSearch}
                type="text"
                className="form-control-solid text-center"
                autoFocus
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder={translate('Search offering...')}
              />
            </div>
          </Col>
        </Row>
      </div>
      <div className="d-flex flex-column flex-md-row h-100">
        {isVisible && currentCustomer && currentProject && (
          <DataLoader
            filter={filter}
            currentCustomer={currentCustomer}
            currentProject={currentProject}
          />
        )}
      </div>
    </div>
  );
};
