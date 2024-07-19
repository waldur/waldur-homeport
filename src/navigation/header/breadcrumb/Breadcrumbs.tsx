import { useContext, useMemo } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { LayoutContext } from '@waldur/navigation/context';
import { IBreadcrumbItem } from '@waldur/navigation/types';

import { BreadcrumbItem } from './BreadcrumbItem';
import { DropdownBreadcrumbItem } from './DropdownBreadcrumbItem';
import { HiddenItemsPopover } from './HiddenItemsPopover';

/**
 * @example
 * input: [1, 2, 3, 5, 8, 9]
 * output: [[1, 2, 3], [5], [8, 9]]
 */
const groupConsecutiveNumbers = (arr: number[] = []): number[][] => {
  if (arr.length === 0) return [];

  const result = [];
  let tempGroup = [arr[0]];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1] + 1) {
      tempGroup.push(arr[i]);
    } else {
      result.push(tempGroup);
      tempGroup = [arr[i]];
    }
  }
  // To add last group
  result.push(tempGroup);
  return result;
};

export const Breadcrumbs = () => {
  const { breadcrumbs } = useContext(LayoutContext);

  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });
  const isXl = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.xl });
  const isXxl = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.xxl });

  const breadcrumbItems = useMemo<IBreadcrumbItem[]>(() => {
    const hiddenIndexes = [];
    breadcrumbs.forEach((item, i) => {
      if (!item.ellipsis || !isXxl) return item;
      if (isMd && ['md', 'xl', 'xxl'].includes(item.ellipsis)) {
        hiddenIndexes.push(i);
      } else if (isXl && ['xl', 'xxl'].includes(item.ellipsis)) {
        hiddenIndexes.push(i);
      } else if (isXxl && item.ellipsis === 'xxl') {
        hiddenIndexes.push(i);
      }
    });

    if (!hiddenIndexes.length) return breadcrumbs;

    const hiddenIndexesGroups = groupConsecutiveNumbers(hiddenIndexes);
    const hiddenPopovers = hiddenIndexesGroups.map((group, i) => {
      const items = group.map((index) => breadcrumbs[index]);
      return <HiddenItemsPopover key={i} items={items} />;
    });

    let groupPointer = 0;
    const shortenedBreadcrumbs = breadcrumbs.reduce<IBreadcrumbItem[]>(
      (acc, item, i) => {
        if (!hiddenIndexes.includes(i)) {
          acc.push(item);
        } else if (groupPointer < hiddenIndexesGroups.length) {
          const indexInGroup = hiddenIndexesGroups[groupPointer].indexOf(i);
          if (indexInGroup === 0) {
            acc.push({
              key: 'group-' + groupPointer,
              text: '...',
              dropdown: hiddenPopovers[groupPointer],
              hideDropdownArrow: true,
            });
            groupPointer++;
          }
        }
        return acc;
      },
      [],
    );

    return shortenedBreadcrumbs;
  }, [breadcrumbs, isMd, isXl, isXxl]);

  if (!breadcrumbs.length) {
    return null;
  }
  return (
    <Breadcrumb className="flex-grow-1">
      {breadcrumbItems.map((item) =>
        item.dropdown ? (
          <DropdownBreadcrumbItem key={item.key} item={item} />
        ) : (
          <BreadcrumbItem
            key={item.key}
            to={item.to}
            params={item.params}
            ellipsis={item.ellipsis}
            truncate={item.truncate}
            active={item.active}
            maxLength={item.maxLength}
          >
            {item.text}
          </BreadcrumbItem>
        ),
      )}
    </Breadcrumb>
  );
};
