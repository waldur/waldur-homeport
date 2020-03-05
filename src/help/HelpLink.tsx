import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { connectAngularComponent } from '@waldur/store/connect';

import HelpRegistry from './help-registry';

interface HelpLinkProps {
  name: string;
  type: string;
  children: any;
}

const hasHelp = (type: string, name: string) =>
  HelpRegistry.hasItem(type, name);

export const HelpLink = ({ name, type, children }: HelpLinkProps) =>
  hasHelp(type, name) ? (
    <Link state="help.details" params={{ name, type }} target="_blank">
      {children}
    </Link>
  ) : (
    children
  );

export default connectAngularComponent(HelpLink);
