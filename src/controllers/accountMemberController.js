import AccountMember from "../models/AccountMember.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { createLog } from "./log.controller.js";

// Add Member
export const addMember = async (req, res) => {
  try {
    const { account_id, user_id, role_id } = req.body;
    const member = await AccountMember.create({ account_id, user_id, role_id });

    // Log creation
    await createLog(
      req.user.id,
      "CREATE",
      "AccountMember",
      member.id,
      { account_id, user_id, role_id },
      account_id,
      null
    );

    res.json({ success: true, member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Get All Members
export const getMembers = async (req, res) => {
  try {
    const members = await AccountMember.findAll({
      include: [User, Role]
    });

    res.json({ success: true, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove Member
export const removeMember = async (req, res) => {
  try {
    const member = await AccountMember.findByPk(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });

    const memberData = { account_id: member.account_id, user_id: member.user_id, role_id: member.role_id };

    await member.destroy();

    // Log deletion
    await createLog(
      req.user.id,
      "DELETE",
      "AccountMember",
      member.id,
      memberData,
      member.account_id,
      null
    );

    res.json({ success: true, message: "Member removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};export const searchMembers = async (req, res) => {
  try {
    const { account_id, user_email, role_name } = req.query;

    const where = {};
    if (account_id) where.account_id = account_id;

    const members = await AccountMember.findAll({
      where,
      include: [
        { model: User, where: user_email ? { email: { [Op.iLike]: `%${user_email}%` } } : {}, attributes: ["id", "email"] },
        { model: Role, where: role_name ? { role_name: { [Op.iLike]: `%${role_name}%` } } : {}, attributes: ["id", "role_name"] },
        { model: Account, attributes: ["id", "account_name"] }
      ]
    });

    res.json({ success: true, data: members });
  } catch (err) {
    console.error("Error searching members:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
