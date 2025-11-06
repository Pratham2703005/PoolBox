"use client";
import React, { useState, useRef } from 'react';
import { Download, Upload, Activity, AlertCircle, RefreshCw, Zap, Pause } from 'lucide-react';
import RadialGauge from '@/components/tools/speedtest/RadialGauge';

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
  const controllerRef = useRef<AbortController | null>(null);

  // Helper to check if error is an AbortError
  const isAbortError = (err: unknown): boolean => {
    return err instanceof Error && err.name === 'AbortError';
  };

  const measurePing = async (): Promise<number> => {
    const pings: number[] = [];
    const endpoint = 'https://cloudflare.com/cdn-cgi/trace';
    
    const signal = controllerRef.current?.signal;
    await fetch(endpoint, { cache: 'no-store', signal }).catch(() => {});

    for (let i = 0; i < 8; i++) {
      const start = performance.now();
      try {
        await fetch(endpoint, {
          method: 'HEAD',
          cache: 'no-store',
          signal,
        });
        const end = performance.now();
        pings.push(end - start);

        if (pings.length > 2) {
          const recent = pings.slice(-4);
          const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
          setCurrentPing(avg.toFixed(1));
        }
      } catch (err) {
        if (isAbortError(err)) throw err;
        console.warn('Ping error:', err);
      }
      if (signal?.aborted) break;
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
    
  const signal = controllerRef.current?.signal;
  for (const size of sizes) {
      if (Date.now() - testStartTime > TEST_DURATION) {
        break;
      }
      
      const speeds: number[] = [];
      
      try {
        const downloadPromises = Array(PARALLEL_CONNECTIONS).fill(0).map(async (_, connIndex) => {
          let bytesReceived = 0;
          
          try {
            const url = `https://speed.cloudflare.com/__down?bytes=${size}`;
            
            const response = await fetch(url, {
              method: 'GET',
              cache: 'no-store',
              headers: {
                'Accept': '*/*',
              },
              signal
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
              if (signal?.aborted) { reader.cancel(); break; }

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
            if (isAbortError(err)) return 0;
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
  if (signal?.aborted) break;
        
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
    const signal = controllerRef.current?.signal;
    const hasOwnAPI = await fetch('/api/speedtest', { method: 'HEAD', signal })
      .then(res => res.ok)
      .catch((e) => {
        if (isAbortError(e)) throw e;
        return false;
      });
    
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
    const signal = controllerRef.current?.signal;
    
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
            const response = await fetch('/api/speedtest', {
              method: 'POST',
              body: data,
              cache: 'no-store',
              headers: {
                'Content-Type': 'application/octet-stream'
              },
              signal
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
            if (isAbortError(err)) return 0;
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
        if (signal?.aborted) break;
      } catch (err) {
        if (isAbortError(err)) throw err;
        console.error('Upload test error:', err);
      }
    }
    
    if (allSpeeds.length === 0) {
      return 0;
    }
    
    return Math.max(...allSpeeds);
  };

const runSpeedTest = async () => {
  controllerRef.current?.abort();
  controllerRef.current = new AbortController();

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
    } catch {
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
  } catch (err) {
    if (isAbortError(err)) {
      console.log('Speed test aborted by user.');
      setTestPhase('Stopped');
    } else {
      console.error('Speed test error:', err);
      setError('Test stopped or unstable connection. Please retry.');
      setTestPhase('Error');
    }
  } finally {
    // Small delay to prevent flicker before UI reset
    await new Promise((r) => setTimeout(r, 200));
    setLoading(false);
  }
};

const stopTest = () => {
  controllerRef.current?.abort();
  setTestPhase('Stopping...');
  // don’t reset immediately → let finally block handle it
};


  return (
     
        <div className="min-h-screen overflow-hidden bg-gray-900 max-w-7xl w-full mx-auto flex flex-col">
          <div className="px-20 py-8 text-white flex justify-between">
            <div className="flex items-center gap-4">
              {/* <div className="flex items-center justify-center"> */}
                <Zap className="w-8 h-8" />
              {/* </div> */}
              <h1 className="text-3xl font-bold text-center">Internet Speed Test</h1>
            </div>
          

              {speedData && !loading ? (
                <div className="text-center">
                 <button
  onClick={runSpeedTest}
  className="text-zinc-100 hover:text-white px-8 py-3 rounded-full font-semibold 
             transition-all inline-flex items-center gap-2 
             focus:outline-none focus:ring-0 focus:border-none 
             ring-1 ring-gray-950 hover:bg-[rgba(3,7,18,0.5)] active:ring-0"
>

                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                </div>
              ) : (
                loading && (
                <div className="text-center">
                  <button
                    onClick={stopTest}
                    className="text-zinc-100 hover:text-white px-8 py-3 rounded-full font-semibold 
             transition-all inline-flex items-center gap-2 
             focus:outline-none focus:ring-0 focus:border-none 
             ring-1 ring-gray-950 hover:bg-[rgba(3,7,18,0.5)] active:ring-0"
                  >
                    <Pause className="w-4 h-4" />
                    Stop
                  </button>
                </div>))}
            
          </div>


      

          <div className="h-full flex items-center justify-center flex-1">
            {!loading && !speedData && (
              
                <div className='text-center'>
                  <button
                    onClick={runSpeedTest}
                    className="text-zinc-100 hover:text-white px-8 py-3 rounded-full font-semibold 
              transition-all inline-flex items-center gap-2 
              focus:outline-none focus:ring-0 focus:border-none 
              ring-1 ring-gray-950 hover:bg-[rgba(3,7,18,0.5)] active:ring-0 shadow-lg"
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
                

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <RadialGauge
                    value={parseFloat(currentDownload)}
                    maxValue={100}
                    label="Download"
                    unit="Mbps"
                    color="green"
                    icon={<Download className="size-4" />}
                  />
                  <RadialGauge
                    value={parseFloat(currentUpload)}
                    maxValue={100}
                    label="Upload"
                    unit="Mbps"
                    color="blue"
                    icon={<Upload className="size-4" />}
                  />
                  <RadialGauge
                    value={parseFloat(currentPing)}
                    maxValue={100}
                    label="Ping"
                    unit="ms"
                    color="purple"
                    icon={<Activity className="size-4" />}
                  />
                </div>
              </div>
            )}

            {speedData && !loading && (
              <div className="space-y-6">
                {/* Radial Gauge Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <RadialGauge
                    value={parseFloat(speedData.downloadSpeed)}
                    maxValue={100}
                    label="Download Speed"
                    unit="Mbps"
                    color="green"
                    icon={<Download className="size-4" />}
                  />
                  <RadialGauge
                    value={parseFloat(speedData.uploadSpeed.split(' ')[0])}
                    maxValue={100}
                    label="Upload Speed"
                    unit="Mbps"
                    color="blue"
                    icon={<Upload className="size-4" />}
                  />
                  <RadialGauge
                    value={parseFloat(speedData.ping)}
                    maxValue={100}
                    label="Latency"
                    unit="ms"
                    color="purple"
                    icon={<Activity className="size-4" />}
                  />
                </div>

                <div className="bg-zinc-900 p-4 rounded-xl outline-1 outline-white">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">Server:</span> {speedData.server}
                  </p>
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">Method:</span> {speedData.method}
                  </p>
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

  );
};

export default SpeedTestApp;
