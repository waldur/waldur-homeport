import * as classNames from 'classnames';
import * as React from 'react';
import Select from 'react-select';

import { translate } from '@waldur/i18n';
import { ResourceIcon } from '@waldur/resource/ResourceName';

const SelectResourceButton = ({ value, onChange }) => (
  <a className={classNames('btn btn-sm btn-outline',
      value ? 'btn-primary' : 'btn-default')} onClick={onChange}>
    {value ? translate('Selected') : translate('Select')}
  </a>
);

const ResourceRow = ({ resource, value, toggleResource, offering, plans, assignPlan }) => (
  <tr>
    <td>
      <p className="form-control-static">
        <ResourceIcon
          resource={{name: resource.name, uuid: resource.backend_id, resource_type: resource.type}}
        />
      </p>
    </td>
    <td>
      {resource.backend_id}
    </td>
    <td>
      <SelectResourceButton
        value={value.includes(resource)}
        onChange={() => toggleResource(resource)}
      />
    </td>
    <td>
      <Select
        placeholder={translate('Select plan')}
        labelKey="name"
        valueKey="uuid"
        options={offering.plans}
        value={plans[resource.backend_id]}
        onChange={plan => assignPlan(resource, plan)}
      />
    </td>
  </tr>
);

export const ResourcesList = ({ resources, offering, value, toggleResource, plans, assignPlan }) => (
  <table className="table">
    <thead>
      <tr>
        <th>{translate('Name')}</th>
        <th>{translate('Backend ID')}</th>
        <th>{translate('Actions')}</th>
        <th className="col-sm-2">{translate('Plan')}</th>
      </tr>
    </thead>
    <tbody>
      {resources.map((resource, index) => (
        <ResourceRow
          key={index}
          resource={resource}
          offering={offering}
          value={value}
          toggleResource={toggleResource}
          plans={plans}
          assignPlan={assignPlan}
        />
      ))}
    </tbody>
  </table>
);
