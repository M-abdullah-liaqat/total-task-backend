const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const DB = require("./db"); // Assuming this is correct
const { hashPassword, comparePassword } = require("./Bcryptd");
const cors = require("cors");
const { v4 } = require("uuid");
const { AddMember } = require("./actions/addMember");
const { DeleteTeam, UpdateTeam } = require("./actions/teamOPs");
const { CreateTask, UpdateTask, DeleteTask } = require("./actions/taskOPs");
const { setUser, getUser } = require("./service");
const app = express();
const port = 3000;
app.use(
  cors({
    origin: "http://localhost:5173", // or your production frontend
    credentials: true,
  })
);
// ✅ 2. Handle preflight requests globally

app.use(bodyParser.json());
app.use(cookieParser());

function Start() {
  app.get("/", (req, res) => {
    const _secretkey = req.cookies._secretkey;
    const user = getUser(_secretkey);
    if (user) {
      res.json({ hello: "Hello World! ", username: user.username });
    } else {
      res.json({ status: "unauterized" });
    }
  });

  app.post("/user", async (req, res) => {
    const { username, email, password } = await req.body;
    if (!username || !email || !password) {
      return res.json({ status: 400, message: "Missing required fields" });
    }
    const data = await DB("users").where({ email }).first();
    if (data) {
      return res.json({ status: 400, message: "User already exists" });
    }
    try {
      const BcryptPassword = await hashPassword(password);
      await DB("users").insert({ username, email, password: BcryptPassword });
    } catch (err) {
      console.error(err);
      res.json({
        status: 500,
        message: "Error inserting user try again Later",
      });
      return;
    }
    res.json({ status: 200, message: "User data received" });
  });

  app.post("/login", async (req, res) => {
    const { email, password } = await req.body; // `await` is not necessary here
    if (!email || !password) {
      return res.json({ status: 400, message: "Missing required fields" });
    }
    try {
      const data = await DB("users").where({ email }).first();
      if (data) {
        const match = await comparePassword(password, data.password);
        if (match) {
          const token = setUser({
            id: data.id,
            username: data.username,
            email: data.email,
          });
          res.cookie("_secretkey", token,{
          httpOnly: true,
          secure: false,   // localhost -> false
          sameSite: 'lax', // or 'none' if you're using cross-domain
        });
          return res.json({ status: 200, message: "Login Successful" });
        } else {
          return res.json({ status: 400, message: "Invalid Password" });
        }
      } else {
        return res.json({ status: 400, message: "User not Found" });
      }
    } catch (err) {
      console.error(err);
      res.json({ status: 500, message: "Error logging in, try again later" });
    }
  });
  app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Error logging out");
      }
      res.send("Logged out successfully!");
    });
  });
  // Example route to check if a user is logged in
  app.get("/check-session", (req, res) => {
    const _secretkey = req.cookies._secretkey;
    const user = getUser(_secretkey);
    console.log(user)
    if (_secretkey) {
      return res.json({
        status: 200,
        sessionData: {
          username: user.username,
          email: user.email,
        },
      });
    }
    return res.json({
      status: 401,
      sessionData: null,
    });
  });
  app.post("/createteams", async (req, res) => {
    const _secretkey = req.cookies._secretkey;
    const USER = getUser(_secretkey);
    const { teamName, organization, createdBy, members } = await req.body;
    if (USER) {
      if (!teamName || !organization || !createdBy || !members) {
        return res.json({ status: 400, message: "Missing required fields" });
      }
      try {
        const realMember = JSON.stringify(members);
        await DB("teams").insert({
          teamId: v4(),
          teamName,
          organization: organization,
          createdBy,
          members: realMember,
        });
      } catch (err) {
        console.error(err);
        res.json({
          status: 500,
          message: "Error inserting user try again Later",
        });
        return;
      }
      return res.json({ status: 200, message: "Team Created" });
    }
    return res.json({
      status: 401,
      message: "unautherized",
    });
  });
  app.get("/get/team", async (req, res) => {
    const _secretkey = req.cookies._secretkey;
    const USER = getUser(_secretkey);
    if (USER) {
      const exect = await DB("teams").whereRaw(`members @> ?`, [
        `[{"email": "${USER.email}"}]`,
      ]);
      const teams = await DB("teams").select("*");
      return res.json(exect);
    }
    return res.json({
      status: 401,
      teams: null,
    });
  });
  app.get("/get/task/:Method", async (req, res) => {
    const { Method } = req.params;
    const _secretkey = req.cookies._secretkey;
    const USER = getUser(_secretkey);
    console.log(Method);
    if (USER) {
      if (Method === "byEmail") {
        console.log("yes Email");
        const teams = await DB("tasks").where({
          assignedTo: USER.email,
        });
        return res.json(teams);
      } else {
        const teams = await DB("tasks").where({ teamId: Method });
        return res.json(teams);
      }
    }
    return res.json({
      status: 401,
      teams: null,
    });
  });
  app.patch("/addteam", AddMember);
  app.delete("/deleteteam", DeleteTeam);
  app.patch("/updateteam", UpdateTeam);
  app.post("/createtask", CreateTask);
  app.patch("/updatetask/:method", UpdateTask);
  app.delete("/deleteTask", DeleteTask);
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

Start();
