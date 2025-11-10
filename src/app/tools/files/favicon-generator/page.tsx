'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ImageIcon, Type, Eye } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

const GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Poppins', 'Inter',
  'Playfair Display', 'Merriweather', 'Ubuntu', 'Nunito', 'PT Sans', 'Lora', 'Mukta',
  'Rubik', 'Work Sans', 'Noto Sans', 'Fira Sans', 'Quicksand', 'Karla', 'Cabin',
  'Barlow', 'Crimson Text', 'Dancing Script', 'Pacifico', 'Bebas Neue', 'Anton',
  'Permanent Marker', 'Satisfy', 'Indie Flower', 'Amatic SC', 'Lobster', 'Righteous',
  'Abril Fatface', 'Courgette', 'Architects Daughter', 'Shadows Into Light', 'Caveat',
  'Kalam', 'Comfortaa', 'Fredoka', 'Audiowide', 'Orbitron', 'Russo One', 'Teko',
  'Zen Dots', 'Press Start 2P', 'VT323', 'Courier Prime'
];

const BORDER_SHAPES = [
  { name: 'None', value: 0 },
  { name: 'Small', value: 8 },
  { name: 'Medium', value: 16 },
  { name: 'Large', value: 32 },
  { name: 'XLarge', value: 48 },
  { name: 'XXLarge', value: 64 },
  { name: 'XXXLarge', value: 96 },
  { name: 'Circle', value: 256 }
];

export default function FaviconGenerator() {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('text');
  
  // Image mode settings - initialized with default values to avoid controlled/uncontrolled warnings
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [imageSize, setImageSize] = useState(100);
  const [imageShape, setImageShape] = useState(0);
  const [imageBorderColor, setImageBorderColor] = useState('#000000');
  const [imageBorderTransparent, setImageBorderTransparent] = useState(true);
  const [imageBorderThick, setImageBorderThick] = useState(0);
  
  // Text mode settings
  const [text, setText] = useState('Fav');
  const [textRotation, setTextRotation] = useState(0);
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [fontSize, setFontSize] = useState(180);
  const [fontColor, setFontColor] = useState('#ffffff');
  
  // Common settings
  const [bgColor, setBgColor] = useState('#3b82f6');
  const [bgTransparent, setBgTransparent] = useState(false);
  const [mainBorderThick, setMainBorderThick] = useState(0);
  const [mainBorderColor, setMainBorderColor] = useState('#000000');
  const [mainBorderTransparent, setMainBorderTransparent] = useState(true);
  const [mainBorderShape, setMainBorderShape] = useState(32);
  
  const isMounted = useIsMounted();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fontLoaded, setFontLoaded] = useState(true);

  // Load Google Font
  useEffect(() => {
    setFontLoaded(false);
    
    const fontName = fontFamily.replace(/ /g, '+');
    const linkId = `google-font-${fontName}`;
    
    // Remove existing font link if it exists
    const existingLink = document.getElementById(linkId);
    if (existingLink) {
      existingLink.remove();
    }
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    link.rel = 'stylesheet';
    link.id = linkId;
    
    // Add onload handler
    link.onload = () => {
      // Wait a bit for font to be fully available
      setTimeout(() => setFontLoaded(true), 200);
    };
    
    link.onerror = () => {
      // Even if loading fails, set as loaded to show fallback font
      setFontLoaded(true);
    };
    
    document.head.appendChild(link);
    
    // Fallback timeout in case onload doesn't fire
    const timeoutId = setTimeout(() => setFontLoaded(true), 1000);
    
    return () => {
      clearTimeout(timeoutId);
      const linkToRemove = document.getElementById(linkId);
      if (linkToRemove && document.head.contains(linkToRemove)) {
        document.head.removeChild(linkToRemove);
      }
    };
  }, [fontFamily]);

  const drawCanvas = useCallback((size: number, canvas?: HTMLCanvasElement) => {
    const ctx = (canvas || canvasRef.current)?.getContext('2d');
    if (!ctx || !canvas && !canvasRef.current) return null;
    
    const targetCanvas = canvas || canvasRef.current!;
    targetCanvas.width = size;
    targetCanvas.height = size;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Save context for clipping
    ctx.save();

    // Apply main border shape clipping
    if (mainBorderShape > 0) {
      ctx.beginPath();
      if (mainBorderShape === 256) {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else {
        const radius = Math.min(mainBorderShape * (size / 512), size / 2);
        ctx.moveTo(radius, 0);
        ctx.arcTo(size, 0, size, size, radius);
        ctx.arcTo(size, size, 0, size, radius);
        ctx.arcTo(0, size, 0, 0, radius);
        ctx.arcTo(0, 0, size, 0, radius);
      }
      ctx.closePath();
      ctx.clip();
    }

    // Background
    if (!bgTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
    }

    if (activeTab === 'image' && uploadedImage) {
      const img = new Image();
      img.src = uploadedImage;
      img.onload = () => {
        const scaledSize = (imageSize / 100) * size;
        const offset = (size - scaledSize) / 2;
        
        ctx.save();
        
        // Apply image shape clipping
        if (imageShape > 0) {
          ctx.beginPath();
          if (imageShape === 256) {
            ctx.arc(size / 2, size / 2, scaledSize / 2, 0, Math.PI * 2);
          } else {
            const radius = Math.min(imageShape * (scaledSize / 512), scaledSize / 2);
            ctx.moveTo(offset + radius, offset);
            ctx.arcTo(offset + scaledSize, offset, offset + scaledSize, offset + scaledSize, radius);
            ctx.arcTo(offset + scaledSize, offset + scaledSize, offset, offset + scaledSize, radius);
            ctx.arcTo(offset, offset + scaledSize, offset, offset, radius);
            ctx.arcTo(offset, offset, offset + scaledSize, offset, radius);
          }
          ctx.closePath();
          ctx.clip();
        }
        
        ctx.drawImage(img, offset, offset, scaledSize, scaledSize);
        ctx.restore();
        
        // Image border
        if (imageBorderThick > 0 && !imageBorderTransparent) {
          const borderWidth = (imageBorderThick * size) / 512;
          ctx.strokeStyle = imageBorderColor;
          ctx.lineWidth = borderWidth;
          
          ctx.beginPath();
          if (imageShape === 256) {
            ctx.arc(size / 2, size / 2, (scaledSize / 2) - (borderWidth / 2), 0, Math.PI * 2);
          } else if (imageShape > 0) {
            const radius = Math.min(imageShape * (scaledSize / 512), scaledSize / 2);
            ctx.moveTo(offset + radius, offset + borderWidth / 2);
            ctx.arcTo(offset + scaledSize - borderWidth / 2, offset + borderWidth / 2, offset + scaledSize - borderWidth / 2, offset + scaledSize - borderWidth / 2, radius);
            ctx.arcTo(offset + scaledSize - borderWidth / 2, offset + scaledSize - borderWidth / 2, offset + borderWidth / 2, offset + scaledSize - borderWidth / 2, radius);
            ctx.arcTo(offset + borderWidth / 2, offset + scaledSize - borderWidth / 2, offset + borderWidth / 2, offset + borderWidth / 2, radius);
            ctx.arcTo(offset + borderWidth / 2, offset + borderWidth / 2, offset + scaledSize - borderWidth / 2, offset + borderWidth / 2, radius);
          } else {
            ctx.rect(offset + borderWidth / 2, offset + borderWidth / 2, scaledSize - borderWidth, scaledSize - borderWidth);
          }
          ctx.stroke();
        }
      };
      // Trigger onload if image is already loaded
      if (img.complete) {
        const event = new Event('load');
        img.dispatchEvent(event);
      }
    } else {
      // Text rendering
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((textRotation * Math.PI) / 180);
      
      const scaledFontSize = (fontSize * size) / 512;
      let fontStyle = '';
      if (textItalic) fontStyle += 'italic ';
      if (textBold) fontStyle += 'bold ';
      
      // Wrap font family in quotes to handle multi-word font names
      const fontFamilyName = fontFamily.includes(' ') ? `"${fontFamily}"` : fontFamily;
      ctx.font = `${fontStyle}${scaledFontSize}px ${fontFamilyName}, sans-serif`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (textUnderline) {
        const metrics = ctx.measureText(text);
        const underlineY = scaledFontSize * 0.3;
        ctx.beginPath();
        ctx.moveTo(-metrics.width / 2, underlineY);
        ctx.lineTo(metrics.width / 2, underlineY);
        ctx.strokeStyle = fontColor;
        ctx.lineWidth = scaledFontSize * 0.05;
        ctx.stroke();
      }
      
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    ctx.restore();

    // Main border
    if (mainBorderThick > 0 && !mainBorderTransparent) {
      const borderWidth = (mainBorderThick * size) / 512;
      ctx.strokeStyle = mainBorderColor;
      ctx.lineWidth = borderWidth;
      
      ctx.beginPath();
      if (mainBorderShape === 256) {
        ctx.arc(size / 2, size / 2, (size / 2) - (borderWidth / 2), 0, Math.PI * 2);
      } else if (mainBorderShape > 0) {
        const radius = Math.min(mainBorderShape * (size / 512), size / 2);
        const inset = borderWidth / 2;
        ctx.moveTo(radius, inset);
        ctx.arcTo(size - inset, inset, size - inset, size - inset, radius);
        ctx.arcTo(size - inset, size - inset, inset, size - inset, radius);
        ctx.arcTo(inset, size - inset, inset, inset, radius);
        ctx.arcTo(inset, inset, size - inset, inset, radius);
      } else {
        ctx.rect(borderWidth / 2, borderWidth / 2, size - borderWidth, size - borderWidth);
      }
      ctx.stroke();
    }

    return targetCanvas;
  }, [
    text, textRotation, textBold, textItalic, textUnderline, fontFamily, fontSize, fontColor,
    uploadedImage, imageSize, imageShape, imageBorderColor, imageBorderTransparent, imageBorderThick,
    bgColor, bgTransparent, mainBorderThick, mainBorderColor, mainBorderTransparent, mainBorderShape,
    activeTab
  ]);

  useEffect(() => {
    if (fontLoaded) {
      drawCanvas(512);
    }
  }, [drawCanvas, fontLoaded]);

  // Store original favicon on mount and restore on unmount
  useEffect(() => {
    // Save the original favicon links
    const originalFavicons = Array.from(document.querySelectorAll("link[rel*='icon']")).map(link => ({
      rel: link.getAttribute('rel'),
      type: link.getAttribute('type'),
      href: link.getAttribute('href'),
      sizes: link.getAttribute('sizes')
    }));

    // Cleanup function runs when component unmounts
    return () => {
      try {
        // Remove only our preview favicon links (marked with data-favicon-preview)
        const previewLinks = document.querySelectorAll("link[data-favicon-preview='true']");
        previewLinks.forEach(link => {
          try {
            const href = link.getAttribute('href');
            if (href?.startsWith('blob:')) {
              URL.revokeObjectURL(href);
            }
            // Check if still in DOM before removing
            if (link.parentNode && document.head.contains(link)) {
              document.head.removeChild(link);
            }
          } catch {
            // Silently ignore if already removed
          }
        });

        // Restore original favicons only if none exist
        const currentFavicons = document.querySelectorAll("link[rel*='icon']");
        if (currentFavicons.length === 0) {
          originalFavicons.forEach(favicon => {
            if (favicon.href) {
              const link = document.createElement('link');
              if (favicon.rel) link.rel = favicon.rel;
              if (favicon.type) link.type = favicon.type;
              if (favicon.href) link.href = favicon.href;
              if (favicon.sizes) link.sizes = favicon.sizes;
              document.head.appendChild(link);
            }
          });
        }
      } catch (error) {
        console.error('Failed to restore original favicon:', error);
      }
    };
  }, []); // Only run on mount/unmount

  // Auto-apply favicon preview on every change
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // For text mode, wait for font to load
    if (activeTab === 'text' && !fontLoaded) return;

    // Small delay to ensure canvas is fully rendered
    const timer = setTimeout(() => {
      try {
        // Generate 32x32 favicon for browser tab
        const faviconCanvas = document.createElement('canvas');
        drawCanvas(32, faviconCanvas);
        
        // Convert to blob for better browser support
        faviconCanvas.toBlob((blob) => {
          if (!blob) return;
          
          const faviconUrl = URL.createObjectURL(blob);
          
          // Remove only our preview favicon links (not original site favicons)
          const previewLinks = document.querySelectorAll("link[data-favicon-preview='true']");
          previewLinks.forEach(link => {
            try {
              const href = link.getAttribute('href');
              if (href?.startsWith('blob:')) {
                URL.revokeObjectURL(href);
              }
              if (link.parentNode && document.head.contains(link)) {
                document.head.removeChild(link);
              }
            } catch {
              // Silently ignore if already removed
            }
          });
          
          // Add new favicon link with preview marker
          const link = document.createElement('link');
          link.type = 'image/png';
          link.rel = 'icon';
          link.sizes = '32x32';
          link.href = faviconUrl;
          link.setAttribute('data-favicon-preview', 'true');
          document.head.appendChild(link);
          
          // Also add as shortcut icon for older browsers
          const link2 = document.createElement('link');
          link2.type = 'image/png';
          link2.rel = 'shortcut icon';
          link2.href = faviconUrl;
          link2.setAttribute('data-favicon-preview', 'true');
          document.head.appendChild(link2);
          
          // Force favicon update by touching the title
          const originalTitle = document.title;
          document.title = originalTitle + ' ';
          setTimeout(() => {
            document.title = originalTitle;
          }, 10);
        }, 'image/png');
      } catch (error) {
        console.error('Failed to update favicon preview:', error);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [
    text, textRotation, textBold, textItalic, textUnderline, fontFamily, fontSize, fontColor,
    uploadedImage, imageSize, imageShape, imageBorderColor, imageBorderTransparent, imageBorderThick,
    bgColor, bgTransparent, mainBorderThick, mainBorderColor, mainBorderTransparent, mainBorderShape,
    activeTab, drawCanvas, fontLoaded
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const generateICO = async (size: number): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    drawCanvas(size, canvas);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  };

  const downloadFavicons = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'favicon-64x64.png', size: 64 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 }
    ];

    for (const { name, size } of sizes) {
      const blob = await generateICO(size);
      zip.file(name, blob);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favicons.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 flex gap-4 justify-center items-center">
          <div className="flex items-center">
            <svg className="size-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl text-gray-200 font-bold">
            Favicon Generator
          </h1>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-4 md:p-8">
          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 ${
                activeTab === 'text'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Type size={20} />
              Text to ICO
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 ${
                activeTab === 'image'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <ImageIcon size={20} />
              Image to ICO
            </button>
          </div>
          {isMounted && (      
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'image' ? (
                <React.Fragment key="image-tab">
                  <div className="bg-slate-700/30 p-6 rounded-2xl border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                      <h3 className="text-xl font-bold text-white">Image Settings</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Upload Image</label>
                        <input
                          key={activeTab} 
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Image Size: <span className="text-blue-400">{imageSize}%</span>
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="100"
                          value={imageSize}
                          onChange={(e) => setImageSize(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Image Shape: <span className="text-blue-400">{BORDER_SHAPES.find(s => s.value === imageShape)?.name}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="256"
                          step="8"
                          value={imageShape}
                          onChange={(e) => setImageShape(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Image Border Thickness: <span className="text-blue-400">{imageBorderThick}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={imageBorderThick}
                          onChange={(e) => setImageBorderThick(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      {imageBorderThick > 0 && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-3">Image Border Color</label>
                          <div className="flex items-center gap-4 mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={imageBorderTransparent}
                                onChange={(e) => setImageBorderTransparent(e.target.checked)}
                                className="rounded accent-blue-500"
                              />
                              <span className="text-sm text-gray-300">Transparent</span>
                            </label>
                          </div>
                          {!imageBorderTransparent && (
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={imageBorderColor}
                                onChange={(e) => setImageBorderColor(e.target.value)}
                                className="h-10 w-20 rounded cursor-pointer bg-slate-600 border border-slate-500"
                              />
                              <input
                                type="text"
                                value={imageBorderColor}
                                onChange={(e) => setImageBorderColor(e.target.value)}
                                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ) : (
                <React.Fragment key="text-tab">
                  <div className="bg-slate-700/30 p-6 rounded-2xl border border-slate-600/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                      <h3 className="text-xl font-bold text-white">Text Settings</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Text</label>
                        <input
                          type="text"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter text or emoji"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Text Rotation: <span className="text-blue-400">{textRotation}°</span>
                        </label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={textRotation}
                          onChange={(e) => setTextRotation(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Text Styles</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={textBold}
                              onChange={(e) => setTextBold(e.target.checked)}
                              className="rounded accent-blue-500"
                            />
                            <span className="text-sm font-bold text-gray-300">Bold</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={textItalic}
                              onChange={(e) => setTextItalic(e.target.checked)}
                              className="rounded accent-blue-500"
                            />
                            <span className="text-sm italic text-gray-300">Italic</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={textUnderline}
                              onChange={(e) => setTextUnderline(e.target.checked)}
                              className="rounded accent-blue-500"
                            />
                            <span className="text-sm underline text-gray-300">Underline</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Font Family</label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500"
                        >
                          {GOOGLE_FONTS.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">
                          Font Size: <span className="text-blue-400">{fontSize}px</span>
                        </label>
                        <input
                          type="range"
                          min="30"
                          max="400"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-3">Font Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={fontColor}
                            onChange={(e) => setFontColor(e.target.value)}
                            className="h-10 w-20 rounded cursor-pointer bg-slate-600 border border-slate-500"
                          />
                          <input
                            type="text"
                            value={fontColor}
                            onChange={(e) => setFontColor(e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )}

              {/* Common Settings */}
              <div className="bg-slate-700/30 p-6 rounded-2xl border border-slate-600/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white">Background & Main Border</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">Background Color</label>
                    <div className="flex items-center gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bgTransparent}
                          onChange={(e) => setBgTransparent(e.target.checked)}
                          className="rounded accent-blue-500"
                        />
                        <span className="text-sm text-gray-300">Transparent</span>
                      </label>
                    </div>
                    {!bgTransparent && (
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-10 w-20 rounded cursor-pointer bg-slate-600 border border-slate-500"
                        />
                        <input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Main Border Shape: <span className="text-blue-400">{BORDER_SHAPES.find(s => s.value === mainBorderShape)?.name}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="256"
                      step="8"
                      value={mainBorderShape}
                      onChange={(e) => setMainBorderShape(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      Main Border Thickness: <span className="text-blue-400">{mainBorderThick}px</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={mainBorderThick}
                      onChange={(e) => setMainBorderThick(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  {mainBorderThick > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-3">Main Border Color</label>
                      <div className="flex items-center gap-4 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mainBorderTransparent}
                            onChange={(e) => setMainBorderTransparent(e.target.checked)}
                            className="rounded accent-blue-500"
                          />
                          <span className="text-sm text-gray-300">Transparent</span>
                        </label>
                      </div>
                      {!mainBorderTransparent && (
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={mainBorderColor}
                            onChange={(e) => setMainBorderColor(e.target.value)}
                            className="h-10 w-20 rounded cursor-pointer bg-slate-600 border border-slate-500"
                          />
                          <input
                            type="text"
                            value={mainBorderColor}
                            onChange={(e) => setMainBorderColor(e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="flex flex-col items-center justify-start">
              <div className="sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white">Preview</h3>
                </div>
                <div className="bg-slate-700/50 rounded-2xl p-8 mb-6 border border-slate-600/50">
                  <canvas
                    ref={canvasRef}
                    className="shadow-2xl rounded-lg"
                    style={{
                      width: '256px',
                      height: '256px',
                      imageRendering: 'auto'
                    }}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <Eye size={16} />
                      <span className="font-semibold">Live Preview Active</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Check your browser tab icon - it updates as you edit!
                    </p>
                  </div>
                  
                  <button
                    onClick={downloadFavicons}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg transform hover:scale-102"
                  >
                    <Download size={20} />
                    Download Favicons
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Includes: 16×16, 32×32, 64×64,<br/>
                  192×192, 512×512, 180×180 (Apple)
                </p>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}