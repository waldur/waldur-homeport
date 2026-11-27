import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { marketplaceOfferingTemplatesCount } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { fetchResultCount } from '@/core/api';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { PUBLISHED_TEMPLATES_QUERY } from './TemplateStep';

const CreateFromTemplateDialog = lazyComponent(() =>
  import('./CreateFromTemplateDialog').then((module) => ({
    default: module.CreateFromTemplateDialog,
  })),
);

/**
 * Shown at the top of the blank-offering dialog, before any field is
 * filled in, when a published template exists: a template fixes the type and
 * sets up components, plans and the site agent configuration as well, so it
 * is the first choice rather than an afterthought of the type picked.
 */
export const CreateFromTemplateHint: FC<{
  fetch?(): void;
  showProvider?: boolean;
}> = ({ fetch, showProvider }) => {
  const { openDialog, closeDialog } = useModal();
  const { data: count } = useQuery({
    queryKey: ['offering-templates-published-count', PUBLISHED_TEMPLATES_QUERY],
    queryFn: () =>
      marketplaceOfferingTemplatesCount({
        query: PUBLISHED_TEMPLATES_QUERY,
      }).then(fetchResultCount),
    refetchOnWindowFocus: false,
  });
  if (!count) {
    return null;
  }
  return (
    <AlertItem
      type="floating"
      variant="info"
      className="mb-6"
      title={translate('Start from a template')}
      body={
        <>
          {translate(
            'An offering template also sets up components, plans and the site agent configuration, and checks them before the offering is created.',
          )}
          <div className="mt-2">
            <BaseButton
              variant="text-primary"
              label={translate('Create from template')}
              data-testid="create-from-template"
              onClick={() => {
                closeDialog();
                openDialog(CreateFromTemplateDialog, {
                  resolve: { fetch, showProvider },
                  size: 'lg',
                });
              }}
            />
          </div>
        </>
      }
    />
  );
};
