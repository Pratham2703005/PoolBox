"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { FiDownload, FiRefreshCcw, FiChevronDown, FiChevronUp } from "react-icons/fi";
import DynamicInputFields from "./DynamicInputFields";
import { QRDataType, generateQRData } from "@/lib/qr-generator";
import { useIsMounted } from "@/hooks/useIsMounted";
import type { DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from "@/types/qr-styling";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let QRCodeStyling: any = null;

export default function QRGeneratorTool() {
  const [qrType, setQrType] = useState<QRDataType>("text");
  const [qrData, setQrData] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const isMounted = useIsMounted();
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrCodeInstance = useRef<any>(null);

  // Main options
  const [qrSize, setQrSize] = useState(300);
  const [margin, setMargin] = useState(10);
  
  // QR Options
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>("M");
  
  // Dots options
  const [dotsColor, setDotsColor] = useState("#000000");
  const [dotsType, setDotsType] = useState<DotType>("rounded");
  const [dotsGradientEnabled, setDotsGradientEnabled] = useState(false);
  const [dotsGradientType, setDotsGradientType] = useState<"linear" | "radial">("linear");
  const [dotsGradientRotation, setDotsGradientRotation] = useState(0);
  const [dotsGradientColor1, setDotsGradientColor1] = useState("#000000");
  const [dotsGradientColor2, setDotsGradientColor2] = useState("#0066ff");
  
  // Background options
  const [bgColor, setBgColor] = useState("#ffffff");
  const [bgGradientEnabled, setBgGradientEnabled] = useState(false);
  const [bgGradientType, setBgGradientType] = useState<"linear" | "radial">("linear");
  const [bgGradientRotation, setBgGradientRotation] = useState(0);
  const [bgGradientColor1, setBgGradientColor1] = useState("#ffffff");
  const [bgGradientColor2, setBgGradientColor2] = useState("#e0e0e0");
  
  // Corner square options
  const [cornerSquareColor, setCornerSquareColor] = useState("#000000");
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>("extra-rounded");
  const [cornerSquareGradientEnabled, setCornerSquareGradientEnabled] = useState(false);
  const [cornerSquareGradientType, setCornerSquareGradientType] = useState<"linear" | "radial">("linear");
  const [cornerSquareGradientRotation, setCornerSquareGradientRotation] = useState(0);
  const [cornerSquareGradientColor1, setCornerSquareGradientColor1] = useState("#000000");
  const [cornerSquareGradientColor2, setCornerSquareGradientColor2] = useState("#0066ff");
  
  // Corner dots options
  const [cornerDotColor, setCornerDotColor] = useState("#000000");
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>("dot");
  const [cornerDotGradientEnabled, setCornerDotGradientEnabled] = useState(false);
  const [cornerDotGradientType, setCornerDotGradientType] = useState<"linear" | "radial">("linear");
  const [cornerDotGradientRotation, setCornerDotGradientRotation] = useState(0);
  const [cornerDotGradientColor1, setCornerDotGradientColor1] = useState("#000000");
  const [cornerDotGradientColor2, setCornerDotGradientColor2] = useState("#0066ff");
  
  // Image options
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState(0.4);
  const [imageMargin, setImageMargin] = useState(3);
  const [hideBackgroundDots, setHideBackgroundDots] = useState(true);
  
  // UI state
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    dots: true,
    cornerSquare: false,
    cornerDot: false,
    background: false,
    image: false,
    qr: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Load QRCodeStyling library
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('qr-code-styling').then((module) => {
        QRCodeStyling = module.default;
      });
    }
  }, []);

  // Generate/update QR code
  useEffect(() => {
    if (!qrData || !QRCodeStyling) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dotsOptions: any = {
      type: dotsType,
    };

    if (dotsGradientEnabled) {
      dotsOptions.gradient = {
        type: dotsGradientType,
        rotation: dotsGradientRotation,
        colorStops: [
          { offset: 0, color: dotsGradientColor1 },
          { offset: 1, color: dotsGradientColor2 },
        ],
      };
      delete dotsOptions.color;
    } else {
      dotsOptions.color = dotsColor;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backgroundOptions: any = {};

    if (bgGradientEnabled) {
      backgroundOptions.gradient = {
        type: bgGradientType,
        rotation: bgGradientRotation,
        colorStops: [
          { offset: 0, color: bgGradientColor1 },
          { offset: 1, color: bgGradientColor2 },
        ],
      };
    } else {
      backgroundOptions.color = bgColor;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cornersSquareOptions: any = {
      type: cornerSquareType,
    };

    if (cornerSquareGradientEnabled) {
      cornersSquareOptions.gradient = {
        type: cornerSquareGradientType,
        rotation: cornerSquareGradientRotation,
        colorStops: [
          { offset: 0, color: cornerSquareGradientColor1 },
          { offset: 1, color: cornerSquareGradientColor2 },
        ],
      };
      delete cornersSquareOptions.color;
    } else {
      cornersSquareOptions.color = cornerSquareColor;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cornersDotOptions: any = {
      type: cornerDotType,
    };

    if (cornerDotGradientEnabled) {
      cornersDotOptions.gradient = {
        type: cornerDotGradientType,
        rotation: cornerDotGradientRotation,
        colorStops: [
          { offset: 0, color: cornerDotGradientColor1 },
          { offset: 1, color: cornerDotGradientColor2 },
        ],
      };
      delete cornersDotOptions.color;
    } else {
      cornersDotOptions.color = cornerDotColor;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      width: qrSize,
      height: qrSize,
      data: qrData,
      margin: margin,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte' as const,
        errorCorrectionLevel: errorLevel,
      },
      imageOptions: {
        hideBackgroundDots: hideBackgroundDots,
        imageSize: imageSize,
        crossOrigin: 'anonymous',
        margin: imageMargin,
      },
      dotsOptions,
      backgroundOptions,
      cornersSquareOptions,
      cornersDotOptions,
    };

    if (logoDataUrl) {
      options.image = logoDataUrl;
    }

    if (qrCodeInstance.current) {
      qrCodeInstance.current.update(options);
    } else {
      qrCodeInstance.current = new QRCodeStyling(options);
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
        qrCodeInstance.current.append(qrContainerRef.current);
      }
    }
  }, [
    qrData, qrSize, margin, errorLevel,
    dotsColor, dotsType, dotsGradientEnabled, dotsGradientType, dotsGradientRotation, 
    dotsGradientColor1, dotsGradientColor2,
    bgColor, bgGradientEnabled, bgGradientType, bgGradientRotation, 
    bgGradientColor1, bgGradientColor2,
    cornerSquareColor, cornerSquareType, cornerSquareGradientEnabled, 
    cornerSquareGradientType, cornerSquareGradientRotation, 
    cornerSquareGradientColor1, cornerSquareGradientColor2,
    cornerDotColor, cornerDotType, cornerDotGradientEnabled, 
    cornerDotGradientType, cornerDotGradientRotation, 
    cornerDotGradientColor1, cornerDotGradientColor2,
    logoDataUrl, imageSize, imageMargin, hideBackgroundDots
  ]);

  const handleGenerate = () => {
    try {
      setError(null);
      const data = generateQRData(qrType, formData);
      if (!data || data.length === 0) {
        setError("Please fill in the required fields.");
        setQrData("");
        return;
      }
      const maxLength = { L: 2953, M: 2331, Q: 1663, H: 1273 };
      if (data.length > maxLength[errorLevel]) {
        setError(
          `Data is too long (${data.length} chars) for ${errorLevel} error correction. Max: ${maxLength[errorLevel]} chars.`
        );
        setQrData("");
        return;
      }
      setQrData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate QR code";
      setError(message);
      setQrData("");
    }
  };

  const handleDownloadPNG = async () => {
    if (!qrCodeInstance.current) return;
    try {
      await qrCodeInstance.current.download({
        name: `qr-code-${qrType}-${Date.now()}`,
        extension: 'png',
      });
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDownloadSVG = async () => {
    if (!qrCodeInstance.current) return;
    try {
      await qrCodeInstance.current.download({
        name: `qr-code-${qrType}-${Date.now()}`,
        extension: 'svg',
      });
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleReset = () => {
    setFormData({});
    setQrData("");
    setError(null);
  };

  if (!isMounted) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const SectionHeader = ({ title, section, icon }: { title: string; section: keyof typeof expandedSections; icon?: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-2"
    >
      <span className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </span>
      {expandedSections[section] ? <FiChevronUp /> : <FiChevronDown />}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">QR Code Settings</h2>
          
          {/* Error Display */}
          {error && (
            <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠️ Error</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* QR Type Selector */}
            <div className="space-y-2">
              <label htmlFor="qr-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                QR Code Type
              </label>
              <select
                id="qr-type"
                value={qrType}
                onChange={(e) => {
                  setQrType(e.target.value as QRDataType);
                  setFormData({});
                  setQrData("");
                  setError(null);
                }}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="text">📝 Text / Message</option>
                <option value="url">🔗 URL / Link</option>
                <option value="phone">📞 Phone Number</option>
                <option value="email">📧 Email</option>
                <option value="sms">💬 SMS</option>
                <option value="wifi">📶 Wi-Fi</option>
                <option value="vcard">👤 Contact (vCard)</option>
                <option value="event">📅 Calendar Event</option>
                <option value="location">📍 Location</option>
                <option value="upi">💳 UPI Payment</option>
                <option value="social">🌐 Social Media</option>
                <option value="appstore">📱 App Store Link</option>
              </select>
            </div>

            {/* Dynamic Input Fields */}
            <DynamicInputFields
              qrType={qrType}
              formData={formData}
              onChange={setFormData}
            />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                Generate QR Code
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
              >
                <FiRefreshCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Styling Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-xl font-bold">Styling Options</h2>

          {/* Main Options */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <SectionHeader title="Main Options" section="main" icon="⚙️" />
            {expandedSections.main && (
              <div className="space-y-3 mt-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Size: {qrSize}px</label>
                  <input type="range" min="200" max="600" step="50" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Margin: {margin}px</label>
                  <input type="range" min="0" max="40" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Error Correction</label>
                  <select value={errorLevel} onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg">
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Dots Options */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <SectionHeader title="Dots Options" section="dots" icon="⚫" />
            {expandedSections.dots && (
              <div className="space-y-3 mt-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Dots Style</label>
                  <select value={dotsType} onChange={(e) => setDotsType(e.target.value as DotType)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg">
                    <option value="rounded">Rounded</option>
                    <option value="dots">Dots</option>
                    <option value="classy">Classy</option>
                    <option value="classy-rounded">Classy Rounded</option>
                    <option value="square">Square</option>
                    <option value="extra-rounded">Extra Rounded</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="dotsGradient" checked={dotsGradientEnabled} onChange={(e) => setDotsGradientEnabled(e.target.checked)} />
                  <label htmlFor="dotsGradient" className="text-sm font-medium">Use Gradient</label>
                </div>
                {!dotsGradientEnabled ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Dots Color</label>
                    <input type="color" value={dotsColor} onChange={(e) => setDotsColor(e.target.value)} className="w-full h-10" />
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <select value={dotsGradientType} onChange={(e) => setDotsGradientType(e.target.value as "linear" | "radial")} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg">
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                    </select>
                    {dotsGradientType === "linear" && (
                      <div className="space-y-2">
                        <label className="block text-sm">Rotation: {dotsGradientRotation}°</label>
                        <input type="range" min="0" max="360" value={dotsGradientRotation} onChange={(e) => setDotsGradientRotation(Number(e.target.value))} className="w-full" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs mb-1">Color 1</label>
                        <input type="color" value={dotsGradientColor1} onChange={(e) => setDotsGradientColor1(e.target.value)} className="w-full h-10" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Color 2</label>
                        <input type="color" value={dotsGradientColor2} onChange={(e) => setDotsGradientColor2(e.target.value)} className="w-full h-10" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Corner Square Options */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <SectionHeader title="Corner Square Options" section="cornerSquare" icon="⬜" />
            {expandedSections.cornerSquare && (
              <div className="space-y-3 mt-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Corner Square Style</label>
                  <select value={cornerSquareType} onChange={(e) => setCornerSquareType(e.target.value as CornerSquareType)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg">
                    <option value="dot">Dot</option>
                    <option value="square">Square</option>
                    <option value="extra-rounded">Extra Rounded</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="cornerSquareGradient" checked={cornerSquareGradientEnabled} onChange={(e) => setCornerSquareGradientEnabled(e.target.checked)} />
                  <label htmlFor="cornerSquareGradient" className="text-sm font-medium">Use Gradient</label>
                </div>
                {!cornerSquareGradientEnabled ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Color</label>
                    <input type="color" value={cornerSquareColor} onChange={(e) => setCornerSquareColor(e.target.value)} className="w-full h-10" />
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <select value={cornerSquareGradientType} onChange={(e) => setCornerSquareGradientType(e.target.value as "linear" | "radial")} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg">
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                    </select>
                    {cornerSquareGradientType === "linear" && (
                      <div className="space-y-2">
                        <label className="block text-sm">Rotation: {cornerSquareGradientRotation}°</label>
                        <input type="range" min="0" max="360" value={cornerSquareGradientRotation} onChange={(e) => setCornerSquareGradientRotation(Number(e.target.value))} className="w-full" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs mb-1">Color 1</label>
                        <input type="color" value={cornerSquareGradientColor1} onChange={(e) => setCornerSquareGradientColor1(e.target.value)} className="w-full h-10" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Color 2</label>
                        <input type="color" value={cornerSquareGradientColor2} onChange={(e) => setCornerSquareGradientColor2(e.target.value)} className="w-full h-10" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Corner Dot Options */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <SectionHeader title="Corner Dot Options" section="cornerDot" icon="🔴" />
            {expandedSections.cornerDot && (
              <div className="space-y-3 mt-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Corner Dot Style</label>
                  <select value={cornerDotType} onChange={(e) => setCornerDotType(e.target.value as CornerDotType)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg">
                    <option value="dot">Dot</option>
                    <option value="square">Square</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="cornerDotGradient" checked={cornerDotGradientEnabled} onChange={(e) => setCornerDotGradientEnabled(e.target.checked)} />
                  <label htmlFor="cornerDotGradient" className="text-sm font-medium">Use Gradient</label>
                </div>
                {!cornerDotGradientEnabled ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Color</label>
                    <input type="color" value={cornerDotColor} onChange={(e) => setCornerDotColor(e.target.value)} className="w-full h-10" />
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <select value={cornerDotGradientType} onChange={(e) => setCornerDotGradientType(e.target.value as "linear" | "radial")} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg">
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                    </select>
                    {cornerDotGradientType === "linear" && (
                      <div className="space-y-2">
                        <label className="block text-sm">Rotation: {cornerDotGradientRotation}°</label>
                        <input type="range" min="0" max="360" value={cornerDotGradientRotation} onChange={(e) => setCornerDotGradientRotation(Number(e.target.value))} className="w-full" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs mb-1">Color 1</label>
                        <input type="color" value={cornerDotGradientColor1} onChange={(e) => setCornerDotGradientColor1(e.target.value)} className="w-full h-10" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Color 2</label>
                        <input type="color" value={cornerDotGradientColor2} onChange={(e) => setCornerDotGradientColor2(e.target.value)} className="w-full h-10" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Background Options */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <SectionHeader title="Background Options" section="background" icon="🎨" />
            {expandedSections.background && (
              <div className="space-y-3 mt-3">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="bgGradient" checked={bgGradientEnabled} onChange={(e) => setBgGradientEnabled(e.target.checked)} />
                  <label htmlFor="bgGradient" className="text-sm font-medium">Use Gradient</label>
                </div>
                {!bgGradientEnabled ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Background Color</label>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10" />
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <select value={bgGradientType} onChange={(e) => setBgGradientType(e.target.value as "linear" | "radial")} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg">
                      <option value="linear">Linear</option>
                      <option value="radial">Radial</option>
                    </select>
                    {bgGradientType === "linear" && (
                      <div className="space-y-2">
                        <label className="block text-sm">Rotation: {bgGradientRotation}°</label>
                        <input type="range" min="0" max="360" value={bgGradientRotation} onChange={(e) => setBgGradientRotation(Number(e.target.value))} className="w-full" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs mb-1">Color 1</label>
                        <input type="color" value={bgGradientColor1} onChange={(e) => setBgGradientColor1(e.target.value)} className="w-full h-10" />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Color 2</label>
                        <input type="color" value={bgGradientColor2} onChange={(e) => setBgGradientColor2(e.target.value)} className="w-full h-10" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image Options */}
          <div className="pb-4">
            <SectionHeader title="Logo/Image Options" section="image" icon="🖼️" />
            {expandedSections.image && (
              <div className="space-y-3 mt-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Upload Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => setLogoDataUrl(String(reader.result));
                      reader.readAsDataURL(f);
                    }}
                    className="w-full text-sm"
                  />
                  {logoDataUrl && (
                    <button
                      onClick={() => setLogoDataUrl(null)}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
                {logoDataUrl && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm">Logo Size: {Math.round(imageSize * 100)}%</label>
                      <input type="range" min="0.1" max="1" step="0.05" value={imageSize} onChange={(e) => setImageSize(Number(e.target.value))} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm">Logo Margin: {imageMargin}px</label>
                      <input type="range" min="0" max="20" value={imageMargin} onChange={(e) => setImageMargin(Number(e.target.value))} className="w-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="hideBackgroundDots" checked={hideBackgroundDots} onChange={(e) => setHideBackgroundDots(e.target.checked)} />
                      <label htmlFor="hideBackgroundDots" className="text-sm font-medium">Hide dots behind logo</label>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">QR Code Preview</h2>
          {qrData ? (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className="flex justify-center p-6">
                <div ref={qrContainerRef} className="inline-block" />
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPNG}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
                >
                  <FiDownload className="w-4 h-4" />
                  Download PNG
                </button>
                <button
                  onClick={handleDownloadSVG}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
                >
                  <FiDownload className="w-4 h-4" />
                  Download SVG
                </button>
              </div>

              {/* QR Data Preview */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Generated Data:
                </p>
                <p className="text-sm font-mono break-all text-gray-800 dark:text-gray-200">
                  {qrData}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="w-32 h-32 border-4 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-6xl">📱</span>
              </div>
              <p className="text-center">
                Fill in the details and click &quot;Generate QR Code&quot; to see
                your QR code here
              </p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-bold mb-3">ℹ️ About QR Code Styling</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>Dots Style:</strong> Change the appearance of QR code dots (rounded, square, dots, etc.)
            </p>
            <p>
              <strong>Corner Squares:</strong> The three large squares in the corners help scanners detect the QR code
            </p>
            <p>
              <strong>Gradients:</strong> Add color gradients to any QR code element for a unique look
            </p>
            <p>
              <strong>Logo Integration:</strong> The library properly positions your logo and removes dots behind it for better scanning
            </p>
            <p className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              Higher error correction (Q or H) is recommended when using logos to ensure scannability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
