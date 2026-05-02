import { marketplaceCategoriesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { Category } from '@/marketplace/types';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface CategoryDeleteActionProps {
  row: Category;
  refetch;
}

export const CategoryDeleteAction = (props: CategoryDeleteActionProps) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceCategoriesDestroy({ path: { uuid: props.row.uuid } }),
    successMessage: translate('Category has been deleted.'),
    errorMessage: translate('Unable to remove category.'),
    refetch: props.refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete the {title} category?',
        { title: <strong>{props.row.title}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
