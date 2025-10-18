const DB = require("../db");
const { v4 } = require("uuid");
async function CreateTask(req, res) {
  const { allData } = req.body;
  if (req.session.userId) {
    if (
      !allData.taskTitle ||
      !allData.projectName ||
      !allData.assignedTo ||
      !allData.teamId
    ) {
      return res.json({ status: 400, message: "Missing required fields" });
    }
    try {
      await DB("tasks").insert({ ...allData, taskId: v4() });
      return res.json({ status: 200, message: "Task Created" });
    } catch (err) {
      console.error(err);
      res.json({
        status: 500,
        message: "Error please try again",
      });
      return;
    }
  } else {
    return res.json({
      status: 401,
      message: "unautherized",
    });
  }
}

async function UpdateTask(req, res) {
  const { method } = req.params;
  const { status, taskTitle, projectName, Id } = req.body;
  if (req.session.userId) {
    try {
      if (method === "status") {
        await DB("tasks").where({ taskId: Id }).update({
          status,
        });
      } else {
        await DB("tasks").where({ taskId: Id }).update({
          taskTitle,
          projectName,
        });
      }
      return res.json({ status: 200, message: "Task Updated" });
    } catch (err) {
      console.error(err);
      res.json({
        status: 500,
        message: "Error please try again",
      });
      return;
    }
  } else {
    return res.json({
      status: 401,
      message: "unautherized",
    });
  }
}
async function DeleteTask(req, res) {
  const { Id } = req.body;
  if (req.session.userId) {
    try {
      await DB("tasks").where({ taskId: Id }).del();
      return res.json({ status: 200, message: "Task Deleted" });
    } catch (err) {
      console.error(err);
      res.json({
        status: 500,
        message: "Error please try again",
      });
      return;
    }
  } else {
    return res.json({
      status: 401,
      message: "unautherized",
    });
  }
}

module.exports = { CreateTask, UpdateTask, DeleteTask };
