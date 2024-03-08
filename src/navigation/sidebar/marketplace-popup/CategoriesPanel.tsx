import classNames from 'classnames';
import { FunctionComponent, useContext } from 'react';
import {
  Accordion,
  AccordionContext,
  ListGroupItem,
  Stack,
  useAccordionButton,
} from 'react-bootstrap';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Category, CategoryGroup } from '@waldur/marketplace/types';

import { BaseList } from './BaseList';

const EmptyCategoryListPlaceholder: FunctionComponent = () => (
  <div className="message-wrapper ellipsis">
    {translate('There are no categories.')}
  </div>
);

export const CategoryListItem: FunctionComponent<{
  item: Category;
  onClick;
  selectedItem?: Category;
  active?: boolean;
}> = ({ item, onClick, selectedItem, active, children }) => {
  return (
    <ListGroupItem
      data-uuid={item.uuid}
      className={classNames({
        active: (selectedItem && item.uuid === selectedItem.uuid) || active,
      })}
      onClick={() => onClick(item)}
    >
      <Stack
        direction="horizontal"
        gap={4}
        className={active ? 'active' : undefined}
      >
        {item.icon ? (
          <div className="symbol symbol-35px">
            <img src={item.icon} alt="category" />
          </div>
        ) : (
          <ImagePlaceholder
            width="35px"
            height="35px"
            backgroundColor="#e2e2e2"
          />
        )}
        <span className="title lh-1">{truncate(item.title)}</span>
        {item.offering_count > 0 && (
          <span className="lh-1 text-muted ms-auto">
            {translate('{count} items', { count: item.offering_count || 0 })}
          </span>
        )}
        {children}
      </Stack>
    </ListGroupItem>
  );
};

function CustomToggle({ item, eventKey }) {
  const decoratedOnClick = useAccordionButton(eventKey);
  const { activeEventKey } = useContext(AccordionContext);

  return (
    <CategoryListItem
      item={item}
      onClick={decoratedOnClick}
      active={activeEventKey === eventKey}
    >
      <span className="svg-icon-2 rotate-90">
        <i className="fa fa-angle-right fs-1 fw-light"></i>
      </span>
    </CategoryListItem>
  );
}

export const CategoryGroupListItem: FunctionComponent<{
  item: CategoryGroup;
  onClick;
  selectedItem: Category;
}> = ({ item, onClick, selectedItem }) => {
  return item.categories ? (
    <Accordion flush>
      <CustomToggle item={item} eventKey="0" />
      <Accordion.Collapse eventKey="0" className="px-7">
        <>
          {item.categories.map((category) => (
            <CategoryListItem
              key={category.uuid}
              item={category}
              onClick={onClick}
              selectedItem={selectedItem}
            />
          ))}
        </>
      </Accordion.Collapse>
    </Accordion>
  ) : (
    <CategoryListItem
      item={item as Category}
      onClick={onClick}
      selectedItem={selectedItem}
    />
  );
};

export const CategoriesPanel: FunctionComponent<{
  categories;
  selectedCategory;
  selectCategory;
  filter;
}> = ({ categories, selectedCategory, selectCategory }) => {
  return (
    <div className="category-listing border-bottom">
      {categories?.length > 0 ? (
        <BaseList
          items={categories}
          selectedItem={selectedCategory}
          selectItem={selectCategory}
          EmptyPlaceholder={EmptyCategoryListPlaceholder}
          ItemComponent={CategoryGroupListItem}
        />
      ) : (
        <EmptyCategoryListPlaceholder />
      )}
    </div>
  );
};
