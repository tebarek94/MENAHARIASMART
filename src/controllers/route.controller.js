import {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} from "../models/route.model.js";

export const listRoutes = async (req, res) => {
  try {
    const routes = await getAllRoutes();
    res.json({ routes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const route = await getRouteById(id);
    if (route.length === 0)
      return res.status(404).json({ message: "Route not found" });
    res.json({ route: route[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createNewRoute = async (req, res) => {
  try {
    const { origin, destination } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({
        message: "origin and destination are required",
      });
    }
    const route_id = await createRoute(origin, destination);
    res.status(201).json({ message: "Route created", route_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateExistingRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { origin, destination } = req.body;
    await updateRoute(id, origin, destination);
    res.json({ message: "Route updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeRoute = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRoute(id);
    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
