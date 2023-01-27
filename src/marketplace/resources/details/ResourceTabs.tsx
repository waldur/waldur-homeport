import classNames from 'classnames';
import { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

export const ResourceTabs = ({ tabs, resource }) => {
  const [selectedSection, selectSection] = useState<any>();

  useEffect(() => {
    Array.isArray(tabs) &&
      tabs.length > 0 &&
      selectSection(tabs[0].children[0]);
  }, [tabs]);

  return (
    <Row>
      <Col sm={4}>
        <div
          className="menu menu-rounded menu-column menu-active-bg menu-hover-bg menu-title-gray-700 fs-5 fw-semibold w-250px"
          id="#kt_aside_menu"
          data-kt-menu="true"
        >
          {tabs.map((tab, tabIndex) => (
            <Fragment key={tabIndex}>
              <div className="menu-item">
                <div className="menu-content pb-2">
                  <span className="menu-section text-muted text-uppercase fs-7 fw-bold">
                    {tab.title}
                  </span>
                </div>
              </div>
              <div className="menu-sub menu-sub-accordion show">
                {tab.children.map((section, sectionIndex) => (
                  <div
                    className="menu-item"
                    data-kt-menu-trigger="click"
                    data-kt-menu-permanent="true"
                    key={sectionIndex}
                  >
                    <a
                      className={classNames(
                        'menu-link active border-3 border-start',
                        selectedSection === section
                          ? 'border-primary'
                          : 'border-transparent',
                      )}
                      onClick={() => selectSection(section)}
                    >
                      <span className="menu-title">{section.title}</span>
                      <span className="menu-badge fs-7 fw-normal text-muted">
                        {section.count}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </Col>
      <Col sm={8}>
        {selectedSection && <selectedSection.component resource={resource} />}
      </Col>
    </Row>
  );
};
