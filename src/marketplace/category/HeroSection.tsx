import { Link } from '@waldur/core/Link';

import { Category, CategoryGroup } from '../types';
import './HeroSection.scss';

export const HeroSection = ({ item }: { item: Category | CategoryGroup }) => (
  <div className="category-hero">
    <div
      className={`category-hero__background-left ${item.icon ? 'clipped' : ''}`}
    >
      <div className="category-hero__table">
        <div className="category-hero__main">
          <h1>{item.title}</h1>
          <p>{item.description}</p>

          {(item as CategoryGroup).categories?.map((category, index) => (
            <span key={index}>
              <Link
                state="public.marketplace-category"
                params={{ category_uuid: category.uuid }}
              >
                {category.title}
              </Link>{' '}
            </span>
          ))}
        </div>
      </div>
    </div>
    {item.icon ? (
      <div
        className="category-hero__background-right"
        style={{
          backgroundImage: `url(${item.icon})`,
          backgroundSize: 'contain',
        }}
      />
    ) : null}
  </div>
);
