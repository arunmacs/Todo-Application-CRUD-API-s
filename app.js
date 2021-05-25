const express = require("express");
const app = express();
app.use(express.json());
let port = 3001;

const path = require("path");
const databasePath = path.join(__dirname, "todoApplication.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let database = null;

const initializeDBServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server Running at http://localhost:${port}/`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBServer();

//API-3: Create a todo in the todo table,

app.post("/todos/", async (request, response) => {
  try {
    const { id, todo, priority, status } = request.body;
    const addTodoQuery = `
      INSERT INTO todo (id,todo,priority,status)
      VALUES
       ( ${id},
        '${todo}',
        '${priority}',
        '${status}' );`;
    await database.run(addTodoQuery);
    response.send("Todo Successfully Added");
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
});

//API-1: GET todos based on diff. query's

app.get("/todos/", async (request, response) => {
  try {
    const { status, priority, search_q } = request.query;
    //console.log(request.query);
    const getTodosQuery = `
        SELECT * 
        FROM todo 
        WHERE status LIKE '%${status}%' OR 
        priority LIKE '%${priority}%'
        OR todo LIKE '%${search_q}%';`;
    const todosList = await database.all(getTodosQuery);
    response.send(todosList);
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
});

//API-2: Returns a specific todo based on the todo ID

app.get("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const getTodoQuery = `
        SELECT * 
        FROM todo 
        WHERE id = ${todoId};`;
    const todosList = await database.get(getTodoQuery);
    response.send(todosList);
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
});

//API-4: Updates details of a specific todo based on the todo ID

app.put("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const { todo, status, priority } = request.body;
    if (todo != null || status != null || priority != null) {
      if (request.body.status != null) {
        const updateTodoQuery = `
        UPDATE todo 
        SET 
          status = '${status}'
        WHERE id = ${todoId};`;
        await database.run(updateTodoQuery);
        response.send("Status Updated");
      }
      if (request.body.priority != null) {
        const updateTodoQuery = `
        UPDATE todo 
        SET 
          priority = '${priority}'
        WHERE id = ${todoId};`;
        await database.run(updateTodoQuery);
        response.send("Priority Updated");
      }
      if (request.body.todo != null) {
        const updateTodoQuery = `
        UPDATE todo 
        SET 
          todo = '${todo}'
        WHERE id = ${todoId};`;
        await database.run(updateTodoQuery);
        response.send("Todo Updated");
      }
    }
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
});

//API-5:Deletes a todo from the todo table based on the todo ID

app.delete("/todos/:todoId/", async (request, response) => {
  try {
    const { todoId } = request.params;
    const deleteTodoQuery = `
        DELETE FROM todo
        WHERE id = ${todoId};`;
    await database.run(deleteTodoQuery);
    response.send("Todo Deleted");
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
  }
});

module.exports = app;
