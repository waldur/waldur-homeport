import { fixURL } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { BreadcrumbDropdown } from '@waldur/navigation/header/breadcrumb/BreadcrumbDropdown';
import { useFavoritePages } from '@waldur/navigation/header/favorite-pages/FavoritePageService';
import { SearchItem } from '@waldur/navigation/header/search/SearchItem';

const ProjectListItem = ({
  row,
  addFavoritePage,
  removeFavorite,
  isFavorite,
}) => (
  <SearchItem
    key={row.uuid}
    to="project.dashboard"
    params={{ uuid: row.uuid }}
    title={row.name}
    subtitle={row.customer_name}
    image={row.image}
    addFavoritePage={addFavoritePage}
    removeFavorite={removeFavorite}
    isFavorite={isFavorite}
  />
);

export const ProjectBreadcrumbPopover = ({ project }) => {
  const { addFavoritePage, removeFavorite, isFavorite } = useFavoritePages();

  return (
    <BreadcrumbDropdown
      api={fixURL('/projects/')}
      queryField="query"
      params={{
        customer: project.customer_uuid,
        field: ['name', 'uuid', 'image'],
      }}
      RowComponent={({ row }) => (
        <ProjectListItem
          row={row}
          addFavoritePage={addFavoritePage}
          removeFavorite={removeFavorite}
          isFavorite={isFavorite}
        />
      )}
      placeholder={translate('Type in name of project') + '...'}
      emptyMessage={translate('There are no projects.')}
    />
  );
};
