import React, { useState, useEffect } from 'react';
import { responderApi } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { Shield, AlertCircle, Activity, Clock, LogOut, Map, User, Phone, CheckCircle, Navigation } from 'lucide-react';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [logs, setLogs] = useState([]);
  const { user, logout } = useAuth();

  const fetchData = async () => {
    try {
      const [eventsRes, logsRes] = await Promise.all([
        responderApi.getEvents(),
        responderApi.getLogs()
      ]);
      setEvents(eventsRes.data);
      setLogs(logsRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    if (action === 'ack') await responderApi.acknowledgeEvent(id);
    else await responderApi.resolveEvent(id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* COMMAND TOP BAR */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-2 rounded-lg"><Shield className="text-white" size={24} /></div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Guardia HQ</h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Network Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator</p>
            <p className="text-sm font-bold text-white">{user?.full_name}</p>
          </div>
          <button onClick={logout} className="p-2 hover:bg-red-600/10 rounded-lg text-slate-500 hover:text-red-500 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-0">
        {/* ACTIVE ALERTS LIST */}
        <section className="col-span-12 lg:col-span-8 p-8 border-r border-slate-800 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-3">
              <AlertCircle className="text-red-600" />
              Active Deployments
            </h3>
            <span className="bg-slate-900 border border-slate-800 px-4 py-1 rounded-full text-[10px] font-black uppercase text-slate-400">
              {events.length} ACTIVE INCIDENTS
            </span>
          </div>

          <div className="space-y-6">
            {events.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-900 rounded-3xl">
                <Shield className="text-slate-900 mb-4" size={64} />
                <p className="text-slate-700 font-black uppercase tracking-widest">No Priority Alerts</p>
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all group">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <User size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-white uppercase italic">{event.user_name}</h4>
                            <p className="text-sm font-mono text-slate-500">{event.user_phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-500 uppercase">Threat Level</p>
                           <p className="text-2xl font-black text-red-500 italic tracking-tighter">{(event.risk_score * 100).toFixed(0)}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                               <Navigation size={12} />
                               <span className="text-[10px] font-black uppercase tracking-widest">Coordinates</span>
                            </div>
                            <p className="text-xs font-mono text-slate-300">{event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}</p>
                         </div>
                         <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                            <div className="flex items-center gap-2 text-slate-600 mb-2">
                               <Clock size={12} />
                               <span className="text-[10px] font-black uppercase tracking-widest">Time Elapsed</span>
                            </div>
                            <p className="text-xs font-mono text-slate-300 italic">{new Date(event.timestamp).toLocaleTimeString()}</p>
                         </div>
                      </div>

                      <div className="flex gap-4">
                        <a 
                          href={`https://maps.google.com?q=${event.latitude},${event.longitude}`}
                          target="_blank" rel="noreferrer"
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-xs py-3 rounded-xl text-center transition-all"
                        >
                          View Satellite
                        </a>
                        {event.status === 'triggered' && (
                          <button onClick={() => handleAction(event.id, 'ack')} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs py-3 rounded-xl transition-all">
                            Acknowledge
                          </button>
                        )}
                        {event.status !== 'resolved' && (
                          <button onClick={() => handleAction(event.id, 'res')} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs py-3 rounded-xl transition-all">
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-64 space-y-3">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Contact Alerts</p>
                        <div className="space-y-2">
                           {event.alerts.map(a => (
                             <div key={a.id} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/30 flex justify-between items-center">
                                <div className="flex flex-col">
                                   <span className="text-[11px] font-bold text-slate-300">{a.contact_name}</span>
                                   <span className="text-[9px] font-mono text-slate-600">{a.contact_phone}</span>
                                </div>
                                <div className={`h-2 w-2 rounded-full ${a.status === 'sent' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-emerald-500'}`} />
                             </div>
                           ))}
                        </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* OPERATION LOGS */}
        <aside className="col-span-12 lg:col-span-4 bg-slate-900/20 p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
           <div className="flex items-center gap-3 mb-8">
              <Activity className="text-slate-600" />
              <h3 className="text-lg font-black uppercase text-slate-400 tracking-wider italic">Comm Logs</h3>
           </div>

           <div className="space-y-6 relative border-l border-slate-800 ml-2 pl-6">
              {logs.map(log => (
                <div key={log.id} className="relative">
                  <div className="absolute -left-[31px] top-1 h-2 w-2 rounded-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)]" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 italic">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-[9px] font-mono text-slate-600 italic">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-300 leading-tight mb-1">{log.note}</p>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Operator: {log.responder_name}</p>
                </div>
              ))}
           </div>
        </aside>
      </main>
    </div>
  );
}
