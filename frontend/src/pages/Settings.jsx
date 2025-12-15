import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-card';
import { Sliders, Save, ShieldAlert, Bell, Zap } from 'lucide-react';
import api from '@/services/api';

export default function Settings() {
  const [settings, setSettings] = useState({
    vision_threshold: 0.7,
    audio_threshold: 0.6,
    auto_sos: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/');
        const formatted = {};
        res.data.forEach(s => {
            if (s.value === 'true') formatted[s.key] = true;
            else if (s.value === 'false') formatted[s.key] = false;
            else if (!isNaN(s.value)) formatted[s.key] = parseFloat(s.value);
            else formatted[s.key] = s.value;
        });
        if (res.data.length > 0) setSettings(prev => ({ ...prev, ...formatted }));
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        api.post('/settings/', { key, value: String(value), description: `Setting for ${key}` })
      );
      await Promise.all(promises);
      alert("Settings saved successfully!");
    } catch (e) {
      console.error("Failed to save settings", e);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="text-zinc-400 mt-1">Configure threat detection sensitivity and response protocols.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Detection Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-500" />
              Inference Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-300">Vision Sensitivity</label>
                <span className="text-sm font-mono text-blue-500">{settings.vision_threshold}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={settings.vision_threshold}
                onChange={(e) => setSettings({ ...settings, vision_threshold: parseFloat(e.target.value) })}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-zinc-500">Confidence required for YOLOv8 to trigger a person/pose detection.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-300">Audio Sensitivity</label>
                <span className="text-sm font-mono text-purple-500">{settings.audio_threshold}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={settings.audio_threshold}
                onChange={(e) => setSettings({ ...settings, audio_threshold: parseFloat(e.target.value) })}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-xs text-zinc-500">Threshold for SER model to classify a "Fearful" or "Angry" emotion.</p>
            </div>
          </CardContent>
        </Card>

        {/* Response Protocol */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Automated Response
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-800">
               <div className="flex items-center gap-3">
                 <ShieldAlert className="h-5 w-5 text-rose-500" />
                 <div>
                   <p className="text-sm font-bold text-white">Auto SOS Trigger</p>
                   <p className="text-xs text-zinc-500">Notify contacts automatically on HIGH threat.</p>
                 </div>
               </div>
               <input
                 type="checkbox"
                 checked={settings.auto_sos}
                 onChange={(e) => setSettings({ ...settings, auto_sos: e.target.checked })}
                 className="h-6 w-6 rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/20"
               />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
