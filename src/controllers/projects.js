import { getUpcomingProjects, getProjectDetails, createProject, updateProject } from '../models/projects.js';
import { getCategoriesByProjectId } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';
import { body, validationResult } from 'express-validator';

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

    const categories = await getCategoriesByProjectId(projectId);
    project.categories = categories;

    const title = project.title;
    res.render('project', { title, project });
  } catch (err) {
    next(err);
  }
};

const showNewProjectForm = async (req, res, next) => {
  try {
    const organizations = await getAllOrganizations();
    const title = 'Add New Service Project';
    res.render('new-project', { title, organizations });
  } catch (err) {
    next(err);
  }
};

const processNewProjectForm = async (req, res, next) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach(error => req.flash('error', error.msg));
      return res.redirect('/new-project');
    }

    const { organizationId, title, description, location, date } = req.body;
    await createProject(title, description, location, date, organizationId);

    req.flash('success', 'Project added successfully!');
    res.redirect('/projects');
  } catch (err) {
    next(err);
  }
};

const projectValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Project title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 1000 })
    .withMessage('Project description cannot exceed 1000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Project location is required')
    .isLength({ max: 200 })
    .withMessage('Project location cannot exceed 200 characters'),
  body('date')
    .notEmpty()
    .withMessage('Project date is required')
    .isISO8601()
    .withMessage('Project date must be a valid date'),
  body('organizationId')
    .notEmpty()
    .withMessage('Organization is required')
    .isInt()
    .withMessage('Organization ID must be an integer')
];

const showEditProjectForm = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    if (!/^\d+$/.test(String(projectId))) {
      const err = new Error('Invalid project ID');
      err.status = 400;
      return next(err);
    }

    const project = await getProjectDetails(projectId);
    if (!project) {
      req.flash('error', 'Project not found');
      return res.redirect('/projects');
    }

    const organizations = await getAllOrganizations();
    const title = 'Edit Project';
    res.render('edit-project', { title, project, organizations });
  } catch (err) {
    next(err);
  }
};

const processEditProjectForm = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach(error => req.flash('error', error.msg));
      return res.redirect(`/edit-project/${projectId}`);
    }

    const { organizationId, title, description, location, date } = req.body;
    await updateProject(projectId, title, description, location, date, organizationId);

    req.flash('success', 'Project updated successfully!');
    res.redirect(`/project/${projectId}`);
  } catch (err) {
    next(err);
  }
};

export {
  showProjectsPage,
  showProjectDetailsPage,
  showNewProjectForm,
  processNewProjectForm,
  projectValidation,
  showEditProjectForm,
  processEditProjectForm
};