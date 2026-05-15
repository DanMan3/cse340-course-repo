/**
 * Flash Message Middleware
 */
const flashMiddleware = (req, res, next) => {
  req.flash = function(type, message) {
    if (!req.session.flash) {
      req.session.flash = {
        success: [],
        error: [],
        warning: [],
        info: []
      };
    }

    // SET: (type, message)
    if (type && message) {
      if (!req.session.flash[type]) req.session.flash[type] = [];
      req.session.flash[type].push(message);
      return;
    }

    // GET single type: (type)
    if (type && !message) {
      const messages = req.session.flash[type] || [];
      req.session.flash[type] = [];
      return messages;
    }

    // GET all: ()
    const all = req.session.flash || {
      success: [], error: [], warning: [], info: []
    };
    req.session.flash = { success: [], error: [], warning: [], info: [] };
    return all;
  };

  next();
};

const flashLocals = (req, res, next) => {
  res.locals.flash = req.flash;
  next();
};

const flash = (req, res, next) => {
  flashMiddleware(req, res, () => {
    flashLocals(req, res, next);
  });
};

export default flash;