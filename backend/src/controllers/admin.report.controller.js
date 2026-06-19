import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import {
  generateSalesReport,
  generateProductReport,
  generateCustomerReport,
  generateRevenueReport,
  generateInventoryReport,
  generateCSVFile,
} from '../services/report.service.js';

/**
 * Get sales report
 */
export const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, 'startDate and endDate are required');
  }

  const report = await generateSalesReport(startDate, endDate);

  res.status(200).json(
    new ApiResponse(200, report, 'Sales report generated successfully')
  );
});

/**
 * Get product performance report
 */
export const getProductReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, 'startDate and endDate are required');
  }

  const report = await generateProductReport(startDate, endDate);

  res.status(200).json(
    new ApiResponse(200, report, 'Product report generated successfully')
  );
});

/**
 * Get customer report
 */
export const getCustomerReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, 'startDate and endDate are required');
  }

  const report = await generateCustomerReport(startDate, endDate);

  res.status(200).json(
    new ApiResponse(200, report, 'Customer report generated successfully')
  );
});

/**
 * Get revenue report
 */
export const getRevenueReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, 'startDate and endDate are required');
  }

  const report = await generateRevenueReport(startDate, endDate);

  res.status(200).json(
    new ApiResponse(200, report, 'Revenue report generated successfully')
  );
});

/**
 * Get inventory report
 */
export const getInventoryReport = asyncHandler(async (req, res) => {
  const report = await generateInventoryReport();

  res.status(200).json(
    new ApiResponse(200, report, 'Inventory report generated successfully')
  );
});

/**
 * Export report as CSV
 */
export const exportReportAsCSV = asyncHandler(async (req, res) => {
  const { reportType, startDate, endDate } = req.query;

  if (!reportType) {
    throw new ApiError(400, 'reportType is required');
  }

  let data;
  switch (reportType) {
    case 'sales':
      if (!startDate || !endDate)
        throw new ApiError(400, 'startDate and endDate required');
      data = await generateSalesReport(startDate, endDate);
      break;
    case 'products':
      if (!startDate || !endDate)
        throw new ApiError(400, 'startDate and endDate required');
      data = await generateProductReport(startDate, endDate);
      break;
    case 'customers':
      if (!startDate || !endDate)
        throw new ApiError(400, 'startDate and endDate required');
      data = await generateCustomerReport(startDate, endDate);
      break;
    case 'revenue':
      if (!startDate || !endDate)
        throw new ApiError(400, 'startDate and endDate required');
      data = await generateRevenueReport(startDate, endDate);
      break;
    case 'inventory':
      data = [await generateInventoryReport()];
      break;
    default:
      throw new ApiError(400, 'Invalid reportType');
  }

  const { filename, csv } = generateCSVFile(reportType, data, startDate, endDate);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});
