import React, { useEffect, useState, useCallback } from 'react';
import { contactApi } from '../services/serenityService';
import { useAuth } from '../context/AuthContext';
import type { ContactEnquiry } from '../types';

const ContactPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Website Enquiry');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Inquiries / replies history state
  const [myInquiries, setMyInquiries] = useState<ContactEnquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [searchEmail, setSearchEmail] = useState(user?.email || '');

  useEffect(() => {
    const header = document.querySelector('header') as HTMLElement | null;
    const handleScroll = () => {
      if (!header) return;
      if (window.scrollY > 50) {
        header.style.padding = '10px 0';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      } else {
        header.style.padding = '20px 0';
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      }
    };
    window.addEventListener('scroll', handleScroll);

    const style = document.createElement('style');
    style.id = 'contact-page-styles';
    style.textContent = `
      .contact-form input:focus, .contact-form textarea:focus {
        outline: none; border-color: #9b8578; box-shadow: 0 0 5px rgba(155,133,120,0.3);
      }
      .contact-form button { transition: all 0.3s ease; }
      .contact-form button:hover { background-color: #8a7467; }
    `;
    if (!document.getElementById('contact-page-styles')) document.head.appendChild(style);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.getElementById('contact-page-styles')?.remove();
    };
  }, []);

  const loadInquiries = useCallback(async (targetEmail?: string) => {
    const emailToQuery = targetEmail || (isAuthenticated ? user?.email : searchEmail);
    if (!emailToQuery) return;
    setLoadingInquiries(true);
    try {
      const res = await contactApi.getByEmail(emailToQuery);
      setMyInquiries(res.data);
    } catch {
      // silent
    } finally {
      setLoadingInquiries(false);
    }
  }, [isAuthenticated, user?.email, searchEmail]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setSearchEmail(user.email);
      setName(user.fullName);
      loadInquiries(user.email);
    }
  }, [user, loadInquiries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatusMsg({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      await contactApi.submit({
        name,
        email,
        phone,
        subject: subject || 'General Enquiry',
        message,
      });

      setStatusMsg({ text: 'Thank you! Your message has been sent successfully. Any reply from our team will appear below.', type: 'success' });
      setMessage('');
      loadInquiries(email);
    } catch (err: any) {
      const errorDetail = err.response?.data?.message || 'Failed to submit enquiry. Please try again.';
      setStatusMsg({ text: errorDetail, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h1 className="section-title">Contact Serenity Spa</h1>
        <p className="section-subtitle">We're here to help you find your perfect wellness experience</p>

        <div className="contact-form">
          {statusMsg && (
            <div
              style={{
                padding: '15px',
                marginBottom: '20px',
                borderRadius: '4px',
                textAlign: 'center',
                backgroundColor: statusMsg.type === 'success' ? '#d4edda' : '#f8d7da',
                color: statusMsg.type === 'success' ? '#155724' : '#721c24',
                border: `1px solid ${statusMsg.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              }}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject (e.g. Appointment Inquiry)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              name="message"
              rows={5}
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
            <button
              type="submit"
              disabled={loading}
              className="btn"
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* ── Your Messages & Replies ── */}
        <div style={{ maxWidth: '750px', margin: '40px auto 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: '#9b8578', fontSize: '1.8rem', margin: 0 }}>
              Your Messages & Replies
            </h2>
            <button
              type="button"
              onClick={() => loadInquiries()}
              style={{
                background: 'none',
                border: '1px solid #9b8578',
                color: '#9b8578',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="email"
                placeholder="Enter your email to check for replies"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
              <button
                type="button"
                onClick={() => loadInquiries(searchEmail)}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#9b8578',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                Check Replies
              </button>
            </div>
          )}

          {loadingInquiries ? (
            <p style={{ textAlign: 'center', color: '#888' }}>Checking for messages…</p>
          ) : myInquiries.length === 0 ? (
            <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center', color: '#999', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {email ? 'No messages sent from this email yet.' : 'Enter your email above to check for admin replies.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myInquiries.map((inq) => (
                <div
                  key={inq.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    borderLeft: inq.reply ? '4px solid #48bb78' : '4px solid #f6ad55',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ color: '#9b8578', fontSize: '1.1rem' }}>{inq.subject}</strong>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: inq.reply ? '#48bb78' : '#f6ad55',
                        color: 'white',
                      }}
                    >
                      {inq.reply ? '✓ REPLIED BY ADMIN' : 'AWAITING REPLY'}
                    </span>
                  </div>

                  <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.5, margin: '6px 0 10px' }}>
                    <strong>Your Message:</strong> {inq.message}
                  </p>

                  <small style={{ color: '#aaa', display: 'block', marginBottom: inq.reply ? '12px' : '0' }}>
                    Sent on: {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : ''}
                  </small>

                  {/* Admin Reply */}
                  {inq.reply && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '14px',
                        backgroundColor: '#f0fff4',
                        borderLeft: '4px solid #38a169',
                        borderRadius: '4px',
                      }}
                    >
                      <strong style={{ color: '#22543d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💬</span> Response from Serenity Spa:
                      </strong>
                      <p style={{ margin: '6px 0 4px', color: '#276749', lineHeight: 1.6, fontSize: '14px' }}>
                        {inq.reply}
                      </p>
                      {inq.repliedAt && (
                        <small style={{ color: '#38a169', display: 'block' }}>
                          Replied on: {new Date(inq.repliedAt).toLocaleString()}
                        </small>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section" style={{ textAlign: 'center', marginTop: '20px' }}>
          <h2 className="section-title">Contact Information</h2>
          <p>Phone: (555) 123-4567</p>
          <p>Email: info@serenityspa.com</p>
          <p>Address: 123 Tranquility Lane, Wellness Heights, CA 90210</p>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
