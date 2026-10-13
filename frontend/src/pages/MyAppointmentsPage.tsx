import React, { useEffect, useState } from 'react';
import { appointmentsApi, contactApi } from '../services/serenityService';
import type { Appointment, ContactEnquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MyAppointmentsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchAppointments = () => {
    setLoading(true);
    appointmentsApi.getMy()
      .then((res) => {
        setAppointments(res.data);
      })
      .catch((err) => {
        setActionError(err.response?.data?.message || 'Could not load your appointments.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchMessages = () => {
    setLoadingMessages(true);
    contactApi.getMy()
      .then((res) => {
        setMessages(res.data);
      })
      .catch(() => {})
      .finally(() => {
        setLoadingMessages(false);
      });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await appointmentsApi.cancel(id);
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="section" style={{ minHeight: '60vh', textAlign: 'center' }}>
        <div className="container">
          <h1 className="section-title">My Appointments</h1>
          <p className="section-subtitle">Please sign in to view your booked appointments</p>
          <div style={{ marginTop: '30px' }}>
            <Link to="/login" className="btn">Sign In</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ minHeight: '70vh' }}>
      <div className="container">
        <h1 className="section-title">My Bookings</h1>
        <p className="section-subtitle">Hello {user?.fullName}, here is your wellness itinerary</p>

        {actionError && (
          <div style={{ padding: '12px', marginBottom: '20px', backgroundColor: '#fde8e8', color: '#c53030', borderRadius: '4px', textAlign: 'center' }}>
            {actionError}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#9b8578' }}>Loading your appointments...</p>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#777' }}>You do not have any active appointments yet.</p>
            <Link to="/booking" className="btn">Book a Treatment Now</Link>
          </div>
        ) : (
          <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {appointments.map((appt) => (
              <div
                key={appt.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  padding: '25px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.06)',
                  borderLeft: `5px solid ${
                    appt.status === 'CONFIRMED' ? '#48bb78' :
                    appt.status === 'CANCELLED' ? '#e53e3e' :
                    appt.status === 'COMPLETED' ? '#4299e1' : '#ecc94b'
                  }`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px',
                }}
              >
                <div>
                  <h3 style={{ color: '#9b8578', marginBottom: '8px', fontSize: '1.4rem' }}>{appt.treatmentName}</h3>
                  <p style={{ color: '#555', margin: '3px 0' }}>
                    <strong>Date:</strong> {appt.appointmentDate} &nbsp;|&nbsp; <strong>Time:</strong> {appt.startTime}
                  </p>
                  {appt.notes && (
                    <p style={{ color: '#888', fontStyle: 'italic', margin: '5px 0' }}>Notes: {appt.notes}</p>
                  )}
                  <p style={{ margin: '5px 0' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        backgroundColor:
                          appt.status === 'CONFIRMED' ? '#e6fffa' :
                          appt.status === 'CANCELLED' ? '#fff5f5' :
                          appt.status === 'COMPLETED' ? '#ebf8ff' : '#fefcbf',
                        color:
                          appt.status === 'CONFIRMED' ? '#234e52' :
                          appt.status === 'CANCELLED' ? '#742a2a' :
                          appt.status === 'COMPLETED' ? '#2a4365' : '#744210',
                      }}
                    >
                      {appt.status}
                    </span>
                  </p>
                </div>

                <div>
                  {appt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(appt.id)}
                      style={{
                        padding: '8px 18px',
                        border: '1px solid #e53e3e',
                        backgroundColor: 'transparent',
                        color: '#e53e3e',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Customer Messages & Admin Replies Section ── */}
        <div style={{ maxWidth: '850px', margin: '50px auto 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ color: '#9b8578', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', margin: 0 }}>
                Your Inquiries & Spa Replies
              </h2>
              <p style={{ color: '#888', margin: '4px 0 0', fontSize: '14px' }}>
                Messages submitted through our contact desk and responses from the Serenity Spa team.
              </p>
            </div>
            <button
              onClick={fetchMessages}
              style={{
                padding: '6px 14px',
                border: '1px solid #9b8578',
                backgroundColor: 'transparent',
                color: '#9b8578',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {loadingMessages ? (
            <p style={{ textAlign: 'center', color: '#9b8578' }}>Loading messages…</p>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: '#888' }}>
              <p style={{ margin: '0 0 12px' }}>You have not sent any inquiries to our concierge yet.</p>
              <Link to="/contact" className="btn" style={{ fontSize: '14px', padding: '8px 18px' }}>Send an Inquiry</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    padding: '22px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    borderLeft: msg.reply ? '5px solid #48bb78' : '5px solid #ecc94b',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ color: '#9b8578', margin: 0, fontSize: '1.2rem' }}>{msg.subject}</h4>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: msg.reply ? '#e6fffa' : '#fefcbf',
                        color: msg.reply ? '#234e52' : '#744210',
                      }}
                    >
                      {msg.reply ? '✓ Replied by Concierge' : 'Pending Response'}
                    </span>
                  </div>

                  <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.5, margin: '6px 0 10px' }}>
                    <strong>Your Question:</strong> {msg.message}
                  </p>

                  <small style={{ color: '#aaa', display: 'block', marginBottom: msg.reply ? '12px' : 0 }}>
                    Sent on: {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
                  </small>

                  {/* Admin Reply */}
                  {msg.reply && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '14px',
                        backgroundColor: '#f0fff4',
                        borderLeft: '4px solid #38a169',
                        borderRadius: '4px',
                      }}
                    >
                      <strong style={{ color: '#22543d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💬</span> Response from Spa Concierge:
                      </strong>
                      <p style={{ margin: '6px 0 4px', color: '#276749', lineHeight: 1.6, fontSize: '14px' }}>
                        {msg.reply}
                      </p>
                      {msg.repliedAt && (
                        <small style={{ color: '#38a169', display: 'block' }}>
                          Replied: {new Date(msg.repliedAt).toLocaleString()}
                        </small>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyAppointmentsPage;
