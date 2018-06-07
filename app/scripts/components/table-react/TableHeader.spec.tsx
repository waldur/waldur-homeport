import { shallow } from 'enzyme';
import * as React from 'react';

import TableHeader from './TableHeader';

import { renderFieldOrDash } from './utils';

const FullNameField = ({ row }) => (
  <span>{renderFieldOrDash(row.full_name)}</span>
);

const EmailField = ({ row }) => (
  <span>{renderFieldOrDash(row.email)}</span>
);

const PhoneNumberField = ({ row }) => (
  <span>{renderFieldOrDash(row.phone_number)}</span>
);

const renderWrapper = props => shallow(
  <TableHeader
    columns={props.columns}
    currentSorting={props.currentSorting}/>);

describe('TableHeader', () => {
  it('should render TableHeader with sorting icons where required', () => {
    const currentSorting = {mode: '', field: null};
    const columns = [
      {
        title: 'Full name',
        render: FullNameField,
      },
      {
        title: 'Email',
        render: EmailField,
        orderField: 'email',
      },
      {
        title: 'Phone number',
        render: PhoneNumberField,
        orderField: 'phone_number',
      },
    ];
    const wrapper = renderWrapper({columns, currentSorting});
    expect(wrapper.find('.fa-sort').length).toBe(2);
  });

  it('should render TableHeader without sorting icons at all', () => {
    const currentSorting = {mode: '', field: null};
    const columns = [
      {
        title: 'Full name',
        render: FullNameField,
      },
      {
        title: 'Email',
        render: EmailField,
      },
      {
        title: 'Phone number',
        render: PhoneNumberField,
      },
    ];
    const wrapper = renderWrapper({columns, currentSorting});
    expect(wrapper.find('.fa-sort').length).toBe(0);
  });

  it('should render TableHeader with ascending sorting icon for the column', () => {
    const currentSorting = {mode: 'asc', field: 'phone_number'};
    const columns = [
      {
        title: 'Full name',
        render: FullNameField,
      },
      {
        title: 'Email',
        render: EmailField,
      },
      {
        title: 'Phone number',
        render: PhoneNumberField,
        orderField: 'phone_number',
      },
    ];
    const wrapper = renderWrapper({columns, currentSorting});
    expect(wrapper.find('.fa-sort-asc').length).toBe(1);
  });

  it('should render TableHeader with descending sorting icon for the column', () => {
      const currentSorting = {mode: 'desc', field: 'phone_number'};
      const columns = [
          {
              title: 'Full name',
              render: FullNameField,
          },
          {
              title: 'Email',
              render: EmailField,
          },
          {
              title: 'Phone number',
              render: PhoneNumberField,
              orderField: 'phone_number',
          },
      ];
      const wrapper = renderWrapper({columns, currentSorting});
      expect(wrapper.find('.fa-sort-desc').length).toBe(1);
  });
});
