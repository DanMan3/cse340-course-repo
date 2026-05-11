import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

const showProjectsPage = async (req, res, next) => {
  try {
    const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
    const title = 'Upcoming Service Projects';
    res.render('projects', { title, projects });
  } catch (err) {
    next(err);
  }
};

const showProjectDetailsPage = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    if (!/^\d+$/.test(String(projectId))) {
      const err = new Error('Invalid project ID');
      err.status = 400;
      return next(err);
    }

    const project = await getProjectDetails(projectId);
    if (!project) {
      const err = new Error('Project Not Found');
      err.status = 404;
      return next(err);
    }

    const title = project.title;
    res.render('project', { title, project });
  } catch (err) {
    next(err);
  }
};

export { showProjectsPage, showProjectDetailsPage };