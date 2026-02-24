import {
  getAllTickets as getAllTicketsModel,
  getTicketById as getTicketByIdModel,
  getTicketByIdWithDetails as getTicketByIdWithDetailsModel,
  createTicket as createTicketModel,
  updateTicket as updateTicketModel,
  updateTicketQRCode as updateTicketQRCodeModel,
  deleteTicket as deleteTicketModel,
} from "../models/ticket.model.js";
import { generateQRCode, generateQRCodeBuffer } from "../utils/qrcode.util.js";

// ==================
// List all tickets
// ==================
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await getAllTicketsModel();
    res.json({ tickets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get ticket by ID
// ==================
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketsWithDetails = await getTicketByIdWithDetailsModel(id);
    if (ticketsWithDetails.length === 0)
      return res.status(404).json({ message: "Ticket not found" });

    // Return rich ticket details (passenger, driver, vehicle, payment, seat)
    const ticket = ticketsWithDetails[0];
    res.json({ ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Create ticket
// ==================
export const createTicket = async (req, res) => {
  try {
    const { trip_id, passenger_id, seat_number } = req.body;

    // Validate required fields
    if (!trip_id || !passenger_id || !seat_number) {
      return res.status(400).json({
        message: "Missing required fields: trip_id, passenger_id, and seat_number are required",
      });
    }

    const ticket_id = await createTicketModel(trip_id, passenger_id, seat_number);

    // Get the created ticket with passenger name and trip details for QR code
    const ticketsWithDetails = await getTicketByIdWithDetailsModel(ticket_id);
    if (ticketsWithDetails.length === 0) {
      return res.status(500).json({ message: "Failed to retrieve created ticket" });
    }

    const ticket = ticketsWithDetails[0];

    // Generate QR code (includes passenger_name, trip, trip_description)
    const qrCodeDataURL = await generateQRCode(ticket);

    // Update ticket with QR code
    await updateTicketQRCodeModel(ticket_id, qrCodeDataURL);

    res.status(201).json({
      message: "Ticket created",
      ticket_id,
      qr_code: qrCodeDataURL,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Update ticket
// ==================
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { ticket_status, payment_status } = req.body;
    if (ticket_status === undefined && payment_status === undefined) {
      return res.status(400).json({
        message: "At least one of ticket_status or payment_status is required",
      });
    }
    await updateTicketModel(id, ticket_status, payment_status);
    res.json({ message: "Ticket updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get QR code image
// ==================
export const getTicketQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketsWithDetails = await getTicketByIdWithDetailsModel(id);
    if (ticketsWithDetails.length === 0)
      return res.status(404).json({ message: "Ticket not found" });

    const ticketData = ticketsWithDetails[0];

    // If QR code already exists and is valid, return it
    if (ticketData.qr_code && typeof ticketData.qr_code === "string") {
      try {
        if (ticketData.qr_code.includes(",")) {
          const base64Data = ticketData.qr_code.split(",")[1];
          if (base64Data) {
            const buffer = Buffer.from(base64Data, "base64");
            res.type("image/png");
            return res.send(buffer);
          }
        }
      } catch (parseError) {
        console.error("Error parsing existing QR code:", parseError);
      }
    }

    // Generate new QR code with passenger name, trip, and description
    const qrCodeDataURL = await generateQRCode(ticketData);

    // Update ticket with QR code
    await updateTicketQRCodeModel(id, qrCodeDataURL);

    // Extract base64 data and send as image
    const base64Data = qrCodeDataURL.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    res.type("image/png");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Delete ticket
// ==================
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTicketModel(id);
    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
