export const redirectToMarketplaceCategory = (
  router,
  organizationUuid: string,
  categoryUuid: string,
) =>
  router.stateService.go(
    'marketplace-category-customer',
    {
      uuid: organizationUuid,
      category_uuid: categoryUuid,
    },
    { reload: true },
  );
