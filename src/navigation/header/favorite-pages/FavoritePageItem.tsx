import classNames from 'classnames';
import { FC } from 'react';

import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { Tip } from '@waldur/core/Tooltip';
import { getAbbreviation } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { FavoritePage } from './FavoritePageService';

const AdminIcon = require('@waldur/navigation/sidebar/Administration.svg');
const ReportingIcon = require('@waldur/navigation/sidebar/Reporting.svg');
const SupportIcon = require('@waldur/navigation/sidebar/Support.svg');

interface OwnProps {
  item: FavoritePage;
  active: boolean;
  loading: boolean;
  click(page: FavoritePage): void;
  remove(event, page: FavoritePage): void;
}

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
          item.image === 'admin' ? (
            <InlineSVG path={AdminIcon} svgClassName="h-40px w-40px" />
          ) : item.image === 'reporting' ? (
            <InlineSVG path={ReportingIcon} svgClassName="h-40px w-40px" />
          ) : item.image === 'support' ? (
            <InlineSVG path={SupportIcon} svgClassName="h-40px w-40px" />
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
