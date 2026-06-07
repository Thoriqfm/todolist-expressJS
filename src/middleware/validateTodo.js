function validateCreateTodo(req, res, next) {
  const { title, description } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Title is required",
    });
  }

  if (description === undefined) {
    return res.status(400).json({
      success: false,
      message: "Description is required",
    });
  }

  next();
}

function validateUpdateTodo(req, res, next) {
    const { title } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Title is required",
        });
    }

    next();
}

function validateTodoStatus(req, res, next) {
  if (typeof req.body.completed !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "Completed must be a boolean",
    });
  }
  next();
}

module.exports = {
  validateCreateTodo,
  validateUpdateTodo,
  validateTodoStatus,
};
