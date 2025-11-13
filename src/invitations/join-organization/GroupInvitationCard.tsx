import classNames from 'classnames';
import { FC, useCallback } from 'react';
import { Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { GroupInvitation } from 'waldur-js-client';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { TruncatedDescription } from '@waldur/core/TruncatedDescription';
import { getAbbreviation } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { BoxRadioField } from '@waldur/marketplace/deploy/steps/BoxRadioField';
import { openModalDialog } from '@waldur/modal/actions';

const GroupInvitationDetails = lazyComponent(() =>
  import('./GroupInvitationDetails').then((module) => ({
    default: module.GroupInvitationDetails,
  })),
);

export const GroupInvitationCard: FC<{ row: GroupInvitation }> = ({
  row: invitation,
}) => {
  const dispatch = useDispatch();
  const openDetailsModal = useCallback(
    (event) => {
      event.stopPropagation();
      dispatch(
        openModalDialog(GroupInvitationDetails, {
          resolve: { invitation },
        }),
      );
    },
    [invitation, dispatch],
  );

  const description = invitation.scope_description;

  return (
    <Field
      name="invitation"
      validate={required}
      component={BoxRadioField as any}
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
  );
};
