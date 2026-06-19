import Settings from '../models/Settings.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Get all settings
 */
export const getAllSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.find();

  res.status(200).json(new ApiResponse(200, settings, 'Settings retrieved successfully'));
});

/**
 * Get settings by category
 */
export const getSettingsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const validCategories = ['site', 'payment', 'email', 'shipping', 'tax', 'security', 'storage'];
  if (!validCategories.includes(category)) {
    throw new ApiError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  const settings = await Settings.find({ category });

  res.status(200).json(
    new ApiResponse(200, settings, `${category} settings retrieved successfully`)
  );
});

/**
 * Get single setting by key
 */
export const getSettingByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const setting = await Settings.findOne({ key });

  if (!setting) {
    throw new ApiError(404, `Setting with key '${key}' not found`);
  }

  res.status(200).json(new ApiResponse(200, setting, 'Setting retrieved successfully'));
});

/**
 * Create or update setting
 */
export const upsertSetting = asyncHandler(async (req, res) => {
  const { key, value, category, dataType, isPublic, description } = req.body;

  if (!key || value === undefined) {
    throw new ApiError(400, 'key and value are required');
  }

  const validCategories = ['site', 'payment', 'email', 'shipping', 'tax', 'security', 'storage'];
  if (category && !validCategories.includes(category)) {
    throw new ApiError(400, `Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  let setting = await Settings.findOne({ key });

  if (setting) {
    setting.value = value;
    if (category) setting.category = category;
    if (dataType) setting.dataType = dataType;
    if (typeof isPublic === 'boolean') setting.isPublic = isPublic;
    if (description) setting.description = description;
    await setting.save();
  } else {
    setting = new Settings({
      key,
      value,
      category: category || 'site',
      dataType: dataType || 'string',
      isPublic: isPublic !== undefined ? isPublic : false,
      description,
    });
    await setting.save();
  }

  logger.info(`Setting '${key}' updated by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, setting, 'Setting saved successfully'));
});

/**
 * Delete setting
 */
export const deleteSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const setting = await Settings.findOneAndDelete({ key });

  if (!setting) {
    throw new ApiError(404, `Setting with key '${key}' not found`);
  }

  logger.info(`Setting '${key}' deleted by admin ${req.user._id}`);

  res.status(200).json(new ApiResponse(200, {}, 'Setting deleted successfully'));
});

/**
 * Get site configuration (Public)
 */
export const getSiteConfig = asyncHandler(async (req, res) => {
  const siteSettings = await Settings.find({ category: 'site', isPublic: true });

  const config = {};
  siteSettings.forEach((setting) => {
    config[setting.key] = setting.value;
  });

  res.status(200).json(new ApiResponse(200, config, 'Site configuration retrieved successfully'));
});

/**
 * Update site settings
 */
export const updateSiteSettings = asyncHandler(async (req, res) => {
  const { siteName, siteLogo, siteFavicon, siteDescription, siteUrl, contactEmail, supportEmail } =
    req.body;

  const updates = [
    { key: 'siteName', value: siteName },
    { key: 'siteLogo', value: siteLogo },
    { key: 'siteFavicon', value: siteFavicon },
    { key: 'siteDescription', value: siteDescription },
    { key: 'siteUrl', value: siteUrl },
    { key: 'contactEmail', value: contactEmail },
    { key: 'supportEmail', value: supportEmail },
  ];

  for (const { key, value } of updates) {
    if (value !== undefined) {
      await Settings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }
  }

  logger.info(`Site settings updated by admin ${req.user._id}`);

  const updatedSettings = await Settings.find({ category: 'site' });

  res.status(200).json(new ApiResponse(200, updatedSettings, 'Site settings updated successfully'));
});

/**
 * Update payment settings
 */
export const updatePaymentSettings = asyncHandler(async (req, res) => {
  const { stripeKey, paypalKey, razorpayKey, enableStripe, enablePaypal, enableCOD } = req.body;

  const updates = [
    { key: 'stripeKey', value: stripeKey },
    { key: 'paypalKey', value: paypalKey },
    { key: 'razorpayKey', value: razorpayKey },
    { key: 'enableStripe', value: enableStripe },
    { key: 'enablePaypal', value: enablePaypal },
    { key: 'enableCOD', value: enableCOD },
  ];

  for (const { key, value } of updates) {
    if (value !== undefined) {
      await Settings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }
  }

  logger.info(`Payment settings updated by admin ${req.user._id}`);

  const updatedSettings = await Settings.find({ category: 'payment' });

  res.status(200).json(new ApiResponse(200, updatedSettings, 'Payment settings updated successfully'));
});

/**
 * Update shipping settings
 */
export const updateShippingSettings = asyncHandler(async (req, res) => {
  const { shippingCost, freeShippingThreshold, shippingDays } = req.body;

  const updates = [
    { key: 'shippingCost', value: shippingCost },
    { key: 'freeShippingThreshold', value: freeShippingThreshold },
    { key: 'shippingDays', value: shippingDays },
  ];

  for (const { key, value } of updates) {
    if (value !== undefined) {
      await Settings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }
  }

  logger.info(`Shipping settings updated by admin ${req.user._id}`);

  const updatedSettings = await Settings.find({ category: 'shipping' });

  res.status(200).json(new ApiResponse(200, updatedSettings, 'Shipping settings updated successfully'));
});

/**
 * Update tax settings
 */
export const updateTaxSettings = asyncHandler(async (req, res) => {
  const { taxRate, taxDescription } = req.body;

  const updates = [
    { key: 'taxRate', value: taxRate },
    { key: 'taxDescription', value: taxDescription },
  ];

  for (const { key, value } of updates) {
    if (value !== undefined) {
      await Settings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }
  }

  logger.info(`Tax settings updated by admin ${req.user._id}`);

  const updatedSettings = await Settings.find({ category: 'tax' });

  res.status(200).json(new ApiResponse(200, updatedSettings, 'Tax settings updated successfully'));
});
