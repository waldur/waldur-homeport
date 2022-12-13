import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Col, ListGroupItem, Stack } from 'react-bootstrap';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';

import { BaseList } from './BaseList';

const EmptyCategoryListPlaceholder: FunctionComponent = () => (
  <div className="message-wrapper ellipsis">
    {translate('There are no categories.')}
  </div>
);

export const CategoryListItem: FunctionComponent<{
  item: Category;
  onClick;
  selectedItem: Category;
}> = ({ item, onClick, selectedItem }) => {
  return (
    <ListGroupItem
      data-uuid={item.uuid}
      className={classNames({
        active: selectedItem && item.uuid === selectedItem.uuid,
      })}
      onClick={() => onClick(item)}
    >
      <Stack direction="horizontal" gap={4}>
        {item.icon ? (
          <div className="symbol symbol-35px">
            <img src={item.icon} />
          </div>
        ) : (
          <ImagePlaceholder
            width="35px"
            height="35px"
            backgroundColor="#e2e2e2"
          />
        )}
        <span className="title lh-1">{truncate(item.title)}</span>
        {item.offering_count && (
          <span className="lh-1 text-muted ms-auto">
            {translate('{count} items', { count: item.offering_count || 0 })}
          </span>
        )}
      </Stack>
    </ListGroupItem>
  );
};

export const CategoriesPanel: FunctionComponent<{
  categories;
  selectedCategory;
  selectCategory;
  filter;
}> = ({ categories, selectedCategory, selectCategory }) => {
  return (
    <Col className="category-listing" xs={6}>
      {categories?.length > 0 ? (
        <BaseList
          items={categories}
          selectedItem={selectedCategory}
          selectItem={selectCategory}
          EmptyPlaceholder={EmptyCategoryListPlaceholder}
          ItemComponent={CategoryListItem}
        />
      ) : (
        <EmptyCategoryListPlaceholder />
      )}
    </Col>
  );
};
