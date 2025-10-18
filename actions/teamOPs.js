const DB = require("../db");

async function DeleteTeam(req, res) {
  const { Id } = req.body;
  if (req.session.userId) {
    try {
      await DB("teams").where({ teamId: Id }).del();
      return res.json({ status: 200, message: "Deleted" });
    } catch (err) {
      console.log(err);
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

async function UpdateTeam(req, res) {
  const { Id, organization, teamName } = req.body;
  if (req.session.userId) {
    try {
      await DB("teams").where({ teamId: Id }).update({
        teamName,
        organization,
        updated_at: new Date(),
      });
      return res.json({ status: 200, message: "Deleted" });
    } catch (err) {
      console.log(err);
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

module.exports = { DeleteTeam, UpdateTeam };
