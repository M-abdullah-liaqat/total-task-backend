/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id").primary(); // Primary key, auto-incrementing
      table.string("username").unique().notNullable(); // Unique, non-null string
      table.string("email").unique().notNullable();
      table.string("password").notNullable();
      table.timestamps(true, true); // Adds `created_at` and `updated_at` columns
    })
    .createTable("teams", (table) => {
      table.increments("id").primary();
      table.string("teamId").unique().notNullable();
      table.string("teamName").notNullable();
      table.string("organization").notNullable();
      table.jsonb("members");
      table.string("createdBy").notNullable();
      table.timestamps(true, true);
    })
    .createTable("tasks", (table) => {
      table.increments("id").primary();
      table.string("taskTitle").notNullable();
      table.string("taskId").notNullable();
      table.string("projectName").notNullable();
      table.string("assignedTo").notNullable();
      table.string("fromTeam").notNullable();
      table.string("teamId").notNullable();
      table.string("status").notNullable();
      table.string("dueData").notNullable(); 
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users").dropTable("teams");
};
