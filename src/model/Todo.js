const db = require("../config/database");

class Todo {
	// ** Get all todos
	static async getAll() {
		const [rows] = await db.query(
			"SELECT * FROM todos ORDER BY created_at DESC",
		);
		return rows;
	}

	// ** Get a single todo by ID
	static async getById(id) {
		const [rows] = await db.query("SELECT * FROM todos WHERE id = ?", [id]);
		return rows[0] || null;
	}

	// ** Create a new todo
	static async create({ title, description }) {
		const [result] = await db.query(
			"INSERT INTO todos (title, description) VALUES (?, ?)",
			[title, description],
		);
		const [rows] = await db.query("SELECT * FROM todos WHERE id = ?", [
			result.insertId,
		]);
		return rows[0];
	}

	// ** Update an existing todo
	static async update(id, { title, description, completed = 0 }) {
		await db.query(
			"UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?",
			[title, description, completed, id],
		);
		const [rows] = await db.query("SELECT * FROM todos WHERE id = ?", [id]);
		return rows[0];
	}

	// ** Update status of a todo
	static async updateStatus(id, { title, description, completed }) {
		const currentTodo = await Todo.getById(id);

		await db.query(
			"UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?",
			[
				title ?? currentTodo.title,
				description ?? currentTodo.description,
				completed ?? currentTodo.completed,
				id,
			],
		);
		const [rows] = await db.query("SELECT * FROM todos WHERE id = ?", [id]);
		return rows[0];
	}

	// ** Delete a todo
	static async delete(id) {
		const [result] = await db.query("DELETE FROM todos WHERE id = ?", [id]);
		return result.affectedRows > 0;
	}
}

module.exports = Todo;
