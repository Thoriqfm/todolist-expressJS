const { Router } = require("express");
const todoController = require("../controller/todoController");

const router = Router();

router.get("/", todoController.getAll);
router.get("/:id", todoController.getById);
router.post("/", todoController.create);
router.put("/:id", todoController.update);
router.delete("/:id", todoController.delete);

module.exports = router;
