import React from 'react';
import Image from 'next/image';

export default async function FaviconGeneratorDocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          ✨ Favicon Generator Documentation
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Create professional favicons from text, emojis, or images in multiple sizes
        </p>

        {/* Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The Favicon Generator tool helps you create high-quality favicons for your website quickly and easily. 
            Generate favicons from custom text, emojis, or upload your own images. Export in multiple standard sizes 
            including 16x16, 32x32, 64x64, 192x192, 512x512, and Apple Touch Icon (180x180).
          </p>

          {/* Screenshot - Main Interface */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/favicon-generator/Screenshot 2025-11-10 225915.png"
              alt="Favicon Generator Main Interface"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>✓ Create favicons from text, emojis, or images</li>
            <li>✓ 50+ Google Fonts to choose from</li>
            <li>✓ Full text customization (bold, italic, underline, rotation)</li>
            <li>✓ Custom colors for text, background, and borders</li>
            <li>✓ 8 border radius options (none to full circle)</li>
            <li>✓ Optional border with adjustable thickness</li>
            <li>✓ Live preview with real-time updates</li>
            <li>✓ Export in 6 standard sizes</li>
            <li>✓ Download individual sizes or all as ZIP</li>
            <li>✓ Support for transparent backgrounds</li>
          </ul>
        </section>

        {/* Text Mode */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Text Mode</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Basic Settings</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
            <li>• <strong>Text Content:</strong> Enter any text or emoji (e.g., &quot;A&quot;, &quot;🚀&quot;, &quot;ABC&quot;)</li>
            <li>• <strong>Font Family:</strong> Choose from 50+ Google Fonts</li>
            <li>• <strong>Font Size:</strong> Adjust from 20 to 300 pixels</li>
            <li>• <strong>Text Color:</strong> Pick any color using color picker</li>
          </ul>

          {/* Screenshot - Text Settings */}
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/favicon-generator/Screenshot 2025-11-10 230009.png"
              alt="Text Mode Settings"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Text Styling</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
            <li>• <strong>Bold:</strong> Make text bold for better visibility</li>
            <li>• <strong>Italic:</strong> Apply italic styling</li>
            <li>• <strong>Underline:</strong> Add underline to text</li>
            <li>• <strong>Rotation:</strong> Rotate text from -180° to +180°</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Background & Border</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• <strong>Background Color:</strong> Solid color or transparent</li>
            <li>• <strong>Border Radius:</strong> None, Small, Medium, Large, or Circle</li>
            <li>• <strong>Border:</strong> Optional border with custom color and thickness</li>
          </ul>
        </section>

        {/* Image Mode */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Image Mode</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Upload & Configure</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
            <li>• <strong>Upload Image:</strong> Support for PNG, JPG, JPEG, WebP, SVG</li>
            <li>• <strong>Image Size:</strong> Scale from 10% to 200%</li>
            <li>• <strong>Shape:</strong> Apply border radius to create rounded corners or circles</li>
            <li>• <strong>Background:</strong> Add custom background color behind image</li>
          </ul>

          {/* Screenshot - Image Mode */}
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/favicon-generator/Screenshot 2025-11-10 230108.png"
              alt="Image Mode Settings"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Border Options</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• <strong>Border Thickness:</strong> 0-50 pixels</li>
            <li>• <strong>Border Color:</strong> Any color or transparent</li>
            <li>• <strong>Transparent Border:</strong> Toggle for transparent borders</li>
          </ul>
        </section>

        {/* Export Options */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Export Options</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Available Sizes</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
            <li>• <strong>favicon-16x16.png</strong> - Standard browser tab icon</li>
            <li>• <strong>favicon-32x32.png</strong> - High-resolution browser tab icon</li>
            <li>• <strong>favicon-64x64.png</strong> - Extra high-resolution icon</li>
            <li>• <strong>apple-touch-icon.png</strong> - 180x180 for iOS devices</li>
            <li>• <strong>android-chrome-192x192.png</strong> - Android home screen</li>
            <li>• <strong>android-chrome-512x512.png</strong> - High-res Android icon</li>
          </ul>

          {/* Screenshot - Export Preview */}
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/favicon-generator/Screenshot 2025-11-10 233627.png"
              alt="Export Preview"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Download Options</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• <strong>Individual Download:</strong> Download any size separately</li>
            <li>• <strong>Download All:</strong> Get all sizes packaged in a ZIP file</li>
            <li>• <strong>Preview Before Download:</strong> See exactly how your favicon looks in each size</li>
          </ul>

          {/* Screenshot - Download All */}
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <Image
              src="/images/favicon-generator/Screenshot 2025-11-10 233752.png"
              alt="Download All Sizes"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Best Practices</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>• <strong>Keep it Simple:</strong> Use 1-2 characters or a simple icon for clarity</li>
            <li>• <strong>High Contrast:</strong> Ensure good contrast between text/image and background</li>
            <li>• <strong>Test Sizes:</strong> Preview all sizes before downloading</li>
            <li>• <strong>Avoid Details:</strong> Small details get lost at 16x16 size</li>
            <li>• <strong>Use Bold Fonts:</strong> Bold text is more readable at small sizes</li>
            <li>• <strong>Consider Dark Mode:</strong> Test your favicon on both light and dark backgrounds</li>
          </ul>
        </section>

        {/* How to Use Generated Favicons */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Use Generated Favicons</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">HTML Implementation</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-6">
            <pre className="text-sm overflow-x-auto">
              <code>{`<!-- Place in your HTML <head> section -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`}</code>
            </pre>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">File Placement</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Place all downloaded favicon files in your website&apos;s root directory or public folder. 
            For Next.js projects, place them in the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">public/</code> folder.
          </p>
        </section>

        {/* See Also */}
        <section className="mt-12 p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📚 Related Resources
          </h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <a href="/tools/files/favicon-generator" className="text-blue-600 dark:text-blue-400 hover:underline">
                Try the Favicon Generator Tool
              </a>
            </li>
            <li>
              <a href="/tools/conversion/image-converter" className="text-blue-600 dark:text-blue-400 hover:underline">
                Image Converter & Editor
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
