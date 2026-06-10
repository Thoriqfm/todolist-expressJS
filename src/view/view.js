const { get } = require("../app");

const BASE_URL = "http://localhost:3000/api/todos";

// GET semua todos
const getAll = async () => {
	const res = await fetch(BASE_URL);
	const data = await res.json();
	console.log(data);
};

// GET todos yang sudah selesai
const getCompleted = async () => {
	const res = await fetch(`${BASE_URL}?completed=true`);
	const data = await res.json();
	console.log(data);
};

// GET satu todo by ID
const getById = async (id) => {
	const res = await fetch(`${BASE_URL}/${id}`);
	const data = await res.json();
	console.log(data);
};

// POST - buat todo baru
const create = async () => {
	const res = await fetch(BASE_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			title: "Belajar Express",
			description: "Pelajari routing dan middleware",
		}),
	});
	const data = await res.json();
	console.log(data);
};

// PUT - update semua field
const update = async (id) => {
	const res = await fetch(`${BASE_URL}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			title: "Belajar Express (updated)",
			description: "Sudah paham routing",
			completed: true,
		}),
	});
	const data = await res.json();
	console.log(data);
};

// PATCH - update status completed saja
const updateStatus = async (id) => {
	const res = await fetch(`${BASE_URL}/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			completed: true,
		}),
	});
	const data = await res.json();
	console.log(data);
};

// DELETE - hapus todo
const deleteTodo = async (id) => {
	const res = await fetch(`${BASE_URL}/${id}`, {
		method: "DELETE",
	});
	const data = await res.json();
	console.log(data);
};

getById(2);