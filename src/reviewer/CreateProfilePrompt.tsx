import { FC } from 'react';
import { reviewerProfilesMe } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const CreateProfilePrompt: FC = () => {
  const { mutate, isPending: isCreating } = useManagedMutation<any, any, void>({
    mutationFn: () => reviewerProfilesMe(),
    successMessage: translate('Reviewer profile created.'),
    errorMessage: translate('Unable to create reviewer profile.'),
    invalidateQueries: [{ queryKey: ['reviewer-profile-me'] }],
  });

  return (
    <div className="card card-bordered">
      <div className="card-body text-center py-8">
        <h3 className="mb-4">
          {translate('You do not have a reviewer profile yet.')}
        </h3>
        <p className="text-quaternary mb-4">
          {translate(
            'Create a reviewer profile to manage your affiliations, expertise, and publications for proposal reviews.',
          )}
        </p>
        <BaseButton
          variant="primary"
          onClick={() => mutate()}
          disabled={isCreating}
          disabledReason={translate('Creating...')}
          label={
            isCreating
              ? translate('Creating...')
              : translate('Create reviewer profile')
          }
        />
      </div>
    </div>
  );
};
