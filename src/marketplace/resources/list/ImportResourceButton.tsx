import * as React from 'react';

import { ENV, ngInjector } from '@waldur/core/services';
import ActionButton from '@waldur/table-react/ActionButton';

interface OwnProps {
  category_uuid: string;
}

export class ImportResourceButton extends React.Component<OwnProps> {
  action = undefined;

  constructor(props) {
    super(props);
    const TableExtensionService = ngInjector.get('TableExtensionService');
    const conf = ENV.plugins.WALDUR_MARKETPLACE_OPENSTACK;
    const mapping = {
      [conf.INSTANCE_CATEGORY_UUID]: 'resource-vms-list',
      [conf.VOLUME_CATEGORY_UUID]: 'resource-volumes-list',
      [conf.TENANT_CATEGORY_UUID]: 'resource-private-clouds-list',
    };
    const table = mapping[this.props.category_uuid];
    if (table) {
      const actions = TableExtensionService.getTableActions(table);
      if (actions.length === 1) {
        this.action = actions[0];
      }
    }
  }

  render() {
    if (!this.action) {
      return null;
    }
    return (
      <ActionButton
        action={this.action.callback}
        icon="fa fa-plus"
        title={this.action.title}
        disabled={this.action.disabled}
      />
    );
  }
}
