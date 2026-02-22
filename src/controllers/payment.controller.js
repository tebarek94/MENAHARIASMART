import {
  getAllPayments,
  getPaymentById,
} from "../models/payment.model.js";

export const listPayments = async (req, res) => {
  try {
    const payments = await getAllPayments();
    res.json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentById(id);
    if (payment.length === 0)
      return res.status(404).json({ message: "Payment not found" });
    res.json({ payment: payment[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
