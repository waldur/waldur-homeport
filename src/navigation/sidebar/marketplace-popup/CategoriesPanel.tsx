import { ArrowsClockwiseIcon, CaretRightIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, PropsWithChildren, useState } from 'react';
import { ListGroupItem, Stack } from 'react-bootstrap';

import { Collapsible, CollapsibleContent } from 'waldur-ui';

import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { Category, CategoryGroup } from '@/marketplace/types';

import { BaseList } from './BaseList';
import { getSelectableRowProps } from './utils';

const EmptyCategoryListPlaceholder: FunctionComponent = () => (
  <div className="message-wrapper ellipsis">
    {translate('There are no categories.')}
  </div>
);

interface CategoryListItemProps {
  item: Category | CategoryGroup;
  onClick;
  selectedItem?: Category;
  active?: boolean;
  /** Set on a group header row: whether its categories are shown. */
  expanded?: boolean;
  className?: string;
}

const CategoryListItem: FunctionComponent<
  PropsWithChildren<CategoryListItemProps>
> = ({
  item,
  onClick,
  selectedItem,
  active,
  expanded,
  className,
  children,
}) => {
  return (
    <ListGroupItem
      data-uuid={item.uuid}
      className={classNames(className, {
        active: (selectedItem && item.uuid === selectedItem.uuid) || active,
      })}
      {...getSelectableRowProps(() => onClick(item))}
      aria-expanded={expanded}
    >
      <Stack
        direction="horizontal"
        gap={3}
        className={active ? 'active' : undefined}
      >
        {item.icon ? (
          <div className="size-10 shrink-0 inline-flex items-center justify-center rounded-md overflow-hidden">
            <img
              src={item.icon}
              alt="category"
              className="size-full object-contain"
            />
          </div>
        ) : (
          <ImagePlaceholder width="40px" height="40px" />
        )}
        <h5 className="title leading-none mb-0">{truncate(item.title)}</h5>
        {item.offering_count > 0 && (
          <span className="leading-none text-secondary text-base ms-auto">
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

const CategoryGroupListItem: FunctionComponent<{
  item: CategoryGroup;
  onClick;
  selectedItem: Category;
}> = ({ item, onClick, selectedItem }) => {
  const [open, setOpen] = useState(false);

  return item.categories ? (
    <Collapsible open={open} onOpenChange={setOpen} className="category-group">
      <CategoryListItem
        item={item}
        onClick={() => setOpen(!open)}
        active={open}
        expanded={open}
      >
        <CaretRightIcon
          weight="bold"
          className="size-4 text-secondary rotate-90"
        />
      </CategoryListItem>
      <CollapsibleContent>
        {item.categories.map((category) => (
          <CategoryListItem
            key={category.uuid}
            item={category}
            onClick={onClick}
            selectedItem={selectedItem}
            className="ps-5.5 pe-11.5"
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
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
      <div className="flex items-center ms-5.5 mt-1.5">
        <h6 className="text-secondary font-medium my-1.5 me-3">
          {translate('Categories')}
        </h6>
        {loading && (
          <span className="animation-spin text-secondary leading-none">
            <ArrowsClockwiseIcon size={16} weight="bold" />
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
