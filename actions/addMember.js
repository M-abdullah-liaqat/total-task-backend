const DB = require("../db");
const {getUser} = require("../service")

async function AddMember(req, res) {
  const { members, Id } = req.body;
  const _secretkey = req.cookies._secretkey;
    const USER = getUser(_secretkey);
  if (USER) {
    try {
        const realMembers= JSON.stringify(members)
      const Response = await DB("teams").where({teamId :Id}).update({
        members: realMembers,
        updated_at: new Date(), // Updates a timestamp column
      });
      return res.json({ status: 200, message: "Team Created" });
    } catch (err) {
      console.error(err);
      res.json({
        status: 500,
        message: "Error please try again",
      });
      return;
    }
  }
  return res.json({
    status: 401,
    message: "unautherized",
  });
}
module.exports ={ AddMember }