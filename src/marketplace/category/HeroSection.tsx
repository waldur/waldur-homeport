import classNames from 'classnames';

import { Link } from '@/core/Link';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';

import { Category, CategoryGroup } from '../types';

import './HeroSection.scss';

export const HeroSection = ({ item }: { item: Category | CategoryGroup }) => (
  <div className="category-hero">
    <div
      className={classNames(
        PAGE_CONTAINER_CLASSNAME,
        'flex items-center gap-3',
      )}
    >
      {item.icon && (
        <img src={item.icon} alt="" className="category-hero-icon" />
      )}
      <div>
        <h1 className="text-2xl font-medium mb-0">{item.title}</h1>
        {item.description && <p className="mb-0 mt-1">{item.description}</p>}
        {(item as CategoryGroup).categories?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
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
