import { LockSimple, QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { PublicOfferingDetails } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import Placeholder from '@waldur/images/logo_w.svg';
import { OfferingDetailsLink } from '@waldur/marketplace/links/OfferingDetailsLink';
import { TagBadges } from '@waldur/marketplace/tags/TagBadges';
import { wrapTooltip } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { isOfferingRestrictedToProject } from '../offerings/utils';

import './OfferingCard.scss';
import { DeployButton } from './DeployButton';
import { getOfferingImage } from './getOfferingImage';
import { ViewOfferingButton } from './ViewOfferingButton';

interface OfferingCardProps {
  offering: PublicOfferingDetails;
  className?: string;
}

export const OfferingCard: FunctionComponent<OfferingCardProps> = (props) => {
  const user = useSelector(getUser);
  const { isRestricted, isAllowed } = isOfferingRestrictedToProject(
    props.offering,
    user,
  );

  // Check if offering is inaccessible based on visibility mode
  const visibilityMode =
    ENV.plugins.WALDUR_CORE.RESTRICTED_OFFERING_VISIBILITY_MODE || 'show_all';
  const isInaccessible =
    visibilityMode === 'show_restricted_disabled' &&
    (props.offering as any).is_accessible === false;

  // Determine tooltip message
  const getTooltipMessage = () => {
    if (props.offering.state === 'Paused') {
      return (
        props.offering.paused_reason ||
        translate('Requesting of new resources has been temporarily paused')
      );
    }
    if (isInaccessible) {
      return translate(
        'This offering is restricted. Contact your organization admin for access.',
      );
    }
    return undefined;
  };

  const renderFooter = () => {
    // For inaccessible offerings (show_restricted_disabled mode)
    if (isInaccessible) {
      return (
        <div className="d-flex justify-content-between align-items-center gap-4">
          <Tip
            id={`tip-inaccessible-${props.offering.uuid}`}
            label={translate(
              'This offering is restricted. Contact your organization admin for access.',
            )}
          >
            <LockSimple size={20} className="text-muted" weight="bold" />
          </Tip>
          <div className="flex-grow-1 d-flex justify-content-end gap-2">
            <DeployButton offering={props.offering} disabled />
            <ViewOfferingButton offering={props.offering} />
          </div>
        </div>
      );
    }

    // For non-restricted offerings
    if (!isRestricted) {
      return (
        <div className="d-flex justify-content-end align-items-center gap-2">
          <DeployButton offering={props.offering} />
          <ViewOfferingButton offering={props.offering} />
        </div>
      );
    }

    // For restricted offerings (non-shared)
    return (
      <div className="d-flex justify-content-between align-items-center gap-4">
        <Tip
          id={`tip-restricted-${props.offering.uuid}`}
          label={
            props.offering.project_name
              ? translate(
                  'Offering is restricted to {project} in {organization}',
                  {
                    project: props.offering.project_name,
                    organization: props.offering.customer_name,
                  },
                )
              : translate('Offering is restricted to {organization}', {
                  organization: props.offering.customer_name,
                })
          }
        >
          <QuestionIcon size={20} className="text-muted ms-1" weight="bold" />
        </Tip>
        <div className="flex-grow-1 d-flex justify-content-end gap-2">
          <DeployButton offering={props.offering} disabled={!isAllowed} />
          <ViewOfferingButton offering={props.offering} disabled={!isAllowed} />
        </div>
      </div>
    );
  };

  return wrapTooltip(
    getTooltipMessage(),
    <OfferingDetailsLink
      offering_uuid={props.offering.uuid}
      className={classNames(props.className, 'offering-card', {
        disabled: props.offering.state !== 'Active' || isInaccessible,
      })}
      disabled={!isAllowed && !isInaccessible}
    >
      <ModelCard1
        title={props.offering.name}
        subtitle={
          !isRestricted
            ? props.offering.customer_name
            : [props.offering.customer_name, props.offering.project_name]
                .filter(Boolean)
                .join(' - ')
        }
        clickable
        logo={props.offering.thumbnail}
        image={getOfferingImage(props.offering)}
        imageCover={Boolean(props.offering.image)}
        placeholder={
          <span className="svg-icon svg-icon-5tx svg-icon-dark">
            <Placeholder className="mh-85px" />
          </span>
        }
        body={<TagBadges tags={props.offering.tags} />}
        footer={renderFooter()}
      />
    </OfferingDetailsLink>,
  );
};
