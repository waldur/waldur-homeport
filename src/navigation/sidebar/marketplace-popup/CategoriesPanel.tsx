import { ArrowsClockwise, CaretRight } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, PropsWithChildren, useContext } from 'react';
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
interface CategoryListItemProps {
  item: Category;
  onClick;
  selectedItem?: Category;
  active?: boolean;
  className?: string;
}

export const CategoryListItem: FunctionComponent<
  PropsWithChildren<CategoryListItemProps>
> = ({ item, onClick, selectedItem, active, className, children }) => {
  return (
    <ListGroupItem
      data-uuid={item.uuid}
      className={classNames(className, {
        active: (selectedItem && item.uuid === selectedItem.uuid) || active,
      })}
      onClick={() => onClick(item)}
    >
      <Stack
        direction="horizontal"
        gap={3}
        className={active ? 'active' : undefined}
      >
        {item.icon ? (
          <div className="symbol symbol-40px">
            <img src={item.icon} alt="category" />
          </div>
        ) : (
          <ImagePlaceholder
            width="40px"
            height="40px"
            backgroundColor="#e2e2e2"
          />
        )}
        <h5 className="title lh-1 mb-0">{truncate(item.title)}</h5>
        {item.offering_count > 0 && (
          <span className="lh-1 text-gray-700 fs-5 ms-auto">
            {item.offering_count === 1
              ? translate('{count} offering', { count: 1 })
              : translate('{count} offerings', {
                  count: item.offering_count || 0,
                })}
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
      <span className="svg-icon svg-icon-3 text-gray-700 rotate-90">
        <CaretRight />
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
      <Accordion.Collapse eventKey="0">
        <>
          {item.categories.map((category) => (
            <CategoryListItem
              key={category.uuid}
              item={category}
              onClick={onClick}
              selectedItem={selectedItem}
              className="ps-7 pe-14"
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
  loading;
}> = ({ categories, selectedCategory, selectCategory, loading }) => {
  return (
    <div className="category-listing">
      <div className="d-flex align-items-center ms-7 mt-2">
        <h6 className="text-gray-700 fw-bold my-2 me-4">
          {translate('Categories')}
        </h6>
        {loading && (
          <span className="fa-spin text-gray-700 lh-1">
            <ArrowsClockwise size={16} />
          </span>
        )}
      </div>
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
