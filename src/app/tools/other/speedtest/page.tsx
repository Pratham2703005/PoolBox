"use client";
import React, { useState } from 'react';
import { Wifi, Download, Upload, Activity, AlertCircle, RefreshCw, Info, Zap } from 'lucide-react';

interface SpeedData {
  downloadSpeed: string;
  uploadSpeed: string;
  ping: string;
  server: string;
  method: string;
}

const SpeedTestApp = () => {
  const [speedData, setSpeedData] = useState<SpeedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testPhase, setTestPhase] = useState('');
  const [progress, setProgress] = useState(0);
  
  const [currentDownload, setCurrentDownload] = useState<string>('0');
  const [currentUpload, setCurrentUpload] = useState<string>('0');
  const [currentPing, setCurrentPing] = useState<string>('0');

  const PARALLEL_CONNECTIONS = 6;
  const TEST_DURATION = 10000;

  const measurePing = async (): Promise<number> => {
    const pings: number[] = [];
    const endpoint = 'https://cloudflare.com/cdn-cgi/trace';
    
    await fetch(endpoint, { cache: 'no-store' }).catch(() => {});
    
    for (let i = 0; i < 8; i++) {
      const start = performance.now();
      try {
        await fetch(endpoint, { 
          method: 'HEAD',
          cache: 'no-store'
        });
        const end = performance.now();
        pings.push(end - start);
        
        if (pings.length > 2) {
          const recent = pings.slice(-4);
          const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
          setCurrentPing(avg.toFixed(1));
        }
      } catch (err) {
        console.warn('Ping error:', err);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (pings.length > 2) {
      pings.sort((a, b) => a - b);
      const trimmed = pings.slice(1, -1);
      return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    }
    
    return pings.length > 0 ? pings.reduce((a, b) => a + b, 0) / pings.length : 0;
  };

  const measureDownloadSpeed = async (): Promise<number> => {
    const sizes = [
      1000000,
      5000000,
      10000000,
      25000000,
    ];
    
    const allSpeeds: number[] = [];
    const testStartTime = Date.now();
    
    for (const size of sizes) {
      if (Date.now() - testStartTime > TEST_DURATION) {
        break;
      }
      
      const speeds: number[] = [];
      
      try {
        const downloadPromises = Array(PARALLEL_CONNECTIONS).fill(0).map(async (_, connIndex) => {
          const start = performance.now();
          let bytesReceived = 0;
          
          try {
            const url = `https://speed.cloudflare.com/__down?bytes=${size}`;
            
            const response = await fetch(url, {
              method: 'GET',
              cache: 'no-store',
              headers: {
                'Accept': '*/*',
              }
            });
            
            if (!response.ok) {
              console.warn(`Connection ${connIndex} failed:`, response.status);
              return 0;
            }
            
            const reader = response.body?.getReader();
            if (!reader) return 0;
            
            const connectionStart = performance.now();
            let lastUpdateTime = connectionStart;
            
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) break;
              
              bytesReceived += value.length;
              
              const now = performance.now();
              if (now - lastUpdateTime > 100) {
                const elapsed = (now - connectionStart) / 1000;
                if (elapsed > 0.1) {
                  const currentSpeed = (bytesReceived * 8) / elapsed / 1000000;
                  speeds.push(currentSpeed);
                  
                  if (speeds.length > 0) {
                    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
                    const scaledSpeed = avgSpeed * PARALLEL_CONNECTIONS;
                    setCurrentDownload(scaledSpeed.toFixed(2));
                  }
                }
                lastUpdateTime = now;
              }
              
              if (Date.now() - testStartTime > TEST_DURATION) {
                reader.cancel();
                break;
              }
            }
            
            return bytesReceived;
          } catch (err) {
            console.warn(`Connection ${connIndex} error:`, err);
            return 0;
          }
        });
        
        const results = await Promise.all(downloadPromises);
        const totalBytes = results.reduce((a, b) => a + b, 0);
        
        if (totalBytes > 0 && speeds.length > 0) {
          const recentSpeeds = speeds.slice(-10);
          recentSpeeds.sort((a, b) => a - b);
          const median = recentSpeeds[Math.floor(recentSpeeds.length / 2)];
          const scaledSpeed = median * PARALLEL_CONNECTIONS;
          allSpeeds.push(scaledSpeed);
          
          console.log(`Download test ${size / 1000000}MB: ${scaledSpeed.toFixed(2)} Mbps`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (err) {
        console.error('Download test error:', err);
      }
    }
    
    if (allSpeeds.length === 0) {
      throw new Error('Download test failed. Please check your internet connection.');
    }
    
    return Math.max(...allSpeeds);
  };

  const measureUploadSpeed = async (): Promise<number> => {
    // Check if we have our own API endpoint
    const hasOwnAPI = await fetch('/api/speedtest/upload', { method: 'HEAD' })
      .then(res => res.ok)
      .catch(() => false);
    
    if (hasOwnAPI) {
      // Use our own API if available
      return await measureUploadWithOwnAPI();
    } else {
      // Fallback to estimation if no API
      console.warn('Upload API not available, estimating based on typical ratios');
      return 0;
    }
  };

  const measureUploadWithOwnAPI = async (): Promise<number> => {
    const sizes = [
      250000,
      500000,
      1000000,
      2000000,
    ];
    
    const allSpeeds: number[] = [];
    
    for (const size of sizes) {
      try {
        const speeds: number[] = [];
        
        const uploadPromises = Array(Math.min(PARALLEL_CONNECTIONS, 4)).fill(0).map(async (_, connIndex) => {
          try {
            const data = new Uint8Array(size);
            const chunkSize = 65536;
            for (let i = 0; i < size; i += chunkSize) {
              const chunk = data.subarray(i, Math.min(i + chunkSize, size));
              crypto.getRandomValues(chunk);
            }
            
            const start = performance.now();
            
            // Use our own API endpoint
            const response = await fetch('/api/speedtest/upload', {
              method: 'POST',
              body: data,
              cache: 'no-store',
              headers: {
                'Content-Type': 'application/octet-stream'
              }
            });
            
            if (!response.ok) {
              console.warn(`Upload connection ${connIndex} failed:`, response.status);
              return 0;
            }
            
            await response.text();
            const end = performance.now();
            
            const duration = (end - start) / 1000;
            const mbps = (size * 8) / duration / 1000000;
            speeds.push(mbps);
            
            if (speeds.length > 0) {
              const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
              const scaledSpeed = avgSpeed * Math.min(PARALLEL_CONNECTIONS, 4);
              setCurrentUpload(scaledSpeed.toFixed(2));
            }
            
            return size;
          } catch (err) {
            console.warn(`Upload connection ${connIndex} error:`, err);
            return 0;
          }
        });
        
        const results = await Promise.all(uploadPromises);
        const successCount = results.filter(r => r > 0).length;
        
        if (successCount > 0 && speeds.length > 0) {
          const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
          const scaledSpeed = avgSpeed * successCount;
          allSpeeds.push(scaledSpeed);
          
          console.log(`Upload test ${size / 1000000}MB: ${scaledSpeed.toFixed(2)} Mbps`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error('Upload test error:', err);
      }
    }
    
    if (allSpeeds.length === 0) {
      return 0;
    }
    
    return Math.max(...allSpeeds);
  };

  const runSpeedTest = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setSpeedData(null);
    setCurrentDownload('0');
    setCurrentUpload('0');
    setCurrentPing('0');

    try {
      setTestPhase('Measuring latency...');
      setProgress(10);
      const ping = await measurePing();
      setCurrentPing(ping.toFixed(1));
      setProgress(20);

      setTestPhase('Testing download speed (6 parallel connections)...');
      setProgress(25);
      const downloadSpeed = await measureDownloadSpeed();
      setProgress(70);

      setTestPhase('Testing upload speed...');
      setProgress(75);
      let uploadSpeed = 0;
      let uploadStatus = '';
      
      try {
        uploadSpeed = await measureUploadSpeed();
        if (uploadSpeed === 0) {
          uploadSpeed = downloadSpeed / 10;
          uploadStatus = ' (estimated)';
        }
      } catch (err) {
        console.warn('Upload test failed, using estimation');
        uploadSpeed = downloadSpeed / 10;
        uploadStatus = ' (estimated)';
      }
      setProgress(95);

      setTestPhase('Complete!');
      setProgress(100);

      setSpeedData({
        downloadSpeed: downloadSpeed.toFixed(2),
        uploadSpeed: uploadSpeed > 0 ? uploadSpeed.toFixed(2) + uploadStatus : 'N/A',
        ping: ping.toFixed(1),
        server: 'Cloudflare CDN',
        method: 'Multi-connection CDN test'
      });

      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Speed test failed. Please try again.';
      setError(message);
      console.error('Speed test error:', err);
      setLoading(false);
      setTestPhase('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-center">Speed Test</h1>
            <p className="text-center text-purple-100 mt-2">Fast.com-style Multi-Connection Testing</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800">How This Works</p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>✓ Uses Cloudflare CDN for accurate download testing</li>
                  <li>✓ 6 parallel connections for bandwidth saturation</li>
                  <li>✓ Progressive file sizes with TCP warm-up</li>
                  <li>⚠ Upload requires backend API for accurate results</li>
                  <li className="text-amber-700 font-semibold">💡 Create /api/speedtest/upload endpoint for accurate upload testing</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!loading && !speedData && (
              <div className="text-center">
                <button
                  onClick={runSpeedTest}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-12 py-4 rounded-full text-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  Start Test
                </button>
                <p className="text-gray-500 text-sm mt-4">
                  Testing with Cloudflare&apos;s global CDN
                </p>
              </div>
            )}

            {loading && (
              <div className="space-y-6 py-8">
                <div className="text-center">
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle
                        cx="96" cy="96" r="88" stroke="#8b5cf6" strokeWidth="12" fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-purple-600 mx-auto mb-2 animate-pulse" />
                        <p className="text-3xl font-bold text-gray-700">{progress}%</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">{testPhase}</p>
                  <p className="text-gray-400 text-sm">Please wait...</p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                  <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">Download</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{currentDownload}</p>
                    <p className="text-xs text-green-700">Mbps</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-700">Upload</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{currentUpload}</p>
                    <p className="text-xs text-blue-700">Mbps</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700">Ping</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{currentPing}</p>
                    <p className="text-xs text-purple-700">ms</p>
                  </div>
                </div>
              </div>
            )}

            {speedData && !loading && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <p className="text-5xl font-bold text-gray-900 mb-2">
                    {speedData.downloadSpeed}
                    <span className="text-3xl text-gray-600 ml-2">Mbps</span>
                  </p>
                  <p className="text-gray-500">Your internet speed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-green-700 font-semibold">Download</span>
                      <Download className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-4xl font-bold text-green-900">{speedData.downloadSpeed}</p>
                    <p className="text-green-700 mt-1">Mbps</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-blue-700 font-semibold">Upload</span>
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-4xl font-bold text-blue-900">{speedData.uploadSpeed}</p>
                    <p className="text-blue-700 mt-1">Mbps</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-purple-700 font-semibold block mb-2">Latency</span>
                      <p className="text-3xl font-bold text-purple-900">
                        {speedData.ping} <span className="text-xl">ms</span>
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Server:</span> {speedData.server}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Method:</span> {speedData.method}
                  </p>
                </div>

                <div className="text-center pt-4">
                  <button
                    onClick={runSpeedTest}
                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Test Again
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-800 font-semibold mb-2">Test Failed</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={runSpeedTest}
                  className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-white text-sm opacity-80">
          <p>Speed test powered by Cloudflare CDN</p>
          <p className="mt-1">Uses multiple connections like Fast.com</p>
        </div>
      </div>
    </div>
  );
};

export default SpeedTestApp;