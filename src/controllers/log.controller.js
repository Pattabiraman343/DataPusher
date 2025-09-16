import Log from "../models/Log.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid"; // ✅ Import uuidv4

/**
 * Create a log entry
 * @param {number} user_id - ID of the user performing the action
 * @param {string} action - Action type (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {string} entity - Entity name (Account, Destination, AccountMember, User)
 * @param {number|null} entity_id - ID of the entity
 * @param {object|null} details - Extra details
 * @param {number|null} account_id - Related account ID (if any)
 * @param {number|null} destination_id - Related destination ID (if any)
 */
export const createLog = async (
  user_id,
  action,
  entity,
  entity_id = null,
  details = null,
  account_id = null,
  destination_id = null
) => {
  try {
    await Log.create({
      user_id,
      action,
      entity,
      entity_id,
      details,
      account_id,
      destination_id,
      event_id: uuidv4(), // ✅ generate unique event_id
      received_timestamp: new Date(), // optional if you want
      status: "pending" // you can update this later
    });
  } catch (err) {
    console.error("Failed to create log:", err.message);
  }
};

/**
 * Get all logs (Admin only)
 * Returns logs with user info, ordered by creation time descending
 */
export const getLogs = async (req, res) => {
  try {
    const logs = await Log.findAll({
      include: {
        model: User,
        attributes: ["id", "email", "role_id", "created_at", "updated_at"]
      },
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// GET /api/logs/search?account_id=&destination_id=&status=&start_date=&end_date=
export const searchLogs = async (req, res) => {
    try {
      const { account_id, destination_id, status, start_date, end_date } = req.query;
  
      const where = {};
      if (account_id) where.account_id = account_id;
      if (destination_id) where.destination_id = destination_id;
      if (status) where.status = status.toLowerCase();
      if (start_date || end_date) {
        where.received_timestamp = {};
        if (start_date) where.received_timestamp[Op.gte] = new Date(start_date);
        if (end_date) where.received_timestamp[Op.lte] = new Date(end_date);
      }
  
      const logs = await Log.findAll({
        where,
        include: [
          { model: Account, attributes: ["id", "account_name"] },
          { model: Destination, attributes: ["id", "url"] }
        ],
        order: [["received_timestamp", "DESC"]],
      });
  
      res.json({ success: true, data: logs });
    } catch (err) {
      console.error("Error searching logs:", err.message);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };
  