import { Check, Spinner, Trash, X } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { CustomerFeatures } from '@waldur/FeaturesEnums';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { getNativeNameVisible } from '@waldur/store/config';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { SetLocationButton } from '../list/SetLocationButton';

import { CustomerMediaPanel } from './CustomerMediaPanel';
import { FieldEditButton } from './FieldEditButton';
import { CustomerEditPanelProps } from './types';

export const CustomerDetailsPanel: FC<CustomerEditPanelProps> = (props) => {
  const nativeNameVisible = useSelector(getNativeNameVisible);

  const dispatch = useDispatch();
  const { mutate: removeLocation, isLoading: isRemovingLocation } = useMutation(
    async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate('Are you sure you want to remove the location?'),
        );
      } catch {
        return;
      }

      try {
        await props.callback({ latitude: null, longitude: null }, dispatch);
        dispatch(showSuccess(translate('Location has been removed.')));
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to remove the location.')),
        );
      }
    },
  );

  const detailsRows = useMemo(
    () =>
      [
        {
          label: translate('Name'),
          key: 'name',
          value: props.customer.name,
        },
        nativeNameVisible
          ? {
              label: translate('Native name'),
              key: 'native_name',
              value: props.customer.native_name,
            }
          : null,
        {
          label: translate('Abbreviation'),
          key: 'abbreviation',
          value: props.customer.abbreviation,
        },
        {
          label: translate('Organization group'),
          key: 'organization_group',
          value: [
            props.customer.organization_group_parent_name,
            props.customer.organization_group_name,
          ]
            .filter(Boolean)
            .join(' ➔ '),
        },
        isFeatureVisible(CustomerFeatures.show_domain)
          ? {
              label: translate('Domain name'),
              key: 'domain',
              value: props.customer.domain,
            }
          : null,
        ENV.plugins.WALDUR_CORE.ORGANIZATION_SUBNETS_VISIBLE
          ? {
              label: translate('Subnets'),
              key: 'access_subnets',
              value: props.customer.access_subnets,
            }
          : null,
        {
          label: translate('Address'),
          key: 'address',
          value: props.customer.address,
        },
        {
          label: translate('Postal code'),
          key: 'postal',
          value: props.customer.postal,
        },
      ].filter(Boolean),
    [props.customer, nativeNameVisible],
  );

  const identifiersRows = useMemo(
    () => [
      {
        label: translate('Registration code'),
        key: 'registration_code',
        value: props.customer.registration_code,
      },
      {
        label: translate('Agreement number'),
        key: 'agreement_number',
        value: props.customer.agreement_number,
      },
      {
        label: translate('Sponsor number'),
        key: 'sponsor_number',
        value: props.customer.sponsor_number,
      },
    ],
    [props.customer],
  );

  return (
    <>
      <CustomerMediaPanel {...props} />

      <FormTable.Card
        title={translate('Details')}
        className="card-bordered mb-7"
      >
        <FormTable>
          {detailsRows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              value={row.value || 'N/A'}
              actions={
                <FieldEditButton
                  customer={props.customer}
                  name={row.key}
                  callback={props.callback}
                />
              }
            />
          ))}
          <FormTable.Item
            label={translate('Location')}
            value={
              props.customer.latitude && props.customer.longitude ? (
                <Check weight="bold" className="text-info" />
              ) : (
                <X weight="bold" className="text-danger" />
              )
            }
            actions={
              <>
                <ActionButton
                  iconNode={
                    !isRemovingLocation ? (
                      <Trash weight="bold" className="text-danger" />
                    ) : (
                      <Spinner className="fa-spin" />
                    )
                  }
                  action={removeLocation}
                  variant="secondary"
                  className="btn-sm btn-icon me-3"
                />
                <SetLocationButton customer={props.customer} />
              </>
            }
          />
        </FormTable>
      </FormTable.Card>

      <FormTable.Card
        title={translate('Identifiers')}
        className="card-bordered"
      >
        <FormTable>
          <FormTable.Item
            label={translate('UUID')}
            value={props.customer.uuid || 'N/A'}
          />
          <FormTable.Item
            label={translate('Slug')}
            value={props.customer.slug}
          />
          {identifiersRows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              value={row.value || 'N/A'}
              actions={
                <FieldEditButton
                  customer={props.customer}
                  name={row.key}
                  callback={props.callback}
                />
              }
            />
          ))}
        </FormTable>
      </FormTable.Card>
    </>
  );
};
