import { fixURL } from '@waldur/core/api';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { BreadcrumbDropdown } from '@waldur/navigation/header/breadcrumb/BreadcrumbDropdown';
import { useFavoritePages } from '@waldur/navigation/header/favorite-pages/FavoritePageService';
import { SearchItem } from '@waldur/navigation/header/search/SearchItem';

const ResourceRow = ({
  row,
  addFavoritePage,
  removeFavorite,
  isFavorite,
  close,
}) => (
  <SearchItem
    to="marketplace-resource-details"
    params={{
      resource_uuid: row.uuid,
    }}
    image={row.offering_thumbnail}
    title={row.name}
    subtitle={formatDateTime(row.created)}
    addFavoritePage={addFavoritePage}
    removeFavorite={removeFavorite}
    isFavorite={isFavorite}
    onClick={close}
  />
);

export const ResourceBreadcrumbPopover = ({ resource, close }) => {
  const { addFavoritePage, removeFavorite, isFavorite } = useFavoritePages();

  return (
    <BreadcrumbDropdown
      api={fixURL('/marketplace-resources/')}
      queryField="query"
      params={{
        state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
        project_uuid: resource.project_uuid,
        category_uuid: resource.category_uuid,
        field: ['name', 'uuid', 'offering_thumbnail', 'state', 'created'],
      }}
      RowComponent={({ row }) => (
        <ResourceRow
          row={row}
          addFavoritePage={addFavoritePage}
          removeFavorite={removeFavorite}
          isFavorite={isFavorite}
          close={close}
        />
      )}
      placeholder={translate('Type in name of resource') + '...'}
      emptyMessage={translate('There are no resources.')}
    />
  );
};
