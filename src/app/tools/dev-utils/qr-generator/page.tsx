import QRGeneratorTool from "@/components/tools/qr-generator/QRGeneratorTool";

export const metadata = {
  title: "QR Code Generator | Toolbox",
  description: "Generate QR codes for text, URLs, WiFi, emails, contacts, locations, and more",
};

export default function QRGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          QR Code Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Generate QR codes for various purposes - URLs, WiFi, contacts, payments, and more
        </p>
      </div>
      <QRGeneratorTool />
    </div>
  );
}
