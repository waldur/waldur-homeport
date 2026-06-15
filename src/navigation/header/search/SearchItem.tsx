import { StarIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { ReactNode } from 'react';

import { Link } from '@/core/Link';
import { useOrganizationAndProjectAutocompletesForResources } from '@/navigation/sidebar/resources-filter/utils';
import { ItemImage } from '@/navigation/workspace/context-selector/ItemImage';

import { useFavoritePages } from '../favorite-pages/FavoritePageService';

import { getResourceFilterFromSearchItem } from './utils';

import './SearchItem.scss';

export interface SearchItemProps {
  title: string;
  subtitle?: string;
  image?: string;
  to: string;
  params?: { [key: string]: string };
  badge?: ReactNode;
  actions?: ReactNode;
  onClick?(item: SearchItemProps);
  isFavorite?: ReturnType<typeof useFavoritePages>['isFavorite'];
  addFavoritePage?: ReturnType<typeof useFavoritePages>['addFavoritePage'];
  removeFavorite?: ReturnType<typeof useFavoritePages>['removeFavorite'];
}

export const SearchItem = (props: SearchItemProps) => {
  const isFav = props.isFavorite
    ? props.isFavorite(props.to, props.params)
    : false;

  const { syncResourceFilters } =
    useOrganizationAndProjectAutocompletesForResources();

  return (
    <Link
      state={props.to}
      params={props.params}
      className="search-result-item d-flex text-dark text-hover-primary align-items-center py-2 px-5 bg-hover-primary-50"
      onClick={(e) => {
        if (props.onClick) {
          props.onClick(props);
        } else e.stopPropagation();
        syncResourceFilters(getResourceFilterFromSearchItem(props));
      }}
    >
      <ItemImage
        item={{ image: props.image, name: props.title }}
        className="me-4"
        circle
      />

      <div className="d-flex flex-column justify-content-start fw-semibold">
        <span className="fs-6 fw-semibold">{props.title}</span>
        {Boolean(props.subtitle) && (
          <span className="fs-7 fw-semibold text-muted">{props.subtitle}</span>
        )}
      </div>
      <div className="ms-auto d-flex">
        {props.badge && <div>{props.badge}</div>}
        {props.actions}
        {props.addFavoritePage && (
          <button
            className={classNames('btn-fav', isFav && 'show')}
            onClick={(e) =>
              isFav
                ? props.removeFavorite(props.to, props.params, e)
                : props.addFavoritePage(
                    {
                      state: props.to,
                      params: props.params,
                      title: props.title,
                      subtitle: props.subtitle,
                      image: props.image,
                    },
                    e,
                  )
            }
          >
            {isFav ? (
              <StarIcon size={20} weight="fill" className="text-warning" />
            ) : (
              <StarIcon size={20} className="text-dark" weight="bold" />
            )}
          </button>
        )}
      </div>
    </Link>
  );
};
