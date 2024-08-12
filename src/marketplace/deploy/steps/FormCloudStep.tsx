import { Plus } from '@phosphor-icons/react';
import { QueryFunction, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';
import { Field } from 'redux-form';

import { fixURL } from '@waldur/core/api';
import { required } from '@waldur/core/validators';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { parseResponse } from '@waldur/table/api';
import { getProject } from '@waldur/workspace/selectors';

import { FormStepProps } from '../types';
import { formProjectSelector } from '../utils';

import { BoxRadioField } from './BoxRadioField';
import { StepCardTabs, TabSpec } from './StepCardTabs';

interface DataPage {
  data: Offering[];
  nextPage?: number;
}

const loadData: QueryFunction<DataPage> = async (context) => {
  if (!context.meta.project_uuid) {
    return { data: [], nextPage: null };
  }
  const response = await parseResponse(
    fixURL('/marketplace-public-offerings/'),
    {
      page: context.pageParam,
      page_size: 5,
      project_uuid: context.meta.project_uuid,
      type: context.meta.type,
    },
    { signal: context.signal },
  );
  return {
    data: response.rows,
    nextPage: response.nextPage,
  };
};

const tabs: TabSpec[] = [
  { title: translate('Private cloud'), key: 'private' },
  { title: translate('Public cloud'), key: 'public' },
];

export const FormCloudStep = (props: FormStepProps) => {
  const [tab, setTab] = useState<TabSpec>(tabs[0]);
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const currentProject = useSelector(getProject);

  const initialOffering = useRef(props.offering);
  const initialProjectUuid = useRef(currentProject.uuid);
  const project = useSelector(formProjectSelector);

  const context = useInfiniteQuery<any, any, DataPage>(
    ['deploy-offerings', project?.uuid, props.params?.type],
    loadData,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      staleTime: 3 * 60 * 1000,
      meta: {
        project_uuid: project?.uuid,
        type: props.params?.type,
      },
    },
  );

  const choices = useMemo(() => {
    if (!context.data?.pages?.length) return [];
    const loadedOfferings = context.data.pages
      .map((page) =>
        page.data.map((offering) => ({
          label: offering.name,
          value: offering,
          image: (
            <img
              src={offering.image || offering.thumbnail}
              alt="offering logo"
            />
          ),
        })),
      )
      .flat();
    // If user selects a project that is not the initial project, don't put the initial offering as the first option
    if (
      project?.uuid !== initialProjectUuid.current ||
      !initialOffering.current
    ) {
      return loadedOfferings;
    }
    return [
      {
        label: initialOffering.current.name,
        value: initialOffering.current,
        image: (
          <img
            src={
              initialOffering.current.image || initialOffering.current.thumbnail
            }
            alt="offering logo"
          />
        ),
      },
    ].concat(
      loadedOfferings.filter(
        (choice) => choice.value.uuid !== initialOffering.current.uuid,
      ),
    );
  }, [context, initialOffering.current, project, initialProjectUuid.current]);

  const onChangeOffering = useCallback(
    (value) => {
      if (value) {
        props.change('attributes.flavor', undefined);
        props.change('attributes.image', undefined);
        props.change('attributes.security_groups', undefined);
      }
    },
    [props.change],
  );

  // Initialize offering
  useEffectOnce(() => {
    if (initialOffering.current) {
      props.change('offering', initialOffering.current);
    }
  });

  // Select first option if project changed
  useEffect(() => {
    if (choices.length === 0) return;
    if (!choices.some((choice) => choice.value.uuid === props.offering.uuid)) {
      props.change('offering', choices[0].value);
      onChangeOffering(choices[0].value);
    }
  }, [
    project,
    choices,
    props.offering,
    initialProjectUuid.current,
    props.change,
    onChangeOffering,
  ]);

  return (
    <VStepperFormStepCard
      title={props.title || translate('Cloud')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
      actions={
        showExperimentalUiComponents ? (
          <div className="d-flex justify-content-between flex-grow-1 align-items-center">
            <div>
              <StepCardTabs tabs={tabs} tab={tab} setTab={setTab} />
            </div>
            <div className="d-flex gap-10 justify-content-end">
              <Button variant="light" className="text-nowrap" size="sm">
                <span className="svg-icon svg-icon-2">
                  <Plus />
                </span>
                {translate('New cloud')}
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {context.status === 'loading' ? (
        <p className="text-center">{translate('Loading')}</p>
      ) : context.status === 'error' ? (
        <p className="text-center">{translate('Error')}</p>
      ) : context.data.pages[0].data.length === 0 ? (
        <p className="text-center">
          {translate('There are no option to choose.')}
        </p>
      ) : (
        <>
          <Field
            name="offering"
            component={BoxRadioField}
            choices={choices}
            validate={[required]}
            onChange={onChangeOffering}
          />
          <div className="text-center">
            {context.hasNextPage && (
              <div>
                <button
                  type="button"
                  onClick={() => context.fetchNextPage()}
                  disabled={context.isFetchingNextPage}
                  className="btn btn-link"
                >
                  {context.isFetchingNextPage
                    ? translate('Loading more...')
                    : translate('Load more')}
                </button>
              </div>
            )}
            <div>
              {context.isFetching && !context.isFetchingNextPage
                ? translate('Fetching...')
                : null}
            </div>
          </div>
        </>
      )}
    </VStepperFormStepCard>
  );
};
