import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ModelCard1 } from '@waldur/core/ModelCard1';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import Placeholder from '@waldur/images/logo_w.svg';
import { OfferingDetailsLink } from '@waldur/marketplace/links/OfferingDetailsLink';
import { wrapTooltip } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { isOfferingRestrictedToProject } from '../offerings/utils';
import { Offering } from '../types';

import './OfferingCard.scss';
import { DeployButton } from './DeployButton';
import { getOfferingImage } from './getOfferingImage';
import { ViewOfferingButton } from './ViewOfferingButton';

interface OfferingCardProps {
  offering: Offering;
  className?: string;
}

export const OfferingCard: FunctionComponent<OfferingCardProps> = (props) => {
  const user = useSelector(getUser);
  const { isRestricted, isAllowed } = isOfferingRestrictedToProject(
    props.offering,
    user,
  );

  return wrapTooltip(
    props.offering.state === 'Paused' &&
      (props.offering.paused_reason ||
        translate('Requesting of new resources has been temporarily paused')),
    <OfferingDetailsLink
      offering_uuid={props.offering.uuid}
      className={classNames(props.className, 'offering-card', {
        disabled: props.offering.state !== 'Active',
      })}
      disabled={!isAllowed}
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
        footer={
          !isRestricted ? (
            <div className="d-flex justify-content-end align-items-center gap-2">
              <DeployButton offering={props.offering} />
              <ViewOfferingButton offering={props.offering} />
            </div>
          ) : (
            <div className="d-flex justify-content-between align-items-center gap-4">
              {isRestricted && (
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
                  <QuestionIcon size={20} className="text-muted ms-1" />
                </Tip>
              )}
              <div className="flex-grow-1 d-flex justify-content-end gap-2">
                <DeployButton offering={props.offering} disabled={!isAllowed} />
                <ViewOfferingButton
                  offering={props.offering}
                  disabled={!isAllowed}
                />
              </div>
            </div>
          )
        }
      />
    </OfferingDetailsLink>,
  );
};
