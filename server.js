import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./src/routes/user.routes.js";
import cargoRoutes from "./src/routes/cargo.routes.js";
import tripRoutes from "./src/routes/trip.routes.js";
import reportRoutes from "./src/routes/report.routes.js";
import ticketRoutes from "./src/routes/ticket.routes.js";
import seatRoutes from "./src/routes/seat.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import routeDataRoutes from "./src/routes/route.routes.js";
import vehicleRoutes from "./src/routes/vehicle.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import { errorHandler, notFound } from "./src/middlewares/error.middleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cargo", cargoRoutes);
app.use("/api/trip", tripRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/seat", seatRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/routes", routeDataRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/payments", paymentRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
