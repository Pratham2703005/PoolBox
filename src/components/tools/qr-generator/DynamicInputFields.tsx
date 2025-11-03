"use client";

import { QRDataType } from "@/lib/qr-generator";

interface DynamicInputFieldsProps {
  qrType: QRDataType;
  formData: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
}

const inputClass = "w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
const textareaClass = "w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none";

export default function DynamicInputFields({
  qrType,
  formData,
  onChange,
}: DynamicInputFieldsProps) {
  const updateField = (key: string, value: string) => {
    onChange({ ...formData, [key]: value });
  };

  switch (qrType) {
    case "text":
      return (
        <div className="space-y-2">
          <label htmlFor="text" className={labelClass}>Text / Message</label>
          <textarea
            id="text"
            placeholder="Enter your text message..."
            value={formData.text || ""}
            onChange={(e) => updateField("text", e.target.value)}
            rows={4}
            className={textareaClass}
          />
        </div>
      );

    case "url":
      return (
        <div className="space-y-2">
          <label htmlFor="url" className={labelClass}>URL / Link</label>
          <input
            id="url"
            type="url"
            placeholder="https://example.com"
            value={formData.url || ""}
            onChange={(e) => updateField("url", e.target.value)}
            className={inputClass}
          />
        </div>
      );

    case "phone":
      return (
        <div className="space-y-2">
          <label htmlFor="phone" className={labelClass}>Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={formData.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-gray-500">
            Include country code (e.g., +91 for India)
          </p>
        </div>
      );

    case "email":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className={labelClass}>Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className={labelClass}>Subject (Optional)</label>
            <input
              id="subject"
              placeholder="Email subject"
              value={formData.subject || ""}
              onChange={(e) => updateField("subject", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="body" className={labelClass}>Body (Optional)</label>
            <textarea
              id="body"
              placeholder="Email body..."
              value={formData.body || ""}
              onChange={(e) => updateField("body", e.target.value)}
              rows={3}
              className={textareaClass}
            />
          </div>
        </div>
      );

    case "sms":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="smsPhone" className={labelClass}>Phone Number</label>
            <input
              id="smsPhone"
              type="tel"
              placeholder="+1234567890"
              value={formData.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className={labelClass}>Message (Optional)</label>
            <textarea
              id="message"
              placeholder="Pre-filled SMS message..."
              value={formData.message || ""}
              onChange={(e) => updateField("message", e.target.value)}
              rows={3}
              className={textareaClass}
            />
          </div>
        </div>
      );

    case "wifi":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="ssid" className={labelClass}>Network Name (SSID)</label>
            <input
              id="ssid"
              placeholder="MyWiFiNetwork"
              value={formData.ssid || ""}
              onChange={(e) => updateField("ssid", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className={labelClass}>Password</label>
            <input
              id="password"
              type="text"
              placeholder="WiFi password"
              value={formData.password || ""}
              onChange={(e) => updateField("password", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="encryption" className={labelClass}>Encryption Type</label>
            <select
              id="encryption"
              value={formData.encryption || "WPA"}
              onChange={(e) => updateField("encryption", e.target.value)}
              className={inputClass}
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None (Open Network)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                id="hidden"
                type="checkbox"
                checked={formData.hidden === "true"}
                onChange={(e) =>
                  updateField("hidden", e.target.checked ? "true" : "false")
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className={labelClass}>Hidden Network</span>
            </label>
          </div>
        </div>
      );

    case "vcard":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="firstName" className={labelClass}>First Name</label>
              <input
                id="firstName"
                placeholder="John"
                value={formData.firstName || ""}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className={labelClass}>Last Name</label>
              <input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName || ""}
                onChange={(e) => updateField("lastName", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="organization" className={labelClass}>Organization (Optional)</label>
            <input
              id="organization"
              placeholder="Company Name"
              value={formData.organization || ""}
              onChange={(e) => updateField("organization", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="vcardPhone" className={labelClass}>Phone</label>
            <input
              id="vcardPhone"
              type="tel"
              placeholder="+1234567890"
              value={formData.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="vcardEmail" className={labelClass}>Email</label>
            <input
              id="vcardEmail"
              type="email"
              placeholder="john@example.com"
              value={formData.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="website" className={labelClass}>Website (Optional)</label>
            <input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website || ""}
              onChange={(e) => updateField("website", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      );

    case "event":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="eventTitle" className={labelClass}>Event Title</label>
            <input
              id="eventTitle"
              placeholder="Meeting with Team"
              value={formData.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="startDate" className={labelClass}>Start Date & Time</label>
            <input
              id="startDate"
              type="datetime-local"
              value={formData.startDate || ""}
              onChange={(e) => updateField("startDate", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="endDate" className={labelClass}>End Date & Time</label>
            <input
              id="endDate"
              type="datetime-local"
              value={formData.endDate || ""}
              onChange={(e) => updateField("endDate", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className={labelClass}>Location (Optional)</label>
            <input
              id="location"
              placeholder="Conference Room A"
              value={formData.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className={labelClass}>Description (Optional)</label>
            <textarea
              id="description"
              placeholder="Event description..."
              value={formData.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className={textareaClass}
            />
          </div>
        </div>
      );

    case "location":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="latitude" className={labelClass}>Latitude</label>
            <input
              id="latitude"
              type="number"
              step="any"
              placeholder="37.7749"
              value={formData.latitude || ""}
              onChange={(e) => updateField("latitude", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="longitude" className={labelClass}>Longitude</label>
            <input
              id="longitude"
              type="number"
              step="any"
              placeholder="-122.4194"
              value={formData.longitude || ""}
              onChange={(e) => updateField("longitude", e.target.value)}
              className={inputClass}
            />
          </div>
          <p className="text-xs text-gray-500">
            Tip: You can get coordinates from Google Maps by right-clicking on a
            location
          </p>
        </div>
      );

    case "upi":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="upiId" className={labelClass}>UPI ID</label>
            <input
              id="upiId"
              placeholder="username@upi"
              value={formData.upiId || ""}
              onChange={(e) => updateField("upiId", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className={labelClass}>Payee Name</label>
            <input
              id="name"
              placeholder="John Doe"
              value={formData.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="amount" className={labelClass}>Amount (Optional)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="100.00"
              value={formData.amount || ""}
              onChange={(e) => updateField("amount", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="note" className={labelClass}>Note (Optional)</label>
            <input
              id="note"
              placeholder="Payment for services"
              value={formData.note || ""}
              onChange={(e) => updateField("note", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      );

    case "social":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="platform" className={labelClass}>Social Platform</label>
            <select
              id="platform"
              value={formData.platform || "instagram"}
              onChange={(e) => updateField("platform", e.target.value)}
              className={inputClass}
            >
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter/X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="github">GitHub</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="username" className={labelClass}>Username / Profile URL</label>
            <input
              id="username"
              placeholder="yourusername"
              value={formData.username || ""}
              onChange={(e) => updateField("username", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      );

    case "appstore":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="store" className={labelClass}>App Store</label>
            <select
              id="store"
              value={formData.store || "ios"}
              onChange={(e) => updateField("store", e.target.value)}
              className={inputClass}
            >
              <option value="ios">Apple App Store</option>
              <option value="android">Google Play Store</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="appId" className={labelClass}>
              {formData.store === "android" ? "Package Name" : "App ID"}
            </label>
            <input
              id="appId"
              placeholder={
                formData.store === "android"
                  ? "com.example.app"
                  : "id1234567890"
              }
              value={formData.appId || ""}
              onChange={(e) => updateField("appId", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}
