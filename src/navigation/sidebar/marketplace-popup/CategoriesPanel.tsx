import { ArrowsClockwiseIcon, CaretRightIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, PropsWithChildren, useState } from 'react';

import { Collapsible, CollapsibleContent } from 'waldur-ui';

import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { truncate } from '@/core/utils';
import { translate } from '@/i18n';
import { Category, CategoryGroup } from '@/marketplace/types';

import { BaseList } from './BaseList';
import { getSelectableRowProps } from './utils';

const EmptyCategoryListPlaceholder: FunctionComponent = () => (
  <div className="flex items-center justify-center min-w-1/2 max-lg:w-full h-full text-secondary ellipsis">
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
  const isSelected =
    (selectedItem && item.uuid === selectedItem.uuid) || active;
  const bgClass = expanded
    ? 'bg-secondary'
    : isSelected
      ? 'bg-tertiary'
      : 'bg-primary hover:bg-secondary';

  return (
    <div
      data-uuid={item.uuid}
      // The waldur-integration-testing suite selects categories by this
      // (docs/e2e-locators.md).
      data-testid="category-item"
      className={classNames(
        'relative block cursor-pointer py-4 border-0 text-primary transition-colors',
        className || 'px-6',
        bgClass,
      )}
      {...getSelectableRowProps(() => onClick(item))}
      aria-expanded={expanded}
    >
      <div className="flex items-center self-stretch gap-2.5">
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
        <h5 className="leading-none mb-0">{truncate(item.title)}</h5>
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
      </div>
    </div>
  );
};

const CategoryGroupListItem: FunctionComponent<{
  item: CategoryGroup;
  onClick;
  selectedItem: Category;
}> = ({ item, onClick, selectedItem }) => {
  const [open, setOpen] = useState(false);

  return item.categories ? (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      // The waldur-integration-testing suite selects catalog groups by this
      // (docs/e2e-locators.md).
      data-testid="category-group"
    >
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
            className="ps-10 pe-6"
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
    <div
      // The waldur-integration-testing suite scopes categories by this
      // (docs/e2e-locators.md).
      data-testid="category-listing"
      className={classNames(
        'w-full lg:w-1/2 lg:basis-1/2 lg:border-r lg:border-secondary flex flex-col h-full',
        selectedCategory && 'max-lg:hidden',
      )}
    >
      <div className="flex items-center ms-6 mt-1.5 shrink-0">
        <h6 className="text-secondary font-medium my-1.5 me-3">
          {translate('Categories')}
        </h6>
        {loading && (
          <span className="animation-spin text-secondary leading-none">
            <ArrowsClockwiseIcon size={16} weight="bold" />
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0">
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
    </div>
  );
};
