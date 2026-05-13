import { TextColumnsIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ArticleCodeUpdateDialog = lazyComponent(() =>
  import('../article-codes/ArticleCodeUpdateDialog').then((module) => ({
    default: module.ArticleCodeUpdateDialog,
  })),
);

interface UpdateArticleCodesActionProps {
  refetch(): void;
}

export const UpdateArticleCodesAction: FC<UpdateArticleCodesActionProps> = ({
  refetch,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Update article codes')}
      action={() => {
        openDialog(ArticleCodeUpdateDialog, {
          resolve: { refetch },
          size: 'xl',
        });
      }}
      iconNode={<TextColumnsIcon weight="bold" />}
      staff
    />
  );
};
