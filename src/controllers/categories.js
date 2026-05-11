import { getAllCategories, getCategoryById, getProjectsByCategoryId } from '../models/categories.js';

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

export { showCategoriesPage, showCategoryDetailsPage };