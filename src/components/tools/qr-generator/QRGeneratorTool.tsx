"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { FiDownload, FiRefreshCcw } from "react-icons/fi";
import DynamicInputFields from "./DynamicInputFields";
import { QRDataType, generateQRData } from "@/lib/qr-generator";
import { useIsMounted } from "@/hooks/useIsMounted";

export default function QRGeneratorTool() {
  const [qrType, setQrType] = useState<QRDataType>("text");
  const [qrData, setQrData] = useState("");
  const [qrSize, setQrSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [fgColor, setFgColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState(20);
  const [logoShape, setLogoShape] = useState<"circle" | "square">("circle");
  const [roundedContainer, setRoundedContainer] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useIsMounted();
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  const handleGenerate = () => {
    try {
      setError(null);
      const data = generateQRData(qrType, formData);
      if (!data || data.length === 0) {
        setError("Please fill in the required fields.");
        setQrData("");
        return;
      }
      // Check if data is too long for QR code (simple heuristic based on error level)
      const maxLength = { L: 2953, M: 2331, Q: 1663, H: 1273 };
      if (data.length > maxLength[errorLevel]) {
        setError(
          `Data is too long (${data.length} chars) for ${errorLevel} error correction. Max: ${maxLength[errorLevel]} chars. Try reducing text or increasing error correction level.`
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

  const handleDownloadPNG = () => {
    const canvas = qrContainerRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;

    // If no logo, just download the canvas as PNG
    if (!logoDataUrl) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code-${qrType}-${Date.now()}.png`;
      a.click();
      return;
    }

    // Draw the QR canvas and then draw the logo onto a temporary canvas
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    const ctx = temp.getContext("2d");
    if (!ctx) return;

    // draw existing QR canvas
    ctx.drawImage(canvas, 0, 0);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const logoSizePx = (qrSize * logoSizePercent) / 100;
      const x = (temp.width - logoSizePx) / 2;
      const y = (temp.height - logoSizePx) / 2;

      if (logoShape === "circle") {
        // draw circle clipped logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + logoSizePx / 2, y + logoSizePx / 2, logoSizePx / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, logoSizePx, logoSizePx);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y, logoSizePx, logoSizePx);
      }

      const url = temp.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code-${qrType}-${Date.now()}.png`;
      a.click();
    };
    img.src = logoDataUrl;
  };

  const handleDownloadSVG = () => {
    const svgEl = qrContainerRef.current?.querySelector("svg") as SVGSVGElement | null;
    if (!svgEl) return;

    if (!logoDataUrl) {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-code-${qrType}-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Render SVG to canvas first, then draw logo on canvas, export as SVG
    const canvas = document.createElement("canvas");
    canvas.width = qrSize;
    canvas.height = qrSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Convert SVG to image and draw on canvas
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const svgImg = new Image();
    svgImg.crossOrigin = "anonymous";
    svgImg.onload = () => {
      // Draw the QR (SVG) onto canvas
      ctx.drawImage(svgImg, 0, 0);
      URL.revokeObjectURL(url);

      // Now draw the logo
      const logoSizePx = (qrSize * logoSizePercent) / 100;
      const x = (qrSize - logoSizePx) / 2;
      const y = (qrSize - logoSizePx) / 2;

      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        if (logoShape === "circle") {
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + logoSizePx / 2, y + logoSizePx / 2, logoSizePx / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(logoImg, x, y, logoSizePx, logoSizePx);
          ctx.restore();
        } else {
          ctx.drawImage(logoImg, x, y, logoSizePx, logoSizePx);
        }

        // Export canvas as SVG (convert to PNG data URL and embed in SVG)
        const pngDataUrl = canvas.toDataURL("image/png");
        const SVG_NS = "http://www.w3.org/2000/svg";
        const svgWithLogo = document.createElementNS(SVG_NS, "svg");
        svgWithLogo.setAttribute("xmlns", SVG_NS);
        svgWithLogo.setAttribute("width", String(qrSize));
        svgWithLogo.setAttribute("height", String(qrSize));
        svgWithLogo.setAttribute("viewBox", `0 0 ${qrSize} ${qrSize}`);

        const imgElement = document.createElementNS(SVG_NS, "image");
        imgElement.setAttribute("x", "0");
        imgElement.setAttribute("y", "0");
        imgElement.setAttribute("width", String(qrSize));
        imgElement.setAttribute("height", String(qrSize));
        imgElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", pngDataUrl);

        svgWithLogo.appendChild(imgElement);

        const finalSvgData = new XMLSerializer().serializeToString(svgWithLogo);
        const finalBlob = new Blob([finalSvgData], { type: "image/svg+xml;charset=utf-8" });
        const finalUrl = URL.createObjectURL(finalBlob);
        const a = document.createElement("a");
        a.href = finalUrl;
        a.download = `qr-code-${qrType}-${Date.now()}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(finalUrl);
      };
      logoImg.src = logoDataUrl;
    };
    svgImg.src = url;
  };

  const handleReset = () => {
    setFormData({});
    setQrData("");
    setError(null);
  };

  if (!isMounted) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">QR Code Settings</h2>
          <div className="space-y-4">
            {/* Color Pickers & Logo Upload */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foreground</label>
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-full h-10 p-0 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Background</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 p-0 border rounded-md" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo (center)</label>
              <div className="flex gap-2 items-center">
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
                  className="text-sm"
                />
                {logoDataUrl && (
                  <button
                    onClick={() => setLogoDataUrl(null)}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex gap-2 items-center">
                <label className="text-sm">Logo Size: {logoSizePercent}%</label>
                <input type="range" min={5} max={35} value={logoSizePercent} onChange={(e) => setLogoSizePercent(Number(e.target.value))} />
              </div>

              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="logoShape" checked={logoShape === 'circle'} onChange={() => setLogoShape('circle')} />
                  <span className="text-sm">Circle</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="logoShape" checked={logoShape === 'square'} onChange={() => setLogoShape('square')} />
                  <span className="text-sm">Square</span>
                </label>
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={roundedContainer} onChange={(e) => setRoundedContainer(e.target.checked)} />
                <span className="text-sm">Rounded outer container</span>
              </label>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠️ Error</p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">{error}</p>
              </div>
            )}

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
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* QR Size */}
            <div className="space-y-2">
              <label htmlFor="qr-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                QR Code Size: {qrSize}px
              </label>
              <input
                id="qr-size"
                type="range"
                min="128"
                max="512"
                step="64"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>128px</span>
                <span>512px</span>
              </div>
            </div>

            {/* Error Correction Level */}
            <div className="space-y-2">
              <label htmlFor="error-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Error Correction Level
              </label>
              <select
                id="error-level"
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value as "L" | "M" | "Q" | "H")}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>

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
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4">QR Code Preview</h2>
          {qrData ? (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className={`flex justify-center p-6 bg-white ${roundedContainer ? 'rounded-lg' : ''} border-2 border-gray-200`}>
                <div ref={qrContainerRef} className="relative" style={{ width: qrSize, height: qrSize }}>
                  {/* Canvas for PNG download (hidden) */}
                  <QRCodeCanvas
                    id="qr-canvas"
                    value={qrData}
                    size={qrSize}
                    level={errorLevel}
                    includeMargin={true}
                    fgColor={fgColor}
                    bgColor={bgColor}
                    className="hidden"
                  />
                  {/* SVG for display and SVG download */}
                  <div className="relative inline-block">
                    <QRCodeSVG
                      id="qr-svg"
                      value={qrData}
                      size={qrSize}
                      level={errorLevel}
                      includeMargin={true}
                      fgColor={fgColor}
                      bgColor={bgColor}
                    />

                    {/* Logo overlay (centered) */}
                    {logoDataUrl && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: `${(qrSize * logoSizePercent) / 100}px`,
                          height: `${(qrSize * logoSizePercent) / 100}px`,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoDataUrl}
                          alt="logo"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: logoShape === 'circle' ? '50%' : '6px',
                            background: '#fff',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadPNG}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition"
                >
                  <FiDownload className="w-4 h-4" />
                  Download PNG
                </button>
                <button
                  onClick={handleDownloadSVG}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition"
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
          <h3 className="text-sm font-bold mb-3">ℹ️ About Error Correction</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              <strong>Low (L):</strong> ~7% of data can be restored
            </p>
            <p>
              <strong>Medium (M):</strong> ~15% of data can be restored
            </p>
            <p>
              <strong>Quartile (Q):</strong> ~25% of data can be restored
            </p>
            <p>
              <strong>High (H):</strong> ~30% of data can be restored
            </p>
            <p className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              Higher error correction allows the QR code to be scanned even if
              partially damaged or obscured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
