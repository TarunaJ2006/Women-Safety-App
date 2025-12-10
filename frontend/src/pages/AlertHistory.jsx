import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, ShieldAlert, Calendar, MapPin, Activity } from 'lucide-react';

const AlertHistory = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/emergency/history');
        setEvents(res.data);
      } catch (e) {
        console.error("Failed to fetch history", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'triggered') return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (status === 'resolved') return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <History className="text-rose-500" size={32} />
          Incident History
        </h1>
        <p className="text-zinc-400 mt-1">Review all past emergency triggers and monitoring logs.</p>
      </header>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Activity className="animate-spin text-rose-500 h-10 w-10" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-zinc-900/50 p-16 rounded-3xl border border-zinc-800 text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Incidents Reported</h3>
          <p className="text-zinc-500 font-medium">Your safety records are currently clear.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-xl border ${getStatusColor(event.status)}`}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-black text-lg">SOS Event #{event.id}</span>
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Risk Score</p>
                    <p className={`text-2xl font-black ${event.risk_score >= 0.7 ? 'text-rose-500' : 'text-amber-500'}`}>
                       {Math.round(event.risk_score * 100)}%
                    </p>
                 </div>
              </div>

              {/* ACTION LOGS SUB-SECTION */}
              {event.action_logs && event.action_logs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800 w-full">
                  <p className="text-[10px] font-black uppercase text-zinc-600 mb-2">Responder Intervention Log</p>
                  <div className="space-y-2">
                    {event.action_logs.map(log => (
                      <div key={log.id} className="text-[11px] flex justify-between bg-zinc-950/50 p-2 rounded">
                        <span className="text-zinc-400">
                          <strong className="text-rose-500 uppercase">{log.action.replace(/_/g, ' ')}</strong>: {log.note}
                        </span>
                        <span className="text-zinc-600 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertHistory;