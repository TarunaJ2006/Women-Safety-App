import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-card';
import { Camera, Mic, Activity, ShieldCheck, AlertTriangle, Brain, Eye, Mic2, Loader2 } from 'lucide-react';
import api from '@/services/api';

export default function Monitor() {
  const [status, setStatus] = useState(null);
  const [systemReady, setSystemReady] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCanvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  // 1. Hardware Initialization
  const startMonitoring = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Hardware access is blocked by the browser. Please use 'localhost' instead of '0.0.0.0' or use HTTPS for security.");
      return;
    }
    setIsInitializing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      setStreaming(true);
      initAudioVisualizer(stream);
      startIngestionLoops(stream);
    } catch (err) {
      console.error("Hardware Access Denied:", err);
      alert("Please allow Camera and Microphone access.");
    } finally {
      setIsInitializing(false);
    }
  };

  const stopMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    cancelAnimationFrame(animationFrameRef.current);
    setStreaming(false);
    setStatus(null);
  };

  // 2. Local Audio Visualizer
  const initAudioVisualizer = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 64;
    audioContextRef.current = audioContext;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const canvas = audioCanvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      if (!canvas) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / dataArray.length) * 2;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(168, 85, 247)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };
    draw();
  };

  // 3. Backend Ingestion Loops
  const startIngestionLoops = (stream) => {
    const visionInterval = setInterval(async () => {
      if (!stream.active) return clearInterval(visionInterval);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        try { 
          await api.post('/dashboard/ingest/vision', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }); 
        } catch(e) {}
      }, 'image/jpeg', 0.6);
    }, 2000);

    const audioTrack = stream.getAudioTracks()[0];
    const mediaRecorder = new MediaRecorder(new MediaStream([audioTrack]), { mimeType: 'audio/webm' });
    mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size > 1000) {
        const formData = new FormData();
        formData.append('file', e.data, 'audio.webm');
        try { 
          await api.post('/dashboard/ingest/audio', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }); 
        } catch(e) {}
      }
    };
    mediaRecorder.start();
    const audioInterval = setInterval(() => {
      if (!stream.active) return clearInterval(audioInterval);
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.start();
      }
    }, 5000);
  };

  // 4. Polling for AI Status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/dashboard/status');
        setStatus(res.data);
        if (res.data.system.audio_ready && res.data.system.vision_ready) {
          setSystemReady(true);
        }
      } catch (e) {}
    }, 1500);
    return () => clearInterval(interval);
  }, [streaming]);

  const getThreatColor = (level) => {
    if (level === 'HIGH') return 'text-rose-500';
    if (level === 'MEDIUM') return 'text-amber-500';
    return 'text-emerald-500';
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Live Monitor</h1>
          <p className="text-zinc-400 mt-1">Real-time hardware streams with cross-modal AI processing.</p>
        </div>
        <button
          onClick={streaming ? stopMonitoring : startMonitoring}
          disabled={isInitializing || (!streaming && !systemReady)}
          className={`px-8 py-3 rounded-xl font-black transition-all flex items-center gap-3 shadow-2xl ${
            streaming 
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
              : isInitializing || !systemReady
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
          }`}
        >
          {isInitializing ? (
            <><Loader2 className="animate-spin h-5 w-5" /> INITIALIZING...</>
          ) : !systemReady && !streaming ? (
            <><Loader2 className="animate-spin h-5 w-5" /> SYSTEM CALIBRATING...</>
          ) : streaming ? (
            <><Activity className="animate-pulse h-5 w-5" /> STOP SENSORS</>
          ) : (
            <><ShieldCheck className="h-5 w-5" /> START MONITORING</>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* VIDEO FEED */}
         <Card className="overflow-hidden bg-black border-zinc-800 aspect-video relative group ring-1 ring-white/5">
            {isInitializing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 text-rose-500 animate-spin mb-4" />
                <p className="text-zinc-400 font-black text-xs uppercase tracking-widest">Accessing Camera...</p>
              </div>
            )}
            <video ref={videoRef} autoPlay muted className={`w-full h-full object-cover transition-opacity duration-700 ${streaming ? 'opacity-80' : 'opacity-10'}`} />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute top-4 left-4 flex gap-2">
               <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${streaming ? 'bg-rose-500 animate-pulse' : 'bg-zinc-600'}`} />
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">Live Feed</span>
               </div>
               {status?.vision?.active && (
                 <div className="bg-blue-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-tighter">
                    Vision AI Active
                 </div>
               )}
            </div>

            {status?.vision?.active && (
                <div className="absolute bottom-4 left-4 p-4 bg-zinc-900/90 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl space-y-1">
                   <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3 text-blue-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">{status.vision.people_count} People Detected</span>
                   </div>
                   <p className={`text-[10px] font-bold ${status.vision.pose_risk ? 'text-rose-500' : 'text-zinc-500'}`}>
                      POSE STATUS: {status.vision.pose_risk ? '⚠️ RISKY BEHAVIOR' : 'NORMAL'}
                   </p>
                </div>
            )}
         </Card>

         {/* AUDIO FEED */}
         <Card className="overflow-hidden bg-black border-zinc-800 aspect-video relative ring-1 ring-white/5">
            {isInitializing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
                <p className="text-zinc-400 font-black text-xs uppercase tracking-widest">Activating Microphone...</p>
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
               <canvas ref={audioCanvasRef} className="w-full h-24 mb-8" width={400} height={100} />
               {!streaming && <p className="text-zinc-700 font-black uppercase tracking-[0.3em] text-xs">Microphone Offline</p>}
            </div>

            <div className="absolute top-4 left-4 flex gap-2">
               <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${streaming ? 'bg-purple-500 animate-pulse' : 'bg-zinc-600'}`} />
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter">Audio Ingest</span>
               </div>
               {status?.audio?.active && (
                 <div className="bg-purple-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-tighter">
                    Acoustic AI Active
                 </div>
               )}
            </div>
            
            {status?.audio?.active && (
                <div className="absolute bottom-4 left-4 p-4 bg-zinc-900/90 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl space-y-1">
                   <div className="flex items-center gap-2">
                      <Mic2 className="h-3 w-3 text-purple-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Emotion: {status.audio.emotion.toUpperCase()}</span>
                   </div>
                   <div className="w-32 bg-zinc-800 h-1 rounded-full overflow-hidden mt-2">
                      <div className="bg-purple-500 h-full" style={{ width: `${status.audio.confidence * 100}%` }} />
                   </div>
                </div>
            )}
         </Card>
      </div>

      {/* INTELLIGENCE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
             <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Vision Logic</p>
                      <p className="text-2xl font-black text-white mt-1">{(status?.risk?.vision_risk * 100).toFixed(0)}%</p>
                   </div>
                   <div className="p-2 bg-blue-500/10 rounded-lg"><Eye className="h-5 w-5 text-blue-500" /></div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${status?.risk?.vision_risk * 100}%` }} />
                </div>
             </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
             <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Audio Logic</p>
                      <p className="text-2xl font-black text-white mt-1">{(status?.risk?.audio_risk * 100).toFixed(0)}%</p>
                   </div>
                   <div className="p-2 bg-purple-500/10 rounded-lg"><Mic2 className="h-5 w-5 text-purple-500" /></div>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${status?.risk?.audio_risk * 100}%` }} />
                </div>
             </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-700 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Brain className="h-20 w-20 text-amber-500" /></div>
             <CardContent className="pt-6">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Merged Threat Score</p>
                <p className={`text-4xl font-black mt-1 ${getThreatColor(status?.risk?.threat_level)}`}>
                   {status?.risk?.threat_score ? (status.risk.threat_score * 100).toFixed(0) : '00'}
                </p>
                <p className="text-[10px] text-zinc-500 mt-2 font-mono italic">FUSION ALGORITHM V2.1 ACTIVE</p>
             </CardContent>
          </Card>
      </div>
    </div>
  );
}
