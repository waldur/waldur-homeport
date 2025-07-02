import { FC } from 'react';
import { Resource } from 'waldur-js-client';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { OptionValue } from './OptionValue';
import { UpdateResourceOptionButton } from './UpdateResourceOptionButton';

interface ResourceOptionsCardProps {
  resource: Resource;
  offering: Offering;
  refetch?;
  isLoading?;
}

export const ResourceOptionsCard: FC<ResourceOptionsCardProps> = (props) => {
  const resourceOptions = props.offering.resource_options;
  if (!resourceOptions?.order?.length) {
    return (
      <div className="justify-content-center row">
        <div className="col-sm-4">
          <p className="text-center">
            {translate("Resource doesn't have options.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormTable.Card
      title={translate('Options')}
      refetch={props.refetch}
      loading={props.isLoading}
      className="card-bordered"
    >
      <FormTable>
        {resourceOptions.order?.map((key) => {
          const option = {
            ...resourceOptions.options[key],
            name: key,
          };
          return (
            <FormTable.Item
              key={key}
              label={option.label}
              value={
                <OptionValue
                  option={option}
                  value={props.resource.options && props.resource.options[key]}
                />
              }
              description={option.help_text}
              actions={
                <UpdateResourceOptionButton
                  resource={props.resource}
                  offering={props.offering}
                  refetch={props.refetch}
                  option={option}
                />
              }
            />
          );
        })}
      </FormTable>
    </FormTable.Card>
  );
};
