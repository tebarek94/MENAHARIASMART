import QRCode from "qrcode";

/**
 * Build QR payload with passenger name, trip, and description
 * @param {Object} ticketData - Ticket info including passenger_name, trip details
 * @returns {string} JSON string for QR code
 */
const buildQRPayload = (ticketData) => ({
  ticket_id: ticketData.ticket_id,
  passenger_name: ticketData.passenger_name || null,
  trip: ticketData.origin && ticketData.destination
    ? `${ticketData.origin} → ${ticketData.destination}`
    : ticketData.trip_description || null,
  trip_description: ticketData.trip_description || (ticketData.origin && ticketData.destination
    ? `${ticketData.origin} to ${ticketData.destination}`
    : null),
  seat_number: ticketData.seat_number,
  departure_time: ticketData.departure_time,
  arrival_time: ticketData.arrival_time,
  issued_at: ticketData.issued_at,
});

/**
 * Generate QR code data URL (base64 image)
 * @param {Object} ticketData - Ticket information (with passenger_name, trip/route details)
 * @returns {Promise<string>} Base64 data URL of QR code
 */
export const generateQRCode = async (ticketData) => {
  try {
    const qrData = JSON.stringify(buildQRPayload(ticketData));

    // Generate QR code as data URL (base64 image)
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 1,
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
};

/**
 * Generate QR code as buffer (for saving to file or sending as image)
 * @param {Object} ticketData - Ticket information (with passenger_name, trip/route details)
 * @returns {Promise<Buffer>} Buffer containing QR code image
 */
export const generateQRCodeBuffer = async (ticketData) => {
  try {
    const qrData = JSON.stringify(buildQRPayload(ticketData));

    const buffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 1,
    });

    return buffer;
  } catch (error) {
    console.error("Error generating QR code buffer:", error);
    throw error;
  }
};
