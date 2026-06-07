const { Router } = require("express");
const todoController = require("../controller/todoController");
const { validateCreateTodo, validateUpdateTodo, validateTodoStatus, } = require("../middleware/validateTodo");

const router = Router();

router.get("/", todoController.getAll);
router.get("/:id", todoController.getById);
router.post("/", validateCreateTodo, todoController.create);
router.put("/:id", validateUpdateTodo, todoController.update);
router.patch("/:id", validateTodoStatus, todoController.updateStatus);
router.delete("/:id", todoController.delete);

module.exports = router;
