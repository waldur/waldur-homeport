import { useQuery } from '@tanstack/react-query';
import { truncate } from 'lodash-es';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PublicOfferingDetails,
  marketplaceOfferingUsersList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { ResourceWarningBar } from './ResourceWarningBar';
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
              field: [
                'uuid',
                'service_provider_comment',
                'service_provider_comment_url',
              ],
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
        commentUrl: offeringUser.service_provider_comment_url,
        size: 'sm',
      }),
    );

  return (
    <ResourceWarningBar>
      <span>
        <strong>{translate('Service provider message')}:</strong>{' '}
        {displayComment}
        {isLongComment && (
          <>
            {' '}
            <button
              type="button"
              onClick={callback}
              className="resource-warning-bar__show-more"
            >
              {translate('Show more')}
            </button>
          </>
        )}
      </span>
    </ResourceWarningBar>
  );
};
