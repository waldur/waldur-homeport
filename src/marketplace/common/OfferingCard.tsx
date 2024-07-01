import { Question } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { ModelCard1 } from '@waldur/core/ModelCard1';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import Placeholder from '@waldur/images/logo_w.svg';
import { wrapTooltip } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

import { OfferingLink } from '../links/OfferingLink';
import { isOfferingRestrictedToProject } from '../offerings/utils';
import { Offering } from '../types';

import './OfferingCard.scss';

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
    <OfferingLink
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
        logo={props.offering.thumbnail}
        image={props.offering.image}
        placeholder={
          <span className="svg-icon svg-icon-5tx svg-icon-dark">
            <Placeholder className="mh-90px" />
          </span>
        }
        footer={
          !isRestricted ? (
            <div className="d-flex justify-content-end gap-4">
              <OfferingLink
                offering_uuid={props.offering.uuid}
                className="btn btn-flush text-btn"
              >
                {translate('Deploy')}
              </OfferingLink>
              <Link
                state="public-offering.marketplace-public-offering"
                params={{
                  uuid: props.offering.uuid,
                }}
                className="btn btn-flush text-anchor"
              >
                {translate('View offering')}
              </Link>
            </div>
          ) : (
            <div className="d-flex justify-content-between gap-4">
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
                  <Question size={20} className="text-muted ms-1" />
                </Tip>
              )}
              <div className="flex-grow-1 d-flex justify-content-end gap-4">
                <OfferingLink
                  offering_uuid={props.offering.uuid}
                  className="btn btn-flush text-btn"
                  disabled={!isAllowed}
                >
                  {translate('Deploy')}
                </OfferingLink>
                {isAllowed ? (
                  <Link
                    state="public-offering.marketplace-public-offering"
                    params={{
                      uuid: props.offering.uuid,
                    }}
                    className="btn btn-flush text-anchor"
                  >
                    {translate('View offering')}
                  </Link>
                ) : (
                  <button className="btn btn-flush text-anchor" disabled>
                    {translate('View offering')}
                  </button>
                )}
              </div>
            </div>
          )
        }
      />
    </OfferingLink>,
  );
};
