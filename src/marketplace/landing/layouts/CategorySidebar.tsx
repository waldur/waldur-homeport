import classNames from 'classnames';
import { FC } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { useCategories } from '@/marketplace/category/useCategories';
import { Category, CategoryGroup } from '@/marketplace/types';

import { CategoryThumbnail } from './CategoryThumbnail';

export interface CategorySelection {
  uuid: string;
  isGroup: boolean;
}

// Sticks 20px below the sticky header, page tabs, filter bar and impersonation
// bar (--layout-sticky-top), and never grows past the bottom of the screen:
// a long list scrolls inside the card.
const cardClassName = classNames(
  'sticky min-w-[280px] max-w-[320px] h-fit',
  'top-[calc(var(--layout-sticky-top)+20px)]',
  'max-h-[calc(100vh-var(--layout-sticky-top)-40px)]',
);

interface CategoryGroupItem extends CategoryGroup {
  categories: Category[];
}

const isCategoryGroup = (
  item: Category | CategoryGroup,
): item is CategoryGroupItem =>
  'categories' in item &&
  Array.isArray(item.categories) &&
  item.categories.length > 0;

interface CategorySidebarItemProps {
  title: string;
  icon?: string | null;
  count?: number;
  isActive: boolean;
  isGroup?: boolean;
  isNested?: boolean;
  onClick: () => void;
}

const CategorySidebarItem: FC<CategorySidebarItemProps> = ({
  title,
  icon,
  count,
  isActive,
  isGroup = false,
  isNested = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
    className={classNames(
      'flex items-center gap-2.5 w-full text-left bg-transparent px-3.5 py-2.5 text-sm font-semibold border-y-0 border-r-0 border-l-2 transition-[color,border-color] duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring-color)]',
      isActive
        ? 'active border-l-brand text-brand'
        : 'border-transparent text-quaternary hover:text-secondary hover:bg-transparent',
      isNested && 'ps-4',
    )}
  >
    <div className="size-6 shrink-0 flex items-center justify-center overflow-hidden [&_img]:size-6 [&_img]:object-contain">
      <CategoryThumbnail
        title={title}
        icon={icon ?? undefined}
        circle
        size={24}
      />
    </div>
    <span className={classNames('grow', { 'font-medium': isGroup })}>
      {title}
    </span>
    {count !== undefined && (
      <span
        className="inline-flex items-center justify-center rounded-full border border-secondary bg-transparent px-[9px] py-[1px] text-sm font-medium leading-[20px] text-primary"
        aria-label={translate('{count} offerings', { count })}
      >
        {count}
      </span>
    )}
  </button>
);

interface CategorySidebarProps {
  selectedCategory: CategorySelection | null;
  onCategorySelect: (selection: CategorySelection | null) => void;
}

export const CategorySidebar: FC<CategorySidebarProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  const categories = useCategories();

  if (categories.isLoading) {
    return (
      <Card bordered className={cardClassName}>
        <CardContent className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (categories.isError || !categories.data) {
    return (
      <Card bordered className={cardClassName}>
        <CardContent>
          <LoadingErred loadData={categories.refetch} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card bordered className={cardClassName}>
      <CardHeader className="border-b border-b-secondary min-h-[77px]">
        <CardTitle as="div">
          <span className="h3">{translate('Categories')}</span>
        </CardTitle>
      </CardHeader>
      <nav
        aria-label={translate('Categories')}
        className="min-h-0 overflow-y-auto"
      >
        <ul className="m-0 p-0 list-none">
          <li>
            <CategorySidebarItem
              title={translate('All categories')}
              isActive={!selectedCategory}
              onClick={() => onCategorySelect(null)}
            />
          </li>
          {categories.data.map((item) => {
            if (isCategoryGroup(item)) {
              const isGroupActive = selectedCategory?.uuid === item.uuid;
              return (
                <li key={item.uuid}>
                  <CategorySidebarItem
                    title={item.title}
                    icon={item.icon}
                    count={item.offering_count}
                    isActive={isGroupActive}
                    isGroup
                    onClick={() =>
                      onCategorySelect(
                        isGroupActive
                          ? null
                          : { uuid: item.uuid, isGroup: true },
                      )
                    }
                  />
                  {item.categories && item.categories.length > 0 && (
                    <ul className="m-0 p-0 list-none">
                      {item.categories.map((cat) => {
                        const isCatActive = selectedCategory?.uuid === cat.uuid;
                        return (
                          <li key={cat.uuid}>
                            <CategorySidebarItem
                              title={cat.title}
                              icon={cat.icon}
                              count={cat.offering_count}
                              isActive={isCatActive}
                              isNested
                              onClick={() =>
                                onCategorySelect(
                                  isCatActive
                                    ? null
                                    : { uuid: cat.uuid, isGroup: false },
                                )
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }
            const isCatActive = selectedCategory?.uuid === item.uuid;
            return (
              <li key={item.uuid}>
                <CategorySidebarItem
                  title={item.title}
                  icon={item.icon}
                  count={item.offering_count}
                  isActive={isCatActive}
                  onClick={() =>
                    onCategorySelect(
                      isCatActive ? null : { uuid: item.uuid, isGroup: false },
                    )
                  }
                />
              </li>
            );
          })}
        </ul>
      </nav>
    </Card>
  );
};
