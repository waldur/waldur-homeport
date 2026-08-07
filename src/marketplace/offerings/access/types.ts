import { Customer, Project } from 'waldur-js-client';

/**
 * Shared by the hook that builds the routes and the dialog that renders them.
 *
 * Kept in their own module because the hook lazy-imports the dialog while the
 * dialog needs these types: importing them back from the hook makes a cycle,
 * which the dependency check rejects.
 */
export type AccessMethodKey = 'order' | 'apply';

/** Where an order should land, when the dialog asked for it. */
export interface OrderTarget {
  customer?: Pick<Customer, 'uuid'>;
  project?: Pick<Project, 'uuid'>;
}

export interface AccessMethod {
  key: AccessMethodKey;
  label: string;
  description: string;
  /** Set when the method is offered but cannot be used right now. */
  disabledReason?: string;
  run(target?: OrderTarget): void;
}
