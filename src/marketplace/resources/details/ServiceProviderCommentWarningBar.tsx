import { WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { truncate } from 'lodash-es';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PublicOfferingDetails,
  marketplaceOfferingUsersList,
} from 'waldur-js-client';

import { FeaturedIcon } from '@waldur/core/FeaturedIcon';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { ServiceProviderCommentModal } from './ServiceProviderCommentModal';

interface ServiceProviderCommentWarningBarProps {
  offering: PublicOfferingDetails;
}

export const ServiceProviderCommentWarningBar: FC<
  ServiceProviderCommentWarningBarProps
> = ({ offering }) => {
  const user = useSelector(getUser);
  const dispatch = useDispatch();

  const { data: offeringUser, isLoading } = useQuery({
    queryKey: ['fetchOfferingUserForComment', user?.uuid, offering?.uuid],
    queryFn: () =>
      user?.uuid && offering?.uuid
        ? marketplaceOfferingUsersList({
            query: {
              user_uuid: user.uuid,
              offering_uuid: [offering.uuid],
              field: ['uuid', 'service_provider_comment'],
            },
          }).then((response) => response.data[0] || null)
        : null,
    enabled: !!(user?.uuid && offering?.uuid),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading || !offeringUser || !offeringUser.service_provider_comment) {
    return null;
  }

  const comment = offeringUser.service_provider_comment;
  const maxLength = 100;
  const isLongComment = comment.length > maxLength;
  const displayComment = isLongComment
    ? truncate(comment, { length: maxLength })
    : comment;

  const callback = () =>
    dispatch(
      openModalDialog(ServiceProviderCommentModal, {
        dialogClassName: 'modal-dialog-centered',
        comment: comment,
        size: 'xl',
      }),
    );

  return (
    <div className="offering-users-warning-bar">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
            <FeaturedIcon
              IconComponent={WarningCircleIcon}
              variant="warning"
              size="sm"
            />
            <span className="ms-2">
              <strong>{translate('Service provider message')}:</strong>{' '}
              {displayComment}
              {isLongComment && (
                <>
                  {' '}
                  <button
                    type="button"
                    onClick={callback}
                    className="btn btn-link p-0 text-decoration-underline border-0"
                  >
                    {translate('Show more')}
                  </button>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
