import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { reviewerProfilesMe } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const CreateProfilePrompt: FC = () => {
  const { mutate, isPending: isCreating } = useManagedMutation<any, any, void>({
    mutationFn: () => reviewerProfilesMe({ body: {} }),
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
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => mutate()}
          disabled={isCreating}
        >
          {isCreating
            ? translate('Creating...')
            : translate('Create reviewer profile')}
        </button>
      </Card.Body>
    </Card>
  );
};
