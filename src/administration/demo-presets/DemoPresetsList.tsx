import { EyeIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { DemoPreset, marketplaceDemoPresetsListList } from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  BaseButton,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import {
  DemoPresetPreview,
  DemoPresetPreviewFooter,
} from './DemoPresetPreview';
import { LoadDemoPresetButton } from './LoadDemoPresetButton';

export const DEMO_PRESETS_QUERY_KEY = ['demo-presets'];

const COUNTED = ['users', 'customers', 'projects', 'offerings', 'resources'];

const countLabel = (key: string, count: number) =>
  ({
    users: translate('{count} users', { count }),
    customers: translate('{count} organizations', { count }),
    projects: translate('{count} projects', { count }),
    offerings: translate('{count} offerings', { count }),
    resources: translate('{count} resources', { count }),
  })[key];

const PresetCard: FC<{ preset: DemoPreset }> = ({ preset }) => {
  const { openDrawer } = useDrawer();
  const title = preset.title || preset.name;

  const preview = () =>
    openDrawer(DemoPresetPreview, {
      name: preset.name,
      presetTitle: title,
      title,
      subtitle: preset.name,
      width: '960px',
      footer: DemoPresetPreviewFooter,
    });

  return (
    <Card
      bordered
      className="h-full"
      data-testid={`demo-preset-${preset.name}`}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {preset.description && (
          <CardDescription>{preset.description}</CardDescription>
        )}
        <div className="flex flex-wrap gap-1.5">
          {COUNTED.filter((key) => preset.entity_counts[key]).map((key) => (
            <Badge key={key} variant="neutral" shape="pill" tone="outline">
              {countLabel(key, preset.entity_counts[key])}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <BaseButton
          variant="tertiary"
          size="sm"
          onClick={preview}
          iconNode={<EyeIcon weight="bold" />}
          label={translate('Preview')}
        />
        <LoadDemoPresetButton name={preset.name} title={title} size="sm" />
      </CardFooter>
    </Card>
  );
};

/**
 * The demo presets a staff user can load on a demo deployment. Only reachable
 * when the deployment enables them; see ./gate.ts.
 */
export const DemoPresetsList: FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: DEMO_PRESETS_QUERY_KEY,
    queryFn: () => marketplaceDemoPresetsListList().then(({ data }) => data),
    meta: { skipGlobalErrorRedirect: true },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <LoadingErred
        loadData={refetch}
        message={translate('Unable to load demo presets.')}
      />
    );
  }
  if (!data.length) {
    return (
      <NoResult
        title={translate('No demo presets')}
        message={translate('This deployment offers no demo presets to load.')}
        noAction
      />
    );
  }
  return (
    <>
      <AlertItem
        variant="warning"
        type="floating"
        className="mb-5"
        title={translate('Loading a preset resets the whole portal')}
        body={translate(
          'Every organization, project, offering, user and API token is deleted and replaced with the preset’s, and everyone is signed out. Settings the deployment owns are kept.',
        )}
      />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.map((preset) => (
          <PresetCard key={preset.name} preset={preset} />
        ))}
      </div>
    </>
  );
};
