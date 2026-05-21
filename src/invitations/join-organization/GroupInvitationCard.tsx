import classNames from 'classnames';
import { FC, useCallback } from 'react';
import { Field } from 'react-final-form';
import { GroupInvitation } from 'waldur-js-client';

import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { lazyComponent } from '@/core/lazyComponent';
import { TruncatedDescription } from '@/core/TruncatedDescription';
import { getAbbreviation } from '@/core/utils';
import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { BoxRadioField } from '@/marketplace/deploy/steps/BoxRadioField';
import { useModal } from '@/modal/actions';

const GroupInvitationDetails = lazyComponent(() =>
  import('./GroupInvitationDetails').then((module) => ({
    default: module.GroupInvitationDetails,
  })),
);

export const GroupInvitationCard: FC<{ row: GroupInvitation }> = ({
  row: invitation,
}) => {
  const { openDialog } = useModal();
  const openDetailsModal = useCallback(
    (event) => {
      event.stopPropagation();
      openDialog(GroupInvitationDetails, {
        resolve: { invitation },
      });
    },
    [invitation],
  );

  const description = invitation.custom_text || invitation.scope_description;

  return (
    <Field
      name="invitation"
      validate={required}
      render={({ input, meta }) => (
        <BoxRadioField
          input={input}
          meta={meta}
          ellipsisTitle
          choices={[
            {
              label: invitation.scope_name,
              value: invitation,
              metadata: (
                <div
                  className={classNames(
                    'fs-6 fw-semibold text-muted h-80px',
                    !description && 'fst-italic',
                  )}
                >
                  {description ? (
                    <TruncatedDescription
                      text={description}
                      max={70}
                      onClick={openDetailsModal}
                    />
                  ) : (
                    translate('No description available')
                  )}
                </div>
              ),
              image: invitation.scope_image ? (
                <img
                  src={invitation.scope_image}
                  alt="invitation logo"
                  className="rounded"
                  style={{ width: '24px', height: '24px' }}
                />
              ) : undefined,
            },
          ]}
          vertical
          alignTop
          hasOptions={false}
          hoverable
          required
          imagePlaceholder={
            <ImagePlaceholder width="24px" height="24px" circle>
              {getAbbreviation(invitation.customer_name, 2)}
            </ImagePlaceholder>
          }
        />
      )}
    />
  );
};
