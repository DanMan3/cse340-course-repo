import { getAllCategories, getCategoryById, getProjectsByCategoryId, getCategoriesByProjectId, createCategory, updateCategory, updateCategoryAssignments } from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

const showCategoriesPage = async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    const title = 'Service Categories';
    res.render('categories', { title, categories });
  } catch (err) {
    next(err);
  }
};

const showCategoryDetailsPage = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    if (!/^\d+$/.test(String(categoryId))) {
      const err = new Error('Invalid category ID');
      err.status = 400;
      return next(err);
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      const err = new Error('Category Not Found');
      err.status = 404;
      return next(err);
    }

    const projects = await getProjectsByCategoryId(categoryId);
    const title = category.name;
    res.render('category', { title, category, projects });
  } catch (err) {
    next(err);
  }
};

const showAssignCategoriesForm = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
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

    const categories = await getAllCategories();
    const assigned = await getCategoriesByProjectId(projectId);
    const assignedIds = assigned.map(c => c.category_id);

    const title = 'Assign Categories to Project';
    res.render('assign-categories', { title, project, categories, assignedIds });
  } catch (err) {
    next(err);
  }
};

const processAssignCategoriesForm = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    let selected = req.body.categoryIds || [];
    if (!Array.isArray(selected)) {
      if (selected === undefined || selected === null || selected === '') selected = [];
      else selected = [selected];
    }

    const categoryIds = selected.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

    await updateCategoryAssignments(projectId, categoryIds);

    req.flash('success', 'Categories updated successfully!');
    res.redirect(`/project/${projectId}`);
  } catch (err) {
    next(err);
  }
};


const showNewCategoryForm = async (req, res, next) => {
  try {
    const title = 'Add New Category';
    res.render('new-category', { title });
  } catch (err) {
    next(err);
  }
};

const processNewCategoryForm = async (req, res, next) => {
  try {
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach(error => req.flash('error', error.msg));
      return res.redirect('/new-category');
    }

    const { name } = req.body;
    await createCategory(name);

    req.flash('success', 'Category created successfully!');
    res.redirect('/categories');
  } catch (err) {
    next(err);
  }
};

const showEditCategoryForm = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    if (!/^\d+$/.test(String(categoryId))) {
      const err = new Error('Invalid category ID');
      err.status = 400;
      return next(err);
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/categories');
    }

    const title = 'Edit Category';
    res.render('edit-category', { title, category });
  } catch (err) {
    next(err);
  }
};

const processEditCategoryForm = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const results = validationResult(req);
    if (!results.isEmpty()) {
      results.array().forEach(error => req.flash('error', error.msg));
      return res.redirect(`/edit-category/${categoryId}`);
    }

    const { name } = req.body;
    await updateCategory(categoryId, name);

    req.flash('success', 'Category updated successfully!');
    res.redirect(`/category/${categoryId}`);
  } catch (err) {
    next(err);
  }
};

const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Category name must be between 3 and 100 characters')
];

export {
  showCategoriesPage,
  showCategoryDetailsPage,
  showAssignCategoriesForm,
  processAssignCategoriesForm,
  showNewCategoryForm,
  processNewCategoryForm,
  showEditCategoryForm,
  processEditCategoryForm,
  categoryValidation
};