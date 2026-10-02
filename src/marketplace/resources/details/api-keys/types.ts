import { ResourceApiKeyState, ResourceApiKeyStatus } from 'waldur-js-client';

export type ApiKeyState = ResourceApiKeyState;

export type ApiKeyRow = ResourceApiKeyStatus;

export interface KeyComponent {
  type: string;
  name?: string | null;
  measured_unit?: string | null;
}
