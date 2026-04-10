import classNames from 'classnames';
import { FC } from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { CategoryGroup } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useCategories } from '@waldur/marketplace/category/useCategories';
import { Category } from '@waldur/marketplace/types';

import { CategoryThumbnail } from './CategoryThumbnail';
import './CategorySidebar.scss';

export interface CategorySelection {
  uuid: string;
  isGroup: boolean;
}

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
      <Card className="category-sidebar card-bordered">
        <Card.Body className="d-flex justify-content-center align-items-center py-10">
          <LoadingSpinner />
        </Card.Body>
      </Card>
    );
  }

  if (categories.isError || !categories.data) {
    return (
      <Card className="category-sidebar card-bordered">
        <Card.Body>
          <LoadingErred loadData={categories.refetch} />
        </Card.Body>
      </Card>
    );
  }

  const renderItem = (item: Category | CategoryGroup, isGroup = false) => {
    const uuid = item.uuid;
    const isActive = selectedCategory?.uuid === uuid;

    return (
      <ListGroup.Item
        key={uuid}
        action
        active={isActive}
        onClick={() => onCategorySelect(isActive ? null : { uuid, isGroup })}
        className="d-flex align-items-center gap-3"
      >
        <div className="category-icon flex-shrink-0">
          <CategoryThumbnail
            title={item.title}
            icon={item.icon}
            circle
            size={24}
          />
        </div>
        <span className={classNames('flex-grow-1', { 'fw-bold': isGroup })}>
          {item.title}
        </span>
        {'offering_count' in item && item.offering_count !== undefined && (
          <span className="badge bg-secondary">{item.offering_count}</span>
        )}
      </ListGroup.Item>
    );
  };

  return (
    <Card className="category-sidebar card-bordered">
      <Card.Header className="border-bottom">
        <Card.Title>
          <span className="h3">{translate('Categories')}</span>
        </Card.Title>
      </Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item
          action
          active={!selectedCategory}
          onClick={() => onCategorySelect(null)}
          className="d-flex align-items-center gap-3"
        >
          <div className="category-icon flex-shrink-0">
            <CategoryThumbnail title="" size={24} />
          </div>
          <span className="flex-grow-1">{translate('All categories')}</span>
        </ListGroup.Item>
        {categories.data.map((item) => {
          if ('categories' in item && item.categories) {
            return (
              <div key={item.uuid}>
                {renderItem(item, true)}
                {item.categories.map((cat) => (
                  <ListGroup.Item
                    key={cat.uuid}
                    action
                    active={selectedCategory?.uuid === cat.uuid}
                    onClick={() =>
                      onCategorySelect(
                        selectedCategory?.uuid === cat.uuid
                          ? null
                          : { uuid: cat.uuid, isGroup: false },
                      )
                    }
                    className="d-flex align-items-center gap-3 ps-5"
                  >
                    <div className="category-icon flex-shrink-0">
                      <CategoryThumbnail
                        title={cat.title}
                        icon={cat.icon}
                        circle
                        size={24}
                      />
                    </div>
                    <span className="flex-grow-1">{cat.title}</span>
                    {cat.offering_count !== undefined && (
                      <span className="badge bg-secondary">
                        {cat.offering_count}
                      </span>
                    )}
                  </ListGroup.Item>
                ))}
              </div>
            );
          }
          return renderItem(item as Category);
        })}
      </ListGroup>
    </Card>
  );
};
