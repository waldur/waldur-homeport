import { CaretCircleDownIcon, CaretCircleUpIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useState } from 'react';

import { BaseButton } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { useCategories } from '../category/useCategories';
import { CategoryGroupLink } from '../links/CategoryGroupLink';
import { CategoryLink } from '../links/CategoryLink';

import { CategoryCard } from './CategoryCard';

const ITEMS_IN_ROW = 6;

export const CategoriesList: FC = () => {
  const categories = useCategories();
  const [showAll, setShowAll] = useState(false);

  if (categories.isLoading) {
    return <LoadingSpinner />;
  }

  if (categories.isError) {
    return (
      <h3 className="text-center">{translate('Unable to load categories.')}</h3>
    );
  }

  if (!categories.data) {
    return (
      <h3 className="text-center">
        {translate('There are no categories in marketplace yet.')}
      </h3>
    );
  }

  const items = showAll
    ? categories.data
    : categories.data.slice(0, ITEMS_IN_ROW);

  const showMoreButton = categories.data.length > ITEMS_IN_ROW;

  return (
    <div className={!showMoreButton ? 'my-8' : 'mt-8'}>
      <div className="flex flex-wrap justify-center gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={classNames(
              'w-full sm:w-[calc(50%-8px)] md:w-[calc((100%-32px)/3)]',
              showAll ? 'xl:w-[calc((100%-80px)/6)]' : 'xl:flex-1',
            )}
          >
            <CategoryCard
              item={item}
              as={item.categories ? CategoryGroupLink : CategoryLink}
            />
          </div>
        ))}
      </div>
      {showMoreButton ? (
        <div className="text-center my-2.5">
          <BaseButton
            variant="text-primary"
            onClick={() => setShowAll((value) => !value)}
            iconRight
            iconNode={
              showAll ? (
                <CaretCircleUpIcon weight="bold" />
              ) : (
                <CaretCircleDownIcon weight="bold" />
              )
            }
            label={showAll ? translate('See less') : translate('See more')}
            size="lg"
          />
        </div>
      ) : null}
    </div>
  );
};
