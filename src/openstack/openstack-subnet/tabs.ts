import { getEventsTab } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

ResourceTabsConfiguration.register('OpenStack.SubNet', () => [getEventsTab()]);
