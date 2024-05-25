import { MagnifyingGlass } from '@phosphor-icons/react';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import Bg from './Background.svg';

export const NoResult = ({ isVisible, clearSearch }) => {
  return (
    <div className={classNames('no-search-result', !isVisible && 'd-none')}>
      <Bg className="background" />
      <div className="text-center d-flex flex-column align-items-center gap-6 pb-10 position-relative z-index-1">
        <div className="search-icon">
          <MagnifyingGlass size={25} />
        </div>

        <div>
          <h4 className="fw-bold mb-2">{translate('No results found')}</h4>
          <div className="text-muted fs-6">
            <p className="mb-0">
              {translate("We didn't get any results.")}
              <br />
              {translate('Please try again')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="btn-outline-default w-50 mw-350px"
          onClick={clearSearch}
        >
          {translate('Clear search')}
        </Button>
      </div>
    </div>
  );
};
