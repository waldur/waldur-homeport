import { Link } from '@waldur/core/Link';

import { Category, CategoryGroup } from '../types';

import './HeroSection.scss';

export const HeroSection = ({ item }: { item: Category | CategoryGroup }) => (
  <div className="category-hero">
    <div className="container-fluid d-flex align-items-center gap-4">
      {item.icon && (
        <img src={item.icon} alt="" className="category-hero-icon" />
      )}
      <div>
        <h1 className="fs-1 fw-bold mb-0 category-hero-title">{item.title}</h1>
        {item.description && (
          <p className="mb-0 mt-1 category-hero-description">
            {item.description}
          </p>
        )}
        {(item as CategoryGroup).categories?.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mt-2">
            {(item as CategoryGroup).categories.map((category) => (
              <Link
                state="public.marketplace-category"
                params={{ category_uuid: category.uuid }}
                key={category.uuid}
                className="category-hero-link"
              >
                {category.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
