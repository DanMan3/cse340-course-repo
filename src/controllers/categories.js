import { getAllCategories, getCategoryById, getProjectsByCategoryId, getCategoriesByProjectId, updateCategoryAssignments } from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';

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

export { showCategoriesPage, showCategoryDetailsPage, showAssignCategoriesForm, processAssignCategoriesForm };