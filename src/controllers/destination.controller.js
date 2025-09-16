import Destination from "../models/Destination.js";
import { createLog } from "./log.controller.js";
import { Op } from "sequelize";
import Account from "../models/Account.js";
import Log from "../models/Log.js";

// Create Destination
export const createDestination = async (req, res) => {
  try {
    const { account_id, url, method, headers } = req.body;

    const destination = await Destination.create({ account_id, url, method, headers });

    await createLog(
      req.user.id,
      "CREATE",
      "Destination",
      destination.id,
      { account_id, url, method, headers },
      account_id,
      destination.id
    );

    res.status(201).json({ success: true, data: destination }); // ✅ 201
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Destinations
export const getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.findAll();
    res.status(200).json({ success: true, data: destinations }); // ✅ key: data
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Destination
export const updateDestination = async (req, res) => {
  try {
    const { url, method, headers } = req.body;
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });

    const oldData = { url: destination.url, method: destination.method, headers: destination.headers };

    await destination.update({ url: url || destination.url, method: method || destination.method, headers: headers || destination.headers });

    await createLog(
      req.user.id,
      "UPDATE",
      "Destination",
      destination.id,
      { before: oldData, after: { url, method, headers } },
      destination.account_id,
      destination.id
    );

    res.status(200).json({ success: true, data: destination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Destination
export const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });

    // Delete related logs first to avoid FK error
    await Log.destroy({ where: { destination_id: destination.id } });

    await destination.destroy();

    await createLog(
      req.user.id,
      "DELETE",
      "Destination",
      destination.id,
      { account_id: destination.account_id, url: destination.url, method: destination.method, headers: destination.headers },
      destination.account_id,
      destination.id
    );

    res.status(200).json({ success: true, message: "Destination deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Search Destinations
export const searchDestinations = async (req, res) => {
  try {
    const { url, method, account_id, start_date, end_date } = req.query;

    const where = {};
    if (url) where.url = { [Op.iLike]: `%${url}%` };
    if (method) where.method = method.toUpperCase();
    if (account_id) where.account_id = account_id;
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[Op.gte] = new Date(start_date);
      if (end_date) where.created_at[Op.lte] = new Date(end_date);
    }

    const destinations = await Destination.findAll({
      where,
      include: [{ model: Account, attributes: ["id", "account_name"] }],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ success: true, data: destinations });
  } catch (err) {
    console.error("Error searching destinations:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findByPk(req.params.id);
    if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });

    res.json({ success: true, destination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};