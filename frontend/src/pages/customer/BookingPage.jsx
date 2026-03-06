import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { centreAPI, deviceAPI, appointmentAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { format, addDays, startOfTomorrow } from 'date-fns';

const STEPS = ['Select Service', 'Choose Device', 'Pick Date & Time', 'Confirm'];

const formatTime = (t) => {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr > 12 ? hr - 12 : hr === 0 ? 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};


export default function BookingPage() {
  const { centreId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [centre, setCentre] = useState(null);
  const [services, setServices] = useState([]);
  const [devices, setDevices] = useState([]);
  const [availability, setAvailability] = useState([]);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Min date = tomorrow
  const minDate = format(startOfTomorrow(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  useEffect(() => {
    Promise.all([centreAPI.getById(centreId), deviceAPI.getAll()])
      .then(([cRes, dRes]) => {
        setCentre(cRes.data.centre);
        setServices(cRes.data.services);
        setDevices(dRes.data.devices);
      })
      .catch(() => { toast.error('Failed to load booking data.'); navigate(-1); })
      .finally(() => setLoading(false));
  }, [centreId, navigate]);

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setLoadingSlots(true);
    try {
      const res = await centreAPI.getAvailability(centreId, date);
      setAvailability(res.data.available_slots);
    } catch {
      toast.error('Could not load availability.');
      setAvailability([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDevice || !selectedDate || !selectedTime) {
      toast.error('Please complete all steps.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await appointmentAPI.create({
        centre_id: parseInt(centreId),
        service_id: selectedService.service_id,
        device_id: selectedDevice.device_id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        notes,
      });
      toast.success('Appointment booked! Check your email for confirmation.');
      navigate('/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;

  const canProceed = [
    !!selectedService,
    !!selectedDevice,
    !!(selectedDate && selectedTime),
    true,
  ][step];

  return (
    <div className="page">
      <div className="container page-inner" style={{ maxWidth: 760 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>â† Back</button>

        <h2 style={{ color: 'var(--text-primary)', marginBottom: 4 }}>Book Appointment</h2>
        <p style={{ marginBottom: 32 }}>at <strong style={{ color: 'var(--accent)' }}>{centre?.name}</strong></p>

        {/* Step indicator */}
        <div className="steps" style={{ marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
                <div className="step-dot">{i < step ? 'âœ“' : i + 1}</div>
                <span className="step-label">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="step-line" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 0: Select Service */}
        {step === 0 && (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>Choose a Service</h3>
            {services.length === 0 ? (
              <div className="empty-state"><p>No services available at this centre.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {services.map(s => (
                  <div
                    key={s.service_id}
                    className="card"
                    style={{
                      cursor: 'pointer', padding: '16px 20px',
                      borderColor: selectedService?.service_id === s.service_id ? 'var(--accent)' : undefined,
                      background: selectedService?.service_id === s.service_id ? 'rgba(233,69,96,0.05)' : undefined,
                    }}
                    onClick={() => setSelectedService(s)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{s.service_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s.device_category}</div>
                        {s.description && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.description}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          â±ï¸ ~{s.estimated_duration_minutes < 60 ? `${s.estimated_duration_minutes}min` : `${Math.round(s.estimated_duration_minutes/60)}h`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Select Device */}
        {step === 1 && (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>Select Your Device</h3>
            {devices.length === 0 ? (
              <div className="card">
                <div className="empty-state">
                  <div className="icon">ðŸ“±</div>
                  <h3>No devices registered</h3>
                  <p>You need to register a device before booking.</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}
                    onClick={() => navigate('/devices')}>Add Device</button>
                </div>
              </div>
            ) : (
              <div className="grid-2">
                {devices.map(d => (
                  <div
                    key={d.device_id}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      borderColor: selectedDevice?.device_id === d.device_id ? 'var(--accent)' : undefined,
                      background: selectedDevice?.device_id === d.device_id ? 'rgba(233,69,96,0.05)' : undefined,
                    }}
                    onClick={() => setSelectedDevice(d)}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{d.brand} {d.model}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: 8 }}>{d.device_type}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.issue_description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>Pick Date & Time</h3>
            <div className="form-group">
              <label className="form-label">Appointment Date</label>
              <input
                type="date" className="form-input" style={{ maxWidth: 280 }}
                min={minDate} max={maxDate}
                value={selectedDate}
                onChange={e => handleDateChange(e.target.value)}
              />
            </div>

            {selectedDate && (
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: 12 }}>
                  Available Time Slots
                </label>
                {loadingSlots ? (
                  <div className="page-loader"><div className="spinner" /></div>
                ) : availability.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                    No available slots for this date. Please choose another date.
                  </p>
                ) : (
                  <div className="time-slots">
                    {availability.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {formatTime(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">Additional Notes (Optional)</label>
              <textarea className="form-textarea" placeholder="Any additional details about your device or the repair..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 20 }}>Confirm Appointment</h3>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="info-row"><span className="info-label">Repair Centre</span><span className="info-value">{centre?.name}</span></div>
              <div className="info-row"><span className="info-label">Address</span><span className="info-value">{centre?.address}</span></div>
              <div className="info-row"><span className="info-label">Service</span><span className="info-value">{selectedService?.service_name}</span></div>
              <div className="info-row">
                <span className="info-label">Device</span>
                <span className="info-value">{selectedDevice?.brand} {selectedDevice?.model}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date</span>
                <span className="info-value">{selectedDate ? format(new Date(selectedDate), 'EEEE, MMMM d, yyyy') : ''}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Time</span>
                <span className="info-value">{selectedTime ? formatTime(selectedTime) : ''}</span>
              </div>
              {notes && <div className="info-row"><span className="info-label">Notes</span><span className="info-value">{notes}</span></div>}
            </div>

            <div style={{
              background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
              borderRadius: 'var(--radius-sm)', padding: 16, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              âœ… A confirmation email will be sent to your registered email address after booking.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
          <button
            className="btn btn-secondary"
            onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
          >
            {step === 0 ? 'Cancel' : 'â† Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed}>
              Continue â†’
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Booking...' : 'âœ… Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



