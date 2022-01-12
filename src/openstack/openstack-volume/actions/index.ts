import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';

import { AttachAction } from './AttachAction';
import { DetachAction } from './DetachAction';
import { EditAction } from './EditAction';
import { ExtendAction } from './ExtendAction';
import { PullAction } from './PullAction';
import { RetypeAction } from './RetypeAction';

export default [
  EditAction,
  PullAction,
  AttachAction,
  DetachAction,
  ExtendAction,
  RetypeAction,
  TerminateAction,
];
