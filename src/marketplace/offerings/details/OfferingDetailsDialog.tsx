import { CaretRightIcon } from '@phosphor-icons/react';
import React from 'react';
import { useAsync } from 'react-use';
import {
  marketplaceCategoriesRetrieve,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { OfferingTabsComponent } from '@waldur/marketplace/details/OfferingTabsComponent';
import { OfferingDetailsLink } from '@waldur/marketplace/links/OfferingDetailsLink';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { Field } from '@waldur/resource/summary';

interface OfferingDetailsDialogProps {
  resolve: { offering: PublicOfferingDetails; concealBillingInfo?: boolean };
}

async function loadData(
  offering: PublicOfferingDetails,
  concealBillingInfo: boolean,
) {
  const category = await marketplaceCategoriesRetrieve({
    path: { uuid: offering.category_uuid },
  }).then((response) => response.data);
  const sections = category.sections;
  const tabs = getTabs({ offering, sections, concealBillingInfo });
  return {
    offering,
    tabs,
  };
}

export const OfferingDetailsDialog: React.FC<OfferingDetailsDialogProps> = (
  props,
) => {
  const { loading, error, value } = useAsync(
    () => loadData(props.resolve.offering, props.resolve.concealBillingInfo),
    [props.resolve.offering],
  );
  return (
    <ModalDialog
      title={translate('Offering details')}
      closeButton
      bodyClassName="h-500px"
      footer={
        <OfferingDetailsLink
          offering_uuid={props.resolve.offering.uuid}
          className="btn btn-secondary btn-icon-right"
        >
          {translate('More details')}
          <span className="svg-icon svg-icon-4">
            <CaretRightIcon weight="bold" />
          </span>
        </OfferingDetailsLink>
      }
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <h3>{translate('Unable to load offering details.')}</h3>
      ) : (
        <>
          <Field
            label={translate('Name')}
            value={value.offering.name}
            valueClass="text-gray-700"
          />
          <Field
            label={translate('Service provider')}
            value={value.offering.customer_name}
            valueClass="text-gray-700"
          />
          <Field
            label={translate('Parent offering')}
            value={value.offering.parent_name}
            valueClass="text-gray-700"
          />
          <OfferingTabsComponent tabs={value.tabs} />
        </>
      )}
    </ModalDialog>
  );
};
