# Development workflow

A good workflow is crucial for development because it saves time. The following step-by-step guide is intended to promote best practices for task analysis, planning, implementation and quality assurance.

1. Pick the task with the highest priority from the JIRA.
2. Ensure that task have clearly identified goal, implementation plan, acceptance testing procedure and time estimate. It's okay to skip explicit description of implementation plan or acceptance testing procedure if it's clear from task description itself. If it is not clear from task description what is the goal, or how to achieve it, additional analysis should be performed first. If estimated time is more than 2 working days, task should be split to several smaller task. You should strive for granular tasks. Ideally, time estimate for a task lies between 2 hours and 2 days. Therefore, typical sprint would consist of 3 or 4 tasks. 
3. Move task to the "In progress" state so that it would be clear for other developers what task are you working on now.
4. Create new Git branch for new task:
```bash
git branch -b feature/WAL-101  # if you're working on new feature
git branch -b bug/WAL-101  # if you're working on bug fix
```
5. Once implementation is done, ensure that new code is covered with unit tests and integration tests. Tests are needed in order to avoid bug regressions, and improve documentation for new features. Think of tests as a kind of executable documentation. Therefore, tests would allow to clearly document design decisions and reduce barrier to entry for new developers.
6. Once work is done, merge request should be submitted to GitLab and and reviewer should be assigned. 
7. Even if task is not ready for a review yet, merge request should be submitted anyways as the end of the working day. There're two main reasons for doing so. First, you would receive feedback from other developers very early. Second, it allows to reduce risk of throwing your work away, for example, if developer has misunderstood technical requirements or if requirements have been changed to better reflect result of business analysis. In this case you should mark merge request as *Work In Progress* or *WIP*.
8. It's a good idea to list subtasks directly in the merge request description, especially if task it takes more than one working day to complete work on task. It allows for a reviewer to understand the current status of the task and avoid extra comments in merge requests. Also, number of subtasks is rendered in merge requests list. Once subtask is resolved, it should be checked so that pending subtask counter is decreased.
9. Once MR is submitted, Jenkins would automatically launch test job. Whenever test job fails you should review console log and fix code until test job passes.
10. Whenever you implement new feature or fixing a bug which has impact on user interface design or behaviour, you should attach screenshot or screencast which demonstrates new feature or difference between old and new design. It allows to receive feedback from reviewer and other developers faster.
11. Once reviewer submits comments, you should respond to them during the day. Once issue is resolved either by fixing code or by responding to the comment, you should click _Resolve_ button at the comment. Resolved comments are hidden, so that it is much easier for both developer and review to understand what's already done and what needs to be done.
12. Once merge request passses all the checks in Jenks, all subtasks are solved and all comments are resolved, reviewer should accept merge request.
13. Once merge request is accepted, you should move task to the "Done" state.

## Unit tests

In order to run unit tests only once, for example in Jenkins, execute command `yarn jest`.
If you want to run server, which watches for changes in tests, run `yarn jest --watch`.

Unit tests are used for testing React components, Redux actions, sagas, reducers, selectors.
Unit tests are written in the `.spec.ts` files.

## Integration tests

Tests are implemented using [Cypress framework](https://www.cypress.io/).
In order to run all integration tests, execute command `yarn ci:test`.
If you already have Webpack server running, it's better to execute command `yarn cypress open`.

# Component approach

Each component consists of script, SCSS stylesheet, HTML template and unit test.
All these files reside in one directory, one directory for each component.

Script imports template and stylesheet and exports component.
Unit test imports component and specifes test case.
In the module root there's script which declares components in the module.
In the application root there's module which connects all other modules.

Stylesheet file may import dependencies from core module.

In order to inject dependencies into component, ng-annotate-loader is used.
It is required to mark each function which needs annotations, with the following comment: `// @ngInject`

# General tips on writing React components

New tables should be implemented using 'Table' component under 'table-react' folder.
A new table should be named with 'List' postfix, for instance: UsersList.
Try to maximize usage of theme's colors and do not add custom styling if not necessary.
