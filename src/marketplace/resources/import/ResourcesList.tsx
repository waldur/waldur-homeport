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

const toggleElement = (element, list) =>
  list.includes(element) ? [
    ...list.slice(0, list.indexOf(element)),
    ...list.slice(list.indexOf(element) + 1),
  ] : [
    ...list,
    element,
  ];

const ResourceRow = ({ resource, value, onChange, offering, plans, setPlans }) => (
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
        onChange={() => onChange(toggleElement(resource, value))}
      />
    </td>
    <td>
      <Select
        placeholder={translate('Select plan')}
        labelKey="name"
        valueKey="uuid"
        options={offering.plans}
        value={plans[resource.backend_id]}
        onChange={plan => setPlans({...plans, [resource.backend_id]: plan})}
      />
    </td>
  </tr>
);

export const ResourcesList = ({ resources, offering, value, onChange, plans, setPlans }) => (
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
          onChange={onChange}
          plans={plans}
          setPlans={setPlans}
        />
      ))}
    </tbody>
  </table>
);
