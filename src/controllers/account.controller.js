import { Account, Destination, AccountMember, User } from "../models/Index.js";
import { createLog } from "./log.controller.js";
import { Op } from "sequelize";

// Create Account (Admin Only)
export const createAccount = async (req, res) => {
  try {
    const { account_name, website } = req.body;

    const account = await Account.create({
      account_name,
      website,
      created_by: req.user.id,
      updated_by: req.user.id,
    });

    await createLog(
      req.user.id,
      "CREATE",
      "Account",
      account.id,
      { account_name, website },
      account.id,
      null
    );

    // ✅ Return 201 and `data` key
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Accounts
export const getAccounts = async (req, res) => {
  try {
    let accounts;
    if (req.user.role === "Admin") {
      accounts = await Account.findAll();
    } else {
      accounts = await Account.findAll({
        include: [
          {
            model: AccountMember,
            where: { user_id: req.user.id },
            required: false,
          },
        ],
      });
    }

    // ✅ Wrap in `data` key
    res.status(200).json({ success: true, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Single Account by ID
export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: "Account not found" });

    res.status(200).json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Account
export const updateAccount = async (req, res) => {
  try {
    const { account_name, website } = req.body;
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: "Account not found" });

    const oldData = { account_name: account.account_name, website: account.website };

    account.account_name = account_name || account.account_name;
    account.website = website || account.website;
    account.updated_by = req.user.id;

    await account.save();

    await createLog(
      req.user.id,
      "UPDATE",
      "Account",
      account.id,
      { before: oldData, after: { account_name: account.account_name, website: account.website } },
      account.id,
      null
    );

    res.status(200).json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id);
    if (!account) return res.status(404).json({ success: false, message: "Account not found" });

    const accountData = { account_name: account.account_name, website: account.website };

    await Destination.destroy({ where: { account_id: account.id } });
    await AccountMember.destroy({ where: { account_id: account.id } });

    await account.destroy();

    await createLog(
      req.user.id,
      "DELETE",
      "Account",
      account.id,
      accountData,
      account.id,
      null
    );

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Search Accounts
export const searchAccounts = async (req, res) => {
  try {
    const { name, website, created_by, start_date, end_date } = req.query;
    const where = {};

    if (name) where.account_name = { [Op.iLike]: `%${name}%` };
    if (website) where.website = { [Op.iLike]: `%${website}%` };
    if (created_by) where.created_by = created_by;
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }

    const accounts = await Account.findAll({
      where,
      include: [
        {
          model: AccountMember,
          include: [{ model: User, attributes: ["id", "email"] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ success: true, data: accounts });
  } catch (err) {
    console.error("Error searching accounts:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
