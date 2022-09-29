import { FunctionComponent, useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { router } from '@waldur/router';

import { getCategories } from '../landing/store/selectors';
import { isExperimentalUiComponentsVisible } from '../utils';

import './HeroSection.scss';

export const HeroSection: FunctionComponent = () => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const categories = useSelector(getCategories);
  const currentCategoryUuid = router.globals.params.category_uuid;
  const currentCategory = useMemo(
    () => categories.items.find((item) => item.uuid === currentCategoryUuid),
    [categories],
  );

  return (
    <div className="category-hero">
      <div className="category-hero__background-left">
        <div className="category-hero__table">
          <div className="category-hero__main">
            {categories.loading ? (
              <LoadingSpinner />
            ) : !categories.loaded || !currentCategory ? (
              <h3>{translate('Unable to load category')}</h3>
            ) : (
              <>
                <h1>{currentCategory.title}</h1>
                <p>{currentCategory.description}</p>
                {/* TODO: use real data */}
                {showExperimentalUiComponents && (
                  <Stack gap={5} direction="horizontal">
                    <span>SLURM 22.05</span>
                    <span>Bookings</span>
                    <span>OpenStack App</span>
                    <span>Example tag</span>
                  </Stack>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div
        className="category-hero__background-right"
        style={
          currentCategory
            ? {
                backgroundImage: `url(${currentCategory.icon})`,
                backgroundSize: 'contain',
              }
            : {}
        }
      ></div>
    </div>
  );
};
