import { Star } from '@phosphor-icons/react';
import { useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { FavoritePagesContainer } from './favorite-pages/FavoritePagesContainer';

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
        <button
          id="favorite-pages-toggle"
          type="button"
          className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary position-relative w-35px h-35px w-md-40px h-md-40px"
          onClick={() => setShow(!show)}
        >
          <span
            className="svg-icon-1 text-gray"
            title={translate('Favourites')}
          >
            <Star size={25} />
          </span>
        </button>
      </div>
    </OverlayTrigger>
  );
};
