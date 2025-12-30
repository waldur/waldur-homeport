import { createContext } from 'react';
import { Issue } from 'waldur-js-client';

export const IssueAttachmentsContext = createContext<Issue | null>(null);
