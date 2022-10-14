import { FunctionComponent, useRef, useEffect } from 'react';
import { Col, FormControl } from 'react-bootstrap';
import ReactDOM from 'react-dom';

import { Link } from '@waldur/core/Link';
import useOnScreen from '@waldur/core/useOnScreen';
import { translate } from '@waldur/i18n';
import './QuickProjectSelectorDropdown.scss';

export const GuestDropdown: FunctionComponent = () => {
  const refProjectSelector = useRef<HTMLDivElement>();

  const isVisible = useOnScreen(refProjectSelector);

  useEffect(() => {
    if (isVisible && refProjectSelector.current) {
      refProjectSelector.current.style.zIndex = '1055';
    }
  }, [isVisible]);

  return (
    <>
      {isVisible &&
        ReactDOM.createPortal(
          <div className="fade modal-backdrop show" />,
          document.getElementById('kt_aside_toolbar'),
        )}
      <div
        ref={refProjectSelector}
        className="quick-project-selector guest-popup menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold rounded-0 py-4 fs-6"
        data-kt-menu="true"
        data-popper-placement="bottom-start"
      >
        <div className="form-group pb-3 px-20 border-gray-300 border-bottom">
          <FormControl
            id="quick-selector-search-box"
            type="text"
            className="form-control-solid text-center bg-light"
            placeholder={translate('Search...')}
          />
        </div>
        <div className="d-flex border-gray-300 border-bottom">
          <Col className="organization-listing" xs={5}>
            <div className="py-1 px-4 border-gray-300 border-bottom">
              <span className="fw-bold fs-7 text-muted">
                {translate('Organization')}
              </span>
            </div>
          </Col>
          <Col xs={7} className="project-listing">
            <div className="py-1 px-4 border-gray-300 border-bottom">
              <span className="fw-bold fs-7 text-muted">
                {translate('Project')}
              </span>
            </div>
          </Col>
        </div>
        <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 text-center">
          <div className="inner-container">
            <div className="circle rounded-circle border-dark">icon</div>
            <h3 className="mb-3">{translate('Not logged in')}</h3>
            <p className="description mb-7">
              {translate(
                'You are accessing as a guest user. To manage organizations or projects, please sign in.',
              )}
            </p>
            <Link state="login" className="btn btn-primary min-w-200px">
              {translate('Sign in')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
