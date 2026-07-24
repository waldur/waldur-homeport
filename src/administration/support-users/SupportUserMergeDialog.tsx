import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  SupportUser,
  supportUsersList,
  supportUsersMerge,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { formatJsxTemplate, translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const SupportUserMergeDialog = ({ resolve }) => {
  const keeper: SupportUser = resolve.keeper;
  const [selected, setSelected] = useState<string[]>([]);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['SupportUserSiblings', keeper.uuid],
    queryFn: async () => {
      // Duplicates share the same backend id and helpdesk name. Only the
      // backend id is sent as a query param: backend_name is an enum server
      // side, so a record from an unlisted helpdesk would be rejected. The
      // helpdesk is compared here instead.
      if (!keeper.backend_id) return [] as SupportUser[];
      const response = await supportUsersList({
        query: {
          backend_id: keeper.backend_id,
          page_size: 100,
        },
      });
      return (response.data ?? []).filter(
        (user) =>
          user.uuid !== keeper.uuid &&
          user.backend_name === keeper.backend_name,
      );
    },
  });

  const mergeMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      supportUsersMerge({
        path: { uuid: keeper.uuid },
        body: { source_users: selected },
      }),
    successMessage: translate('The support users have been merged.'),
    errorMessage: translate('Unable to merge support users.'),
    refetch: resolve.refetch,
  });

  const toggle = (uuid: string) =>
    setSelected((prev) =>
      prev.includes(uuid)
        ? prev.filter((item) => item !== uuid)
        : [...prev, uuid],
    );

  return (
    <ModalDialog
      title={translate('Merge duplicates into {name}', { name: keeper.name })}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            type="button"
            disabled={selected.length === 0 || mergeMutation.isPending}
            submitting={mergeMutation.isPending}
            onClick={() => mergeMutation.mutate()}
            label={translate('Merge')}
          />
        </>
      }
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : !keeper.backend_id ? (
        <p>
          {translate(
            'This support user has no backend ID, so it has no duplicates to merge.',
          )}
        </p>
      ) : candidates && candidates.length ? (
        <>
          <p>
            {translate(
              'Select the duplicate support users to merge into {name}. Their issues, comments and attachments will be re-pointed to it and the duplicates deleted.',
              { name: <strong>{keeper.name}</strong> },
              formatJsxTemplate,
            )}
          </p>
          <ul className="list-unstyled">
            {candidates.map((candidate) => (
              <li key={candidate.uuid} className="mb-2">
                <label className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(candidate.uuid)}
                    onChange={() => toggle(candidate.uuid)}
                  />
                  <span>
                    {candidate.name}
                    {candidate.user_full_name
                      ? ` — ${candidate.user_full_name}`
                      : ''}{' '}
                    ({translate('ID')}: {candidate.uuid.slice(0, 8)})
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>
          {translate('No duplicate support users found for this backend ID.')}
        </p>
      )}
    </ModalDialog>
  );
};
