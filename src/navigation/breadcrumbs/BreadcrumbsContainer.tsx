import * as React from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { ngInjector } from '@waldur/core/services';

import { Breadcrumbs } from './Breadcrumbs';
import { Item } from './types';

export const BreadcrumbsContainer = () => {
  const [items, setItems] = React.useState<Item[]>([]);
  const [activeItem, setActiveItem] = React.useState<string>();
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');

  function refresh() {
    setItems(BreadcrumbsService.items);
    setActiveItem(BreadcrumbsService.activeItem);
  }

  useEffectOnce(() => {
    refresh();
    return BreadcrumbsService.listen(refresh);
  });

  return <Breadcrumbs items={items} activeItem={activeItem} />;
};
