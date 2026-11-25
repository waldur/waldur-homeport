import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { featureRulesDestroy, featureRulesList } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { getAllPages } from '@/core/api';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { FEATURE_RULES_QUERY_KEY } from './utils';

/**
 * Rules that no longer have any effect: their feature stopped being
 * user-scoped or left the code, or their micro-app lost its setting. Nothing
 * else on the Features page shows them, since their feature has no Audience
 * button any more; if the scope came back, they would quietly apply again.
 */
export const OrphanedRulesNotice: FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const { data, refetch } = useQuery({
    queryKey: [...FEATURE_RULES_QUERY_KEY, 'orphaned'],
    queryFn: () =>
      getAllPages((page) =>
        featureRulesList({ query: { orphaned: true, page, page_size: 100 } }),
      ),
  });
  const keys = useMemo(
    () => [...new Set((data ?? []).map((rule) => rule.feature_key))].sort(),
    [data],
  );
  const remove = useManagedMutation<any, any, void>({
    mutationFn: () =>
      Promise.all(
        (data ?? []).map((rule) =>
          featureRulesDestroy({ path: { uuid: rule.uuid } }),
        ),
      ),
    refetch: async () => {
      await refetch();
    },
    invalidateQueries: [{ queryKey: FEATURE_RULES_QUERY_KEY }],
    closeModal: false,
    confirmation: {
      title: translate('Delete rules without effect'),
      body: translate(
        'Delete the {count} rules for {keys}? They cannot be restored.',
        { count: data?.length ?? 0, keys: keys.join(', ') },
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('Rules without effect have been deleted.'),
    errorMessage: translate('Unable to delete the rules.'),
  });

  if (!data?.length) return null;
  return (
    <AlertItem
      variant="warning"
      type="floating"
      className="mb-4"
      data-testid="orphaned-feature-rules"
      title={translate('{count} feature rules have no effect', {
        count: data.length,
      })}
      body={translate(
        'They target {keys}: features that can no longer be turned on for selected users, or micro-apps without a setting.',
        { keys: keys.join(', ') },
      )}
      actions={
        canEdit ? (
          <BaseButton
            variant="danger"
            size="sm"
            label={translate('Delete them')}
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
            tooltip={
              remove.isPending ? translate('Deleting the rules…') : undefined
            }
          />
        ) : null
      }
    />
  );
};
