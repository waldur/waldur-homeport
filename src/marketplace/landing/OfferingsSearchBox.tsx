import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { fixURL } from '@waldur/core/api';
import { AsyncSearchBox } from '@waldur/core/AsyncSearchBox';
import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { TextWithoutFormatting } from '@waldur/core/TextWithoutFormatting';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import {
  getCustomer,
  getProject,
  getWorkspace,
} from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

import { OfferingLink } from '../links/OfferingLink';
import { Offering } from '../types';

const OfferingListItem: FC<{ row: Offering }> = ({ row }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(row), [row]);

  return (
    <OfferingLink offering_uuid={row.uuid}>
      <div className="d-flex text-dark text-hover-primary align-items-center mb-5">
        {row.image ? (
          <Image src={row.image} size={40} classes="me-4" />
        ) : (
          <div className="symbol me-4">
            <ImagePlaceholder
              width="40px"
              height="40px"
              backgroundColor="#e2e2e2"
            >
              {abbreviation && (
                <div className="symbol-label fs-6 fw-bold">{abbreviation}</div>
              )}
            </ImagePlaceholder>
          </div>
        )}
        <div className="d-flex flex-column justify-content-start fw-semibold ellipsis">
          <span className="fs-6 fw-semibold ellipsis">{row.name}</span>
          <span className="fs-7 fw-semibold text-muted ellipsis">
            <TextWithoutFormatting html={truncate(row.description, 120)} />
          </span>
        </div>
      </div>
    </OfferingLink>
  );
};

export const OfferingsSearchBox = () => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const workspace: WorkspaceType = useSelector(getWorkspace);

  const params = useMemo(() => {
    const field = [
      'uuid',
      'name',
      'description',
      'thumbnail',
      'customer_name',
      'customer_uuid',
      'state',
      'paused_reason',
    ];
    const _params: Record<string, any> = {
      o: '-created',
      state: ['Active', 'Paused'],
      field,
      allowed_customer_uuid: customer?.uuid,
      project_uuid: project?.uuid,
    };
    if (workspace === WorkspaceType.USER) {
      _params.shared = true;
    }
    return _params;
  }, [customer, project, workspace]);

  return (
    <AsyncSearchBox
      api={fixURL('/marketplace-public-offerings/')}
      queryField="keyword"
      params={params}
      RowComponent={OfferingListItem}
      placeholder={translate('Type in name of offering or provider') + '...'}
      emptyMessage={translate('There are no offerings.')}
      className="w-400px"
    />
  );
};
