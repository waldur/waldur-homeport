import { FunctionComponent, useMemo } from 'react';
import { Stack } from 'react-bootstrap';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { getStartingPrice } from '@waldur/marketplace/details/plan/utils';
import { Category, Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

interface OwnProps {
  offering: Offering;
  category: Category;
}

export const PublicOfferingDetailsHero: FunctionComponent<OwnProps> = (
  props,
) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const startingPrice = useMemo(() => {
    return getStartingPrice(props.offering);
  }, [props.offering]);

  return (
    <>
      <PublicDashboardHero
        asHero
        logo={props.category.icon}
        logoAlt={props.category.title}
        smallLogo={props.offering.thumbnail}
        backgroundImage={props.offering.image}
        title={
          <>
            <h3>{props.offering.name}</h3>
            <h5 className="fw-bold">
              By{' '}
              <Link
                state="marketplace-service-provider.details"
                params={{ uuid: props.offering.customer_uuid }}
                className="text-decoration-underline text-dark text-hover-primary fs-7 mb-2"
              >
                {props.offering.customer_name}
              </Link>
            </h5>
          </>
        }
        quickBody={
          <div className="bg-gray-200 h-100 p-4">
            <table className="text-gray-600 w-100 fs-8">
              <tbody>
                <tr>
                  <th className="text-end p-1">{translate('Category')}</th>
                  <td className="p-1">{props.category.title}</td>
                </tr>
                {showExperimentalUiComponents && (
                  <tr>
                    <th className="text-end p-1">{translate('Version')}</th>
                    <td className="p-1">5.2.1</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        }
      >
        <div className="d-flex justify-content-between align-items-end">
          <div>
            {showExperimentalUiComponents && (
              <Stack direction="horizontal" gap={4}>
                <span className="fw-bold">{translate('Components')}:</span>
                <i className="fa fa-microchip"></i>
                <i className="fa fa-archive"></i>
                <i className="fa fa-gears"></i>
              </Stack>
            )}
          </div>
          <div className="text-end">
            <div className="text-gray-600 fs-7 fw-bold">Starting at</div>
            <div className="text-dark fs-2 fw-bolder">
              {defaultCurrency(startingPrice)}
            </div>
          </div>
        </div>
      </PublicDashboardHero>
    </>
  );
};
