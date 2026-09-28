import { FC } from 'react';
import { Card } from 'react-bootstrap';
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
    <Card className="card-bordered">
      <Card.Body className="text-center py-10">
        <h3 className="mb-5">
          {translate('You do not have a reviewer profile yet.')}
        </h3>
        <p className="text-muted mb-5">
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
      </Card.Body>
    </Card>
  );
};
