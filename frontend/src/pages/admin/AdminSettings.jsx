import React, { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dailyReports: true,
    standardCheckIn: "09:00",
    standardCheckOut: "17:00",
    lateArrivalThreshold: 15,
    minimumWorkingHours: 4.5,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    fromEmail: "noreply@attendance.com",
    smtpPassword: "password",
    jwtSecretKey: "",
    sessionTimeout: 60,
    twoFactorAuth: false,
    automaticBackups: true,
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log("Saved settings:", settings);
    alert("Settings have been saved!");
  };

  const handleBackup = () => alert("Backup has been created.");
  const handleRestore = () => {
    if (window.confirm("Are you sure you want to restore from backup?")) {
      alert("Backup restored successfully.");
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-8 space-y-8">
      {/* Notification Settings */}
      <section className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Notification Settings
        </h2>
        <p className="text-gray-600 text-sm mt-1 mb-4">
          Configure how and when you receive notifications
        </p>

        {[
          {
            id: "emailNotifications",
            title: "Email Notifications",
            desc: "Receive email alerts for absences and late arrivals",
          },
          {
            id: "smsNotifications",
            title: "SMS Notifications",
            desc: "Send SMS alerts to parents/guardians",
          },
          {
            id: "pushNotifications",
            title: "Push Notifications",
            desc: "Real-time push notifications via Firebase",
          },
          {
            id: "dailyReports",
            title: "Daily Reports",
            desc: "Automatically send daily attendance summary to admin",
          },
        ].map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-b-0 gap-2"
          >
            <div className="max-w-full sm:max-w-[75%]">
              <p className="font-medium text-gray-900">{item.title}</p>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer self-end sm:self-auto">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings[item.id]}
                onChange={(e) => handleChange(item.id, e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-gray-900 transition-all after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-5"></div>
            </label>
          </div>
        ))}
      </section>

      {/* Working Hours */}
      <section className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Working Hours Configuration
        </h2>
        <p className="text-gray-600 text-sm mt-1 mb-4">
          Set check-in/check-out time parameters
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              Standard Check-In Time
            </label>
            <input
              type="time"
              value={settings.standardCheckIn}
              onChange={(e) => handleChange("standardCheckIn", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              Standard Check-Out Time
            </label>
            <input
              type="time"
              value={settings.standardCheckOut}
              onChange={(e) => handleChange("standardCheckOut", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              Late Arrival Threshold (minutes)
            </label>
            <input
              type="number"
              value={settings.lateArrivalThreshold}
              min={0}
              onChange={(e) =>
                handleChange("lateArrivalThreshold", e.target.value)
              }
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              Minimum Working Hours
            </label>
            <input
              type="number"
              value={settings.minimumWorkingHours}
              onChange={(e) =>
                handleChange("minimumWorkingHours", e.target.value)
              }
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
        </div>
      </section>

      {/* Email Config */}
      <section className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Email Service Configuration
        </h2>
        <p className="text-gray-600 text-sm mt-1 mb-4">
          Configure SMTP settings for email notifications
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              SMTP Host
            </label>
            <input
              type="text"
              value={settings.smtpHost}
              onChange={(e) => handleChange("smtpHost", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              SMTP Port
            </label>
            <input
              type="number"
              value={settings.smtpPort}
              onChange={(e) => handleChange("smtpPort", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              From Email
            </label>
            <input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => handleChange("fromEmail", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              SMTP Password
            </label>
            <input
              type="password"
              value={settings.smtpPassword}
              onChange={(e) => handleChange("smtpPassword", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use app-specific password for Gmail or other providers
            </p>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Security Settings
        </h2>
        <p className="text-gray-600 text-sm mt-1 mb-4">
          Configure authentication and security options
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              JWT Secret Key
            </label>
            <input
              type="text"
              value={settings.jwtSecretKey}
              onChange={(e) => handleChange("jwtSecretKey", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              Keep this secret and never share it.
            </p>
          </div>
          <div>
            <label className="font-semibold text-gray-900 text-sm">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange("sessionTimeout", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md p-2 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-t">
          <div>
            <p className="font-medium text-gray-900">
              Two-Factor Authentication
            </p>
            <p className="text-gray-500 text-sm">
              Require 2FA for admin accounts
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.twoFactorAuth}
              onChange={(e) => handleChange("twoFactorAuth", e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-gray-900 transition-all after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-5"></div>
          </label>
        </div>
      </section>

      {/* Backup */}
      <section className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Database & Backup
        </h2>
        <p className="text-gray-600 text-sm mt-1 mb-4">
          Manage data backup and restoration
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b gap-2">
          <div>
            <p className="font-medium text-gray-900">Automatic Backups</p>
            <p className="text-gray-500 text-sm">
              Daily automatic database backups
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer self-end sm:self-auto">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.automaticBackups}
              onChange={(e) =>
                handleChange("automaticBackups", e.target.checked)
              }
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-gray-900 transition-all after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-5"></div>
          </label>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            className="border border-gray-900 text-gray-900 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            onClick={handleBackup}
          >
            Create Backup Now
          </button>
          <button
            className="border border-gray-900 text-gray-900 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            onClick={handleRestore}
          >
            Restore from Backup
          </button>
        </div>
      </section>

      {/* Save Button at Bottom */}
      <div className="max-w-7xl mx-auto flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="bg-gray-900 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-800 transition"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
}
