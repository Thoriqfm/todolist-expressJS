const Todo = require("../model/Todo");

class TodoController {
  // ** Get all todos
  async getAll(req, res, next) {
    try {
      const todos = await Todo.getAll();
      res.json({ success: true, data: todos });
    } catch (err) {
      next(err);
    }
  }
  // ** Get a single todo by ID
  async getById(req, res, next) {
    try {
      const todo = await Todo.getById(req.params.id);
      if (!todo) {
        return res.status(404).json({ success: false, message: "Todo not found" });
      }
      res.json({ success: true, data: todo });
    } catch (err) {
      next(err);
    }
  }
  // ** Create a new todo
  async create(req, res, next) {
    try {
      const { title, description } = req.body;
      if (!title || title.trim() === "") {
        return res
          .status(400)
          .json({ success: false, message: "Title is required" });
      }
      const todo = await Todo.create({ title, description });
      res.status(201).json({ success: true, data: todo });
    } catch (err) {
      next(err);
    }
  }
  // ** Update an existing todo
  async update(req, res, next) {
    try {
      const todo = await Todo.getById(req.params.id);
      if (!todo) {
        return res
          .status(404)
          .json({ success: false, message: "Todo not found" });
      }
      const updated = await Todo.update(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
  // ** Delete a todo
  async delete(req, res, next) {
    try {
      const todo = await Todo.getById(req.params.id);
      if (!todo) {
        return res
          .status(404)
          .json({ success: false, message: "Todo not found" });
      }
      await Todo.delete(req.params.id);
      res.json({ success: true, message: "Todo deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TodoController();
