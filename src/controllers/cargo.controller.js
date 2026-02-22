import {
  getAllCargo,
  getCargoById,
  createCargo,
  createCargoWithAutoFee,
  updateCargo,
  deleteCargo,
  updateCargoStatus,
} from "../models/cargo.model.js";

// ==================
// GET ALL CARGO
// ==================
export const listCargo = async (req, res) => {
  try {
    const cargo = await getAllCargo();
    res.json({ cargo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// GET CARGO BY ID
// ==================
export const getCargo = async (req, res) => {
  try {
    const { id } = req.params;
    const cargo = await getCargoById(id);
    if (cargo.length === 0)
      return res.status(404).json({ message: "Cargo not found" });
    res.json({ cargo: cargo[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// CREATE CARGO
// ==================
export const createNewCargo = async (req, res) => {
  try {
    const { owner_id, trip_id, description, weight, fee, auto_calculate } =
      req.body;

    // Validate required base fields
    if (!owner_id || !trip_id || !description || weight === undefined) {
      return res.status(400).json({
        message:
          "owner_id, trip_id, description, and weight are required",
      });
    }

    // Use auto-calculation when fee is not provided or auto_calculate is true
    if (auto_calculate || fee === undefined || fee === null) {
      const result = await createCargoWithAutoFee(
        owner_id,
        trip_id,
        description,
        weight,
      );
      return res.status(201).json({
        message: result.message,
        calculated_fee: result.calculated_fee,
      });
    }

    // Manual fee entry
    const cargo_id = await createCargo(
      owner_id,
      trip_id,
      description,
      weight,
      fee,
    );
    res.status(201).json({ message: "Cargo created", cargo_id });
  } catch (err) {
    if (err.message?.includes("No cargo fee rule")) {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// UPDATE CARGO
// ==================
export const updateExistingCargo = async (req, res) => {
  try {
    const { id } = req.params;
    const { trip_id, description, weight, fee, status } = req.body;
    await updateCargo(id, trip_id, description, weight, fee, status);
    res.json({ message: "Cargo updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// DELETE CARGO
// ==================
export const removeCargo = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCargo(id);
    res.json({ message: "Cargo deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// UPDATE STATUS
// ==================
export const changeCargoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await updateCargoStatus(id, status);
    res.json({ message: `Cargo status updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
