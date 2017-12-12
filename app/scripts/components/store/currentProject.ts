const SET_CURRENT_PROJECT = 'waldur/project/SET_CURRENT';

export const setCurrentProject = project => ({
  type: SET_CURRENT_PROJECT,
  payload: {
    project,
  },
});

export const reducer = (state = null, action) => {
  switch (action.type) {

  case SET_CURRENT_PROJECT:
    return action.payload.project;

  default:
    return state;
  }
};

type Project = {
  uuid: string,
  url: string,
};

export const getCurrentProject: (p) => Project = state => state.currentProject;
