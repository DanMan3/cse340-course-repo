import { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';


const showOrganizationsPage = async (req, res, next) => {
  try {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
  } catch (err) {
    next(err);
  }
};

const showOrganizationDetailsPage = async (req, res, next) => {
  try {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);
    const projects = await getProjectsByOrganizationId(organizationId);
    const title = 'Organization Details';
    res.render('organization', { title, organizationDetails, projects });
  } catch (err) {
    next(err);
  }
};

const showNewOrganizationForm = async (req, res) => {
  const title = 'Add New Organization';
  res.render('new-organization', { title });
};

const processNewOrganizationForm = async (req, res) => {
  // Check validation results
  const results = validationResult(req);
  if (!results.isEmpty()) {
    results.array().forEach(error => {
      req.flash('error', error.msg);
    });
    return res.redirect('/new-organization');
  }

  const { name, description, contactEmail } = req.body;
  const logoFilename = 'placeholder-logo.png';

  const organizationId = await createOrganization(name, description, contactEmail, logoFilename);

  req.flash('success', 'Organization added successfully!');
  res.redirect(`/organization/${organizationId}`);
};

const showEditOrganizationForm = async (req, res, next) => {
  try {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);
    if (!organizationDetails) {
      req.flash('error', 'Organization not found');
      return res.redirect('/organizations');
    }
    const title = 'Edit Organization';
    res.render('edit-organization', { title, organizationDetails });
  } catch (err) {
    next(err);
  }
};

const processEditOrganizationForm = async (req, res, next) => {
  const results = validationResult(req);
  const organizationId = req.params.id;
  if (!results.isEmpty()) {
    results.array().forEach(error => req.flash('error', error.msg));
    return res.redirect(`/edit-organization/${organizationId}`);
  }

  const { name, description, contactEmail, logoFilename } = req.body;
  const logo = logoFilename || 'placeholder-logo.png';

  await updateOrganization(organizationId, name, description, contactEmail, logo);

  req.flash('success', 'Organization updated successfully!');
  res.redirect(`/organization/${organizationId}`);
};

// Define validation and sanitization rules for organization form
const organizationValidation = [
  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Organization name must be between 3 and 150 characters'),
  body('description')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Organization description is required')
    .isLength({ max: 500 })
    .withMessage('Organization description cannot exceed 500 characters'),
  body('contactEmail')
    .normalizeEmail()
    .notEmpty()
    .withMessage('Contact email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
];

export { showOrganizationsPage, showOrganizationDetailsPage, showNewOrganizationForm, processNewOrganizationForm, showEditOrganizationForm, processEditOrganizationForm, organizationValidation };