import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('site');
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'E-Commerce Store',
    siteLogo: '',
    siteDescription: 'Your online store',
    contactEmail: 'contact@store.com',
  });
  const [paymentSettings, setPaymentSettings] = useState({
    enableStripe: true,
    enablePaypal: false,
    enableCOD: true,
    stripeKey: '',
    paypalKey: '',
  });
  const [shippingSettings, setShippingSettings] = useState({
    shippingCost: '10',
    freeShippingThreshold: '100',
    shippingDays: '3-5',
  });
  const [taxSettings, setTaxSettings] = useState({
    taxRate: '8',
    taxDescription: 'Sales Tax',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    // Settings would be fetched from API
  }, []);

  const handleSaveSiteSettings = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/admin/settings-site`, siteSettings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving site settings:', error);
      alert(error.response?.data?.message || 'Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/admin/settings-payment`, paymentSettings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      alert(error.response?.data?.message || 'Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShippingSettings = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/admin/settings-shipping`, shippingSettings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving shipping settings:', error);
      alert(error.response?.data?.message || 'Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTaxSettings = async () => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/admin/settings-tax`, taxSettings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving tax settings:', error);
      alert(error.response?.data?.message || 'Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure your store settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {['site', 'payment', 'shipping', 'tax'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 transition-colors capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab} Settings
            </button>
          ))}
        </div>

        {saved && (
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg">
            Settings saved successfully!
          </div>
        )}

        {/* Site Settings */}
        {activeTab === 'site' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Site Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      siteName: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Site Logo URL
                </label>
                <input
                  type="url"
                  value={siteSettings.siteLogo}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      siteLogo: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Site Description
                </label>
                <textarea
                  value={siteSettings.siteDescription}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      siteDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      contactEmail: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <button
                onClick={handleSaveSiteSettings}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Payment Settings</h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={paymentSettings.enableStripe}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        enableStripe: e.target.checked,
                      })
                    }
                    id="enableStripe"
                  />
                  <label htmlFor="enableStripe" className="font-medium">
                    Enable Stripe
                  </label>
                </div>
                {paymentSettings.enableStripe && (
                  <input
                    type="password"
                    placeholder="Stripe API Key"
                    value={paymentSettings.stripeKey}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        stripeKey: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={paymentSettings.enablePaypal}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        enablePaypal: e.target.checked,
                      })
                    }
                    id="enablePaypal"
                  />
                  <label htmlFor="enablePaypal" className="font-medium">
                    Enable PayPal
                  </label>
                </div>
                {paymentSettings.enablePaypal && (
                  <input
                    type="password"
                    placeholder="PayPal API Key"
                    value={paymentSettings.paypalKey}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        paypalKey: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={paymentSettings.enableCOD}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      enableCOD: e.target.checked,
                    })
                  }
                  id="enableCOD"
                />
                <label htmlFor="enableCOD" className="font-medium">
                  Enable Cash On Delivery
                </label>
              </div>

              <button
                onClick={handleSavePaymentSettings}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Shipping Settings */}
        {activeTab === 'shipping' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Shipping Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  value={shippingSettings.shippingCost}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      shippingCost: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Free Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  value={shippingSettings.freeShippingThreshold}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      freeShippingThreshold: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Shipping Days
                </label>
                <input
                  type="text"
                  value={shippingSettings.shippingDays}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      shippingDays: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <button
                onClick={handleSaveShippingSettings}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Tax Settings */}
        {activeTab === 'tax' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Tax Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={taxSettings.taxRate}
                  onChange={(e) =>
                    setTaxSettings({
                      ...taxSettings,
                      taxRate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tax Description
                </label>
                <input
                  type="text"
                  value={taxSettings.taxDescription}
                  onChange={(e) =>
                    setTaxSettings({
                      ...taxSettings,
                      taxDescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                />
              </div>
              <button
                onClick={handleSaveTaxSettings}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
