import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, MapPin, Mic, Camera, ShieldCheck, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui-card';

const Dashboard = () => {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Idle');
  const [riskScore, setRiskScore] = useState(0);
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get('/dashboard/status');
        if (res.data.system.audio_ready && res.data.system.vision_ready) {
          setSystemReady(true);
        }
      } catch (e) {}
    };
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  }, []);

  const triggerSOS = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Hardware access is blocked by the browser. Please use 'localhost' instead of '0.0.0.0' or use HTTPS.");
      return;
    }
    try {
      // Prompt for hardware access to ensure user is aware/asked
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => stream.getTracks().forEach(t => t.stop()))
        .catch(err => {
          console.log("Hardware access declined or not found", err);
          alert("Could not access camera/microphone. Please check permissions.");
        });

      setStatus('Triggering SOS...');
      const formData = new FormData();
      formData.append('latitude', location?.lat || 0);
      formData.append('longitude', location?.lng || 0);
      
      const response = await api.post('/emergency/sos', formData);
      setStatus('SOS Sent Successfully!');
      setRiskScore(response.data.risk_score);
    } catch (err) {
      setStatus('Failed to send SOS');
      console.error(err);
    }
  };

  const runInference = async (type) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Hardware access is blocked by the browser. Please use 'localhost' instead of '0.0.0.0' or use HTTPS.");
      return;
    }
    
    try {
      setStatus(`Capturing ${type}...`);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: type === 'audio', 
        video: type === 'vision' 
      });

      const formData = new FormData();
      formData.append('latitude', location?.lat || 0);
      formData.append('longitude', location?.lng || 0);

      if (type === 'vision') {
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg'));
        formData.append('video', blob, 'frame.jpg');
        stream.getTracks().forEach(t => t.stop());
      } else {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          formData.append('audio', blob, 'audio.webm');
          
          setStatus('Analyzing Audio...');
          const response = await api.post('/emergency/ml-inference', formData);
          setRiskScore(response.data.risk_score);
          setStatus(response.data.risk_score >= 0.7 ? 'High Risk Detected!' : 'Monitoring...');
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 3000);
        return; // Response handled in onstop
      }

      const response = await api.post('/emergency/ml-inference', formData);
      setRiskScore(response.data.risk_score);
      setStatus(response.data.risk_score >= 0.7 ? 'High Risk Detected!' : 'Monitoring...');
    } catch (err) {
      setStatus('Inference failed');
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-10">
      <div className="text-center space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Guardia India</h1>
          <p className="text-zinc-500 font-medium">National safety network and immediate emergency response unit.</p>
      </div>

      <div className="flex justify-center py-10">
        <button
          onClick={triggerSOS}
          disabled={!systemReady}
          className={`group relative ${!systemReady ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
        >
          <div className={`absolute -inset-1 bg-rose-500 rounded-full blur opacity-40 ${systemReady ? 'group-hover:opacity-100 animate-pulse' : ''} transition duration-1000 group-hover:duration-200`}></div>
          <div className="relative w-64 h-64 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-2xl transition-all transform hover:scale-105 flex flex-col items-center justify-center border-8 border-rose-900/50">
            <AlertTriangle size={80} className="mb-2" />
            <span className="text-4xl font-black tracking-tighter">{systemReady ? 'SOS' : 'LOADING'}</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
             <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">System Status</span>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${status.includes('High') ? 'text-rose-500 border-rose-500/20 bg-rose-500/10' : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'}`}>
                      {status}
                   </span>
                </div>
                
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Merged Risk</span>
                      <span className="text-white font-mono font-bold">{Math.round(riskScore * 100)}%</span>
                   </div>
                   <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${riskScore >= 0.7 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${riskScore * 100}%` }}
                      />
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
             <CardContent className="p-6 flex flex-col justify-center h-full space-y-4">
                <div className="flex items-center gap-4 text-zinc-400">
                   <div className="p-3 bg-zinc-800 rounded-xl">
                      <MapPin size={24} className="text-rose-500" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Known Location</p>
                      <p className="text-white font-mono font-bold">
                         {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'GPS OFFLINE'}
                      </p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                   <button 
                    disabled={!systemReady}
                    onClick={() => runInference('audio')} 
                    className={`flex items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-xs font-bold uppercase ${!systemReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                      <Mic size={14} /> Audio
                   </button>
                   <button 
                    disabled={!systemReady}
                    onClick={() => runInference('vision')} 
                    className={`flex items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-xs font-bold uppercase ${!systemReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                      <Camera size={14} /> Vision
                   </button>
                </div>
             </CardContent>
          </Card>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
             <ShieldCheck className="text-emerald-500 h-5 w-5" />
             <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">End-to-End Encryption Active</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-500 uppercase">Secure</span>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
