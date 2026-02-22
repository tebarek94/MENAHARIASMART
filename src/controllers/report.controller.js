import {
  getAllReports,
  getReportById,
  createReport,
  deleteReport,
} from "../models/report.model.js";
import {
  generateReportData,
  REPORT_TYPES,
} from "../services/reportGenerator.service.js";

// ==================
// List all reports
// ==================
export const listReports = async (req, res) => {
  try {
    const reports = await getAllReports();
    res.json({ reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Get report by ID
// ==================
export const getReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getReportById(id);
    if (report.length === 0)
      return res.status(404).json({ message: "Report not found" });
    res.json({ report: report[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Generate report (returns data only; does not save)
// ==================
export const generateReport = async (req, res) => {
  try {
    const { report_type, date_from, date_to } = req.body;
    if (!report_type) {
      return res.status(400).json({
        message: "report_type is required",
        allowed_types: REPORT_TYPES,
      });
    }
    if (!REPORT_TYPES.includes(report_type)) {
      return res.status(400).json({
        message: `Invalid report_type. Allowed: ${REPORT_TYPES.join(", ")}`,
      });
    }
    const data = await generateReportData(report_type, {
      date_from: date_from || null,
      date_to: date_to || null,
    });
    res.json({
      report_type,
      filters: { date_from: date_from || null, date_to: date_to || null },
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

// ==================
// Create new report (generates data, saves record, returns data)
// ==================
export const createNewReport = async (req, res) => {
  try {
    const { report_type, date_from, date_to } = req.body;
    const generated_by = req.user?.user_id ?? req.user?.id;
    if (!generated_by) {
      return res.status(401).json({ message: "User not found" });
    }
    if (!report_type) {
      return res.status(400).json({
        message: "report_type is required",
        allowed_types: REPORT_TYPES,
      });
    }
    if (!REPORT_TYPES.includes(report_type)) {
      return res.status(400).json({
        message: `Invalid report_type. Allowed: ${REPORT_TYPES.join(", ")}`,
      });
    }
    const data = await generateReportData(report_type, {
      date_from: date_from || null,
      date_to: date_to || null,
    });
    const report_id = await createReport(report_type, generated_by);
    res.status(201).json({
      message: "Report created",
      report_id,
      report_type,
      filters: { date_from: date_from || null, date_to: date_to || null },
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// ==================
// Get report types (for UI dropdowns)
// ==================
export const getReportTypes = async (req, res) => {
  try {
    res.json({ report_types: REPORT_TYPES });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================
// Delete report
// ==================
export const removeReport = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteReport(id);
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
