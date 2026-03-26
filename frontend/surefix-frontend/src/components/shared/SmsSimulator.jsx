import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';
import { MessageSquare, Smartphone, X, Check, RefreshCw, Trash2, ChevronLeft } from 'lucide-react';

const S = `
  @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Text:wght@400;500;600;700&display=swap');

  /* Floating Trigger */
  .sms-trigger {
    position: fixed; bottom: 24px; right: 24px; z-index: 5000;
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    color: white; border: none; cursor: pointer;
    box-shadow: 0 10px 25px rgba(37,99,235,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  .sms-trigger:hover { transform: scale(1.05) translateY(-2px); box-shadow: 0 14px 30px rgba(37,99,235,0.5); }
  .sms-trigger:active { transform: scale(0.95); }
  
  .sms-badge {
    position: absolute; top: -4px; right: -4px;
    background: #ef4444; color: white; font-size: 11px; font-weight: 800;
    padding: 2px 6px; border-radius: 12px; border: 2px solid #0f172a;
    animation: sms-pop 0.4s cubic-bezier(0.16,1,0.3,1);
  }

  /* Phone Mockup */
  .sms-mockup {
    position: fixed; bottom: 90px; right: 24px; z-index: 5000;
    width: 320px; height: 580px; max-height: calc(100vh - 120px);
    background: #fff; border-radius: 40px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 6px #1e293b, 0 0 0 7px rgba(255,255,255,0.1);
    display: flex; flex-direction: column; overflow: hidden;
    transform-origin: bottom right;
    animation: sms-slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  @keyframes sms-slide-up {
    from { opacity: 0; transform: scale(0.9) translateY(40px); pointer-events: none; }
    to { opacity: 1; transform: scale(1) translateY(0); pointer-events: all; }
  }

  /* Dynamic Island / Notch area */
  .sms-notch {
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 100px; height: 26px; background: #1e293b;
    border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;
    z-index: 10; display: flex; align-items: center; justify-content: center;
  }
  .sms-camera {
    width: 10px; height: 10px; border-radius: 50%; background: #0f172a;
    border: 1px solid rgba(255,255,255,0.05); margin-right: 20px;
  }
  
  /* Status Bar */
  .sms-status-bar {
    height: 44px; padding: 12px 16px 0; display: flex; justify-content: space-between;
    align-items: center; font-size: 13px; font-weight: 600; color: #000;
    background: #f1f5f9; z-index: 5;
  }

  /* iMessage Header */
  .sms-header {
    background: rgba(241, 245, 249, 0.9); backdrop-filter: blur(10px);
    padding: 10px 16px 14px; display: flex; flex-direction: column; align-items: center;
    border-bottom: 1px solid rgba(0,0,0,0.05); z-index: 5; position: relative;
  }
  .sms-contact-icon {
    width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #f97316, #ea580c);
    color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 6px;
  }
  .sms-contact-name { font-size: 11px; color: #64748b; margin-top: 2px; }

  /* Controls */
  .sms-controls {
    position: absolute; top: 12px; right: 16px;
    background: none; border: none; color: #0ea5e9; cursor: pointer; padding: 4px; border-radius: 50%;
  }

  /* Messages Area */
  .sms-body {
    flex: 1; overflow-y: auto; padding: 16px; background: #fff;
    display: flex; flex-direction: column; gap: 14px;
    scrollbar-width: none;
  }
  .sms-body::-webkit-scrollbar { display: none; }

  /* iMessage Bubble */
  .sms-bubble {
    max-width: 80%; padding: 10px 14px; font-size: 15px; line-height: 1.35;
    position: relative; animation: sms-bubble-in 0.3s cubic-bezier(0.16,1,0.3,1);
    word-wrap: break-word; white-space: pre-wrap;
  }
  @keyframes sms-bubble-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  
  .sms-rx {
    align-self: flex-start; background: #e2e8f0; color: #0f172a; border-radius: 20px 20px 20px 4px;
  }
  .sms-tx {
    align-self: flex-end; background: #0ea5e9; color: #fff; border-radius: 20px 20px 4px 20px;
  }

  .sms-timestamp {
    font-size: 10px; color: #94a3b8; text-align: center; margin: 8px 0 2px; font-weight: 500;
  }

  /* Empty State */
  .sms-empty {
    margin: auto; display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: #94a3b8; text-align: center; gap: 12px; padding: 20px;
  }
`;

const SmsSimulator = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);
    const endRef = useRef(null);
    const [unread, setUnread] = useState(0);
    const prevCount = useRef(0);

    const fetchMessages = useCallback(async (isPoll = false) => {
        if (!user) return;
        if (!isPoll) setLoading(true);
        try {
            const res = await api.get('/sms/simulator');
            if (res.data.success) {
                // messages come back newest first. reverse for chronological chat view
                const sorted = res.data.messages.reverse();
                setMessages(sorted);
                
                if (sorted.length > prevCount.current && prevCount.current !== 0) {
                    if (!open) { setUnread(u => u + (sorted.length - prevCount.current)); }
                }
                prevCount.current = sorted.length;
            }
        } catch (e) {
            console.error('Failed to fetch mock SMS', e);
        } finally {
            if (!isPoll) setLoading(false);
        }
    }, [user, open]);

    useEffect(() => {
        if (user) fetchMessages();
    }, [user, fetchMessages]);

    // Poll every 5s while widget exists
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            fetchMessages(true);
        }, 5000);
        return () => clearInterval(interval);
    }, [user, fetchMessages]);

    useEffect(() => {
        if (open) {
            setUnread(0);
            setTimeout(() => {
                endRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [open, messages]);

    if (!user) return null;

    return (
        <>
            <style>{S}</style>
            
            {/* Trigger Button */}
            <button className="sms-trigger" onClick={() => setOpen(!open)} aria-label="SMS Simulator">
                {open ? <X size={24} /> : <Smartphone size={24} />}
                {unread > 0 && !open && <span className="sms-badge">{unread}</span>}
            </button>

            {/* Phone Mockup Window */}
            {open && (
                <div className="sms-mockup">
                    <div className="sms-notch"><div className="sms-camera" /></div>
                    
                    <div className="sms-status-bar">
                        <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <div style={{display:'flex', gap:4, alignItems:'center'}}>
                            <div style={{width: 16, height: 10, border: '1px solid black', borderRadius: 2, padding: 1, position:'relative'}}>
                                <div style={{width: '70%', height: '100%', background: 'black', borderRadius: 1}}/>
                            </div>
                        </div>
                    </div>

                    <div className="sms-header">
                        <button className="sms-controls" style={{left: 16, right: 'auto', color: '#0ea5e9', display:'flex', alignItems:'center', gap:2}} onClick={() => setOpen(false)}>
                            <ChevronLeft size={20} /> <span style={{fontSize:16}}>Back</span>
                        </button>
                        
                        <div className="sms-contact-icon">S</div>
                        <h4 style={{margin:0, fontSize:15, color:'#0f172a'}}>SureFix Alerts</h4>
                        <div className="sms-contact-name">Automated SMS</div>
                        
                        <button className="sms-controls" onClick={() => fetchMessages()} disabled={loading}>
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="sms-body">
                        {messages.length === 0 ? (
                            <div className="sms-empty">
                                <MessageSquare size={36} opacity={0.3} />
                                <div>
                                    <p style={{margin:'0 0 6px', fontWeight:600, color:'#64748b'}}>No messages yet</p>
                                    <p style={{margin:0, fontSize:12}}>Book a repair or trigger a status update to see your SMS simulator work exactly like a real phone.</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((sms, i) => {
                                const isNewDay = i === 0 || new Date(messages[i-1].created_at).toDateString() !== new Date(sms.created_at).toDateString();
                                const timeStr = new Date(sms.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                const dateStr = new Date(sms.created_at).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'});
                                
                                return (
                                    <React.Fragment key={sms.id || i}>
                                        {isNewDay && <div className="sms-timestamp">{dateStr} {timeStr}</div>}
                                        {!isNewDay && <div className="sms-timestamp" style={{opacity:0.6, fontSize:9, margin:'-6px 0 -2px'}}>{timeStr}</div>}
                                        <div className="sms-bubble sms-rx">
                                            {sms.message}
                                        </div>
                                    </React.Fragment>
                                );
                            })
                        )}
                        <div ref={endRef} />
                    </div>
                </div>
            )}
        </>
    );
};

export default SmsSimulator;
