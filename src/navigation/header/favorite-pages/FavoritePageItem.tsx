import {
  ChartBar,
  GearSix,
  Headset,
  ShoppingCart,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, createElement } from 'react';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { getAbbreviation } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { FavoritePage } from './FavoritePageService';

interface OwnProps {
  item: FavoritePage;
  active: boolean;
  loading: boolean;
  click(page: FavoritePage): void;
  remove(event, page: FavoritePage): void;
}

const PageIcons = {
  admin: GearSix,
  reporting: ChartBar,
  support: Headset,
  marketplace: ShoppingCart,
};

export const FavoritePageItem: FC<OwnProps> = ({
  item,
  active,
  loading,
  click,
  remove,
}) => {
  return (
    <div
      className={classNames(
        'favorite-page-item btn btn-flex flex-column btn-active-light-primary btn-flush border-bottom border-end',
        active && 'btn-success',
      )}
      onClick={() => click(item)}
      onKeyPress={(e) => e.key === 'Enter' && click(item)}
      role="button"
      tabIndex={0}
    >
      <button
        className={classNames(
          'remove-button align-self-end btn btn-flush btn-active-icon-danger btn-active-text-danger fs-8 mb-1',
          active
            ? 'btn-text-white btn-icon-white'
            : 'btn-text-primary btn-icon-primary',
        )}
        onClick={(e) => remove(e, item)}
      >
        {translate('remove')}
        <i className="fa fa-times ms-1" />
      </button>
      <Tip label={item.title} id={`tip-${item.id}`}>
        {item?.image ? (
          PageIcons[item.image] ? (
            createElement(PageIcons[item.image], { size: 40 })
          ) : (
            <Image src={item.image} size={40} />
          )
        ) : (
          <div className="symbol symbol-40px">
            <ImagePlaceholder
              width="40px"
              height="40px"
              backgroundColor="#e2e2e2"
            >
              <div className="symbol-label fs-6 fw-bold">
                {getAbbreviation(item.title, 4)}
              </div>
            </ImagePlaceholder>
          </div>
        )}
      </Tip>
      {item.title?.length > 22 ? (
        <Tip
          label={item.title}
          id={`tip-title-${item.title}`}
          className="ellipsis mb-1 mt-2"
        >
          <strong>{item.title}</strong>
        </Tip>
      ) : (
        <strong className="mb-1 mt-2">{item.title}</strong>
      )}
      {item.subtitle?.length > 22 ? (
        <Tip
          label={item.subtitle}
          id={`tip-subtitle-${item.subtitle}`}
          className="ellipsis"
        >
          <span className={active ? 'text-gray-100' : 'text-gray-600'}>
            {item.subtitle}
          </span>
        </Tip>
      ) : (
        <span className={active ? 'text-gray-100' : 'text-gray-600'}>
          {item.subtitle}
        </span>
      )}
      {loading && (
        <div className="loading">
          <LoadingSpinnerIcon />
        </div>
      )}
    </div>
  );
};
