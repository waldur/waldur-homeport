import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';

export const BrandName: FunctionComponent = () => (
  <div
    className="aside-logo flex-column-auto position-relative"
    id="kt_aside_logo"
  >
    {ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO ? (
      <img src={ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO} className="h-25px logo" />
    ) : (
      <>
        <i className="fa fa-th-large"></i>{' '}
        <h3 className="mt-2" style={{ color: 'white' }}>
          {ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
        </h3>
      </>
    )}
    <div
      id="kt_aside_toggle"
      className="btn btn-icon btn-shadow btn-sm btn-color-muted btn-active-color-primary body-bg h-30px w-30px position-absolute top-50 start-100 translate-middle rotate"
      data-kt-toggle="true"
      data-kt-toggle-state="active"
      data-kt-toggle-target="body"
      data-kt-toggle-name="aside-minimize"
      style={{
        background: 'white',
        boxShadow: '0px 0px 10px rgba(113, 121, 136, 0.1)',
      }}
    >
      <span className="svg-icon svg-icon-2 rotate-180">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.5"
            d="M14.2657 11.4343L18.45 7.25C18.8642 6.83579 18.8642 6.16421 18.45 5.75C18.0358 5.33579 17.3642 5.33579 16.95 5.75L11.4071 11.2929C11.0166 11.6834 11.0166 12.3166 11.4071 12.7071L16.95 18.25C17.3642 18.6642 18.0358 18.6642 18.45 18.25C18.8642 17.8358 18.8642 17.1642 18.45 16.75L14.2657 12.5657C13.9533 12.2533 13.9533 11.7467 14.2657 11.4343Z"
            fill="currentColor"
          ></path>
          <path
            d="M8.2657 11.4343L12.45 7.25C12.8642 6.83579 12.8642 6.16421 12.45 5.75C12.0358 5.33579 11.3642 5.33579 10.95 5.75L5.40712 11.2929C5.01659 11.6834 5.01659 12.3166 5.40712 12.7071L10.95 18.25C11.3642 18.6642 12.0358 18.6642 12.45 18.25C12.8642 17.8358 12.8642 17.1642 12.45 16.75L8.2657 12.5657C7.95328 12.2533 7.95328 11.7467 8.2657 11.4343Z"
            fill="currentColor"
          ></path>
        </svg>
      </span>
    </div>
  </div>
);
