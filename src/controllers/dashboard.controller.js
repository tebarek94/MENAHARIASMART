import {
  getActiveTrips,
  getTicketsSoldToday,
  getSeatOccupancyPerTrip,
  getTopRevenueRoute,
  getDailyRevenueReport,
} from "../models/dashboard.model.js";

// ==================
// Get dashboard summary
// ==================
export const getDashboardSummary = async (req, res) => {
  try {
    const [activeTrips, ticketsToday, seatOccupancy, topRoute] =
      await Promise.all([
        getActiveTrips(),
        getTicketsSoldToday(),
        getSeatOccupancyPerTrip(),
        getTopRevenueRoute(),
      ]);

    res.json({
      active_trips: activeTrips.active_trips,
      tickets_sold_today: ticketsToday.tickets_sold_today,
      seat_occupancy: seatOccupancy,
      top_revenue_route: topRoute,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get active trips
// ==================
export const getActiveTripsController = async (req, res) => {
  try {
    const result = await getActiveTrips();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get tickets sold today
// ==================
export const getTicketsSoldTodayController = async (req, res) => {
  try {
    const result = await getTicketsSoldToday();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get seat occupancy per trip
// ==================
export const getSeatOccupancyController = async (req, res) => {
  try {
    const result = await getSeatOccupancyPerTrip();
    res.json({ seat_occupancy: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get top revenue route
// ==================
export const getTopRevenueRouteController = async (req, res) => {
  try {
    const result = await getTopRevenueRoute();
    res.json({ top_revenue_route: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get daily revenue report
// ==================
export const getDailyRevenueController = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split("T")[0]; // Default to today (YYYY-MM-DD)
    const result = await getDailyRevenueReport(reportDate);
    res.json({ report: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
