const express = require("express");
const bodyParser = require("body-parser");
const DB = require("./db"); // Assuming this is correct
const app = express();
const port = 3000;
const { hashPassword, comparePassword } = require("./Bcryptd");
const cors = require("cors");
const session = require("express-session");
const { v4 } = require("uuid");
const { AddMember } = require("./actions/addMember");
const { DeleteTeam, UpdateTeam } = require("./actions/teamOPs");
const { CreateTask, UpdateTask, DeleteTask } = require("./actions/taskOPs");

// --- START: Key Changes for CORS and Cookies ---
const corsOptions = {
  // Replace with the URL of your front-end application
  origin: "http://localhost:5173",
  credentials: true, // This is essential for sending cookies with cross-origin requests
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(
  session({
    secret: "your_secret_key_here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 100 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false, // ❌ false for localhost (HTTPS only if true)
      // Ensure client-side JavaScript can't access the cookie
      sameSite: "lax", // Relaxed same-site enforcement (often required for local dev)
      // For production HTTPS: sameSite: 'none', secure: true
    },
  })
);
// --- END: Key Changes ---

function Start() {
  app.get("/", (req, res) => {
    if (req.session.userId) {
      res.json({ hello: "Hello World! ", data: req.session.username });
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
          req.session.userId = data.id; // from DB
          req.session.username = data.username;
          req.session.email = data.email;

          // You might need to manually save if you use `res.json` before the response naturally ends
          req.session.save((err) => {
            if (err) {
              console.error("Error saving session:", err);
              return res.json({ status: 500, message: "Error saving session" });
            }
            return res.json({ status: 200, message: "Login Successful" });
          });
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
    if (req.session.userId) {
      return res.json({
        status: 200,
        sessionData: {
          username: req.session.username,
          email: req.session.email,
        },
      });
    }
    return res.json({
      status: 401,
      sessionData: null,
    });
  });
  app.post("/createteams", async (req, res) => {
    const { teamName, organization, createdBy, members } = await req.body;
    if (req.session.userId) {
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
    if (req.session.userId) {
      const exect = await DB("teams").whereRaw(`members @> ?`, [
        `[{"email": "${req.session.email}"}]`,
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
    console.log(Method)
    if (req.session.userId) {
      if (Method === "byEmail") {
        console.log("yes Email")
        const teams = await DB("tasks").where({
          assignedTo: req.session.email,
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
  app.patch("/updatetask/:method", UpdateTask)
  app.delete("/deleteTask", DeleteTask)
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

Start();
