import { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { InlineSVG } from '@waldur/core/svg/InlineSVG';

import { FavoritePagesContainer } from './favorite-pages/FavoritePagesContainer';

const icon = require('./favorite-pages.svg');

export const FavoritePagesDropdown: React.FC = () => {
  const [show, setShow] = useState(false);
  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      show={show}
      onToggle={setShow}
      overlay={
        <Popover
          id="favorite-pages-popup"
          className="mw-350px mw-lg-375px w-350px w-lg-375px border-0"
        >
          <FavoritePagesContainer close={() => setShow(false)} />
        </Popover>
      }
      rootClose={true}
    >
      <div className="d-flex align-items-center ms-1 ms-lg-3">
        <div
          id="favorite-pages-toggle"
          className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary position-relative w-35px h-35px w-md-40px h-md-40px"
          onClick={() => setShow(!show)}
        >
          <InlineSVG path={icon} className="svg-icon-1" />
        </div>
      </div>
    </OverlayTrigger>
  );
};
