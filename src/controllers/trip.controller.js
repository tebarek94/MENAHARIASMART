import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../models/trip.model.js";

// ==================
// List all trips
// ==================
export const listTrips = async (req, res) => {
  try {
    const trips = await getAllTrips();
    res.json({ trips });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get trip by ID
// ==================
export const getTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await getTripById(id);
    if (trip.length === 0)
      return res.status(404).json({ message: "Trip not found" });
    res.json({ trip: trip[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Create new trip
// ==================
export const createNewTrip = async (req, res) => {
  try {
    const {
      route_id,
      vehicle_id,
      driver_id,
      departure_time,
      arrival_time,
      price,
    } = req.body;
    const trip_id = await createTrip(
      route_id,
      vehicle_id,
      driver_id,
      departure_time,
      arrival_time,
      price,
    );
    res.status(201).json({ message: "Trip created", trip_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Update trip
// ==================
export const updateExistingTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      route_id,
      vehicle_id,
      driver_id,
      departure_time,
      arrival_time,
      price,
      status,
    } = req.body;
    await updateTrip(
      id,
      route_id,
      vehicle_id,
      driver_id,
      departure_time,
      arrival_time,
      price,
      status,
    );
    res.json({ message: "Trip updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Delete trip
// ==================
export const removeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTrip(id);
    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
