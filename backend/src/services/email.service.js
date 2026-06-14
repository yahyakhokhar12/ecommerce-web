import { sendEmail } from '../utils/sendEmail.js';
import { config } from '../config/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadTemplate = (name, variables) => {
  const filePath = path.join(__dirname, '../templates/email', `${name}.html`);
  let html = fs.readFileSync(filePath, 'utf-8');
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(regex, variables[key]);
  });
  return html;
};

export const sendWelcomeEmail = async (user) => {
  const html = loadTemplate('registration', {
    name: user.name,
    email: user.email,
    loginUrl: config.clientUrl + '/login',
    year: new Date().getFullYear(),
  });
  await sendEmail({ to: user.email, subject: 'Welcome to Our Store 🎉', html });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = loadTemplate('passwordReset', {
    name: user.name,
    resetUrl,
    year: new Date().getFullYear(),
  });
  await sendEmail({ to: user.email, subject: 'Password Reset Request', html });
};

export const sendOrderConfirmation = async (user, order) => {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td>${i.title}</td><td>${i.quantity}</td><td>$${i.price.toFixed(2)}</td><td>$${(i.price * i.quantity).toFixed(2)}</td></tr>`
    )
    .join('');
  const html = loadTemplate('orderConfirmation', {
    name: user.name,
    orderNumber: order.orderNumber,
    items: itemsHtml,
    total: order.totalPrice.toFixed(2),
    year: new Date().getFullYear(),
  });
  await sendEmail({ to: user.email, subject: `Order ${order.orderNumber} Confirmed`, html });
};

export const sendOrderShippedEmail = async (user, order) => {
  const html = loadTemplate('orderShipped', {
    name: user.name,
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber,
    carrier: order.carrier,
    year: new Date().getFullYear(),
  });
  await sendEmail({ to: user.email, subject: `Order ${order.orderNumber} Shipped 🚚`, html });
};

export const sendOrderDeliveredEmail = async (user, order) => {
  const html = loadTemplate('orderDelivered', {
    name: user.name,
    orderNumber: order.orderNumber,
    year: new Date().getFullYear(),
  });
  await sendEmail({ to: user.email, subject: `Order ${order.orderNumber} Delivered ✅`, html });
};
