import { useCurrentStateAndParams } from '@uirouter/react';
import { Card, Stack } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CategoryLink } from '@waldur/marketplace/links/CategoryLink';
import { CategoriesListType } from '@waldur/marketplace/types';

export const CategoriesBar = (props: CategoriesListType) => {
  const { state } = useCurrentStateAndParams();

  const isXLargeScreen = useMediaQuery({ maxWidth: 1300 });
  const isLargeScreen = useMediaQuery({ maxWidth: 1150 });
  const isSidebarClosed = useMediaQuery({ maxWidth: 991 });
  const isMediumScreen = useMediaQuery({ maxWidth: 768 });
  const isSmallScreen = useMediaQuery({ maxWidth: 500 });
  const isXSmallScreen = useMediaQuery({ maxWidth: 320 });

  if (isXSmallScreen) return null;

  const showCount = isSmallScreen
    ? 2
    : isMediumScreen
      ? 3
      : isSidebarClosed
        ? 5
        : isLargeScreen
          ? 4
          : isXLargeScreen
            ? 5
            : 6;

  return (
    <Card className="mb-6">
      <Card.Body className="py-6">
        {props.loading ? (
          <LoadingSpinner />
        ) : !props.loaded ? (
          <h3 className="text-center">
            {translate('Unable to load categories.')}
          </h3>
        ) : !props.items ? null : (
          <div className="d-flex justify-content-between gap-10">
            <Stack direction="horizontal" className="gap-10 scroll-x">
              {props.items.slice(0, showCount).map((category) => (
                <CategoryLink
                  key={category.uuid}
                  className="text-link text-nowrap"
                  category_uuid={category.uuid}
                >
                  {category.title}
                </CategoryLink>
              ))}
            </Stack>
            <Link
              state={state.name}
              params={{ group: 'all' }}
              className="text-link"
            >
              {translate('More')}...
            </Link>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
