import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../models/vehicle.model.js";

export const listVehicles = async (req, res) => {
  try {
    const vehicles = await getAllVehicles();
    res.json({ vehicles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await getVehicleById(id);
    if (vehicle.length === 0)
      return res.status(404).json({ message: "Vehicle not found" });
    res.json({ vehicle: vehicle[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createNewVehicle = async (req, res) => {
  try {
    const { plate_number } = req.body;
    if (!plate_number) {
      return res.status(400).json({
        message: "plate_number is required",
      });
    }
    const vehicle_id = await createVehicle(plate_number);
    res.status(201).json({ message: "Vehicle created", vehicle_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateExistingVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { plate_number } = req.body;
    if (!plate_number) {
      return res.status(400).json({ message: "plate_number is required" });
    }
    await updateVehicle(id, plate_number);
    res.json({ message: "Vehicle updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteVehicle(id);
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
