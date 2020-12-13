import { lazyComponent } from '@waldur/core/lazyComponent';

export const LazyResourceActionDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceActionDialog" */ '@waldur/resource/actions/ResourceActionDialog'
    ),
  'ResourceActionDialog',
);
