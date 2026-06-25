'use client';

import { useState } from 'react';
import styles from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

const BLOOD_TYPES  = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const DEPARTMENTS  = ['Admin','Drifters'];

const TC = `YANGON NATION — TERMS & CONDITIONS

1. HONEST DISCLOSURE
All personal information provided must be accurate and truthful.

2. COMMUNITY CONDUCT
Members must uphold the values and reputation of Yangon Nation at all times.

3. MEMBERSHIP FEES
Members agree to pay membership fees as communicated by club administration.

4. RESPECTFUL BEHAVIOUR
Treat all fellow members, guests, and the public with respect.

5. NO RECKLESS DRIVING
No reckless driving, public drifting, unauthorised burnouts, or aggressive driving under the Yangon Nation name.

6. TRAFFIC LAW COMPLIANCE
All members must fully comply with Myanmar traffic laws and national regulations.

7. PERSONAL LIABILITY
Members are personally liable for any accidents or damage at club events.

8. RESPONSIBLE USE OF CLUB IDENTITY
The Yangon Nation name and branding must not be used without authorisation.

9. CONSEQUENCES OF VIOLATIONS
Violations result in: Warning → Suspension → Expulsion, at management's discretion.

By agreeing, you confirm you have read and understood these terms.`;

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName:'', nickname:'', dob:'', email:'',
    gender:'', address:'', phone:'', nrcNumber:'',
    bloodType:'', emergencyPhone:'', whyJoin:'', department:'',
  });
  const [photo, setPhoto]             = useState(null);
  const [preview, setPreview]         = useState(null);
  const [tcOpen, setTcOpen]           = useState(false);
  const [tcAgreed, setTcAgreed]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [errors, setErrors]           = useState({});
  const [serverError, setServerError] = useState('');
  const [done, setDone]               = useState(false);

  function set(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: null }));
  }

  function onPhoto(e) {
    const f = e.target.files[0];
    if (!f) return;
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
    setErrors(err => ({ ...err, photo: null }));
  }

  function validate() {
    const e = {};
    const req = ['fullName','nickname','dob','email','gender','address','phone','nrcNumber','bloodType','emergencyPhone','whyJoin','department'];
    req.forEach(k => { if (!form[k].trim()) e[k] = 'Required'; });
    if (!photo)    e.photo = 'Photo is required';
    if (!tcAgreed) e.tc    = 'You must agree to the Terms & Conditions';
    return e;
  }

  async function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setServerError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('photo', photo);
      fd.append('tcAgreed', 'true');
      const res  = await fetch(`${API}/api/members/register`, { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) setDone(true);
      else setServerError(data.message || 'Something went wrong.');
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return (
    <main className={styles.page}>
      <div className={styles.success}>
        <div className={styles.successIcon}>✓</div>
        <h2 className={styles.successTitle}>Registration Submitted</h2>
        <p className={styles.successText}>
          Thank you for applying to Yangon Nation. Our admin team will review your
          application and reach out via email once it has been processed.
        </p>
        <p className={styles.brand}>YANGON NATION &bull; AUTOCULT &bull; 2025</p>
      </div>
    </main>
  );

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>AutoCult</p>
        <h1 className={styles.title}>YANGON <span className={styles.accent}>NATION</span></h1>
        <p className={styles.subtitle}>New Member Registration</p>
      </div>

      <form className={styles.form} onSubmit={submit} noValidate>

        <Section legend="Personal Information">
          <Row2>
            <Field label="Full Name" error={errors.fullName}>
              <input name="fullName" value={form.fullName} onChange={set} placeholder="Ko / Ma / U / Daw + Name" />
            </Field>
            <Field label="Nickname" error={errors.nickname}>
              <input name="nickname" value={form.nickname} onChange={set} />
            </Field>
          </Row2>
          <Row2>
            <Field label="Date of Birth" error={errors.dob}>
              <input type="date" name="dob" value={form.dob} onChange={set} />
            </Field>
            <Field label="Gender" error={errors.gender}>
              <select name="gender" value={form.gender} onChange={set}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Field>
          </Row2>
          <Field label="Email Address" error={errors.email}>
            <input type="email" name="email" value={form.email} onChange={set} placeholder="your@email.com" />
          </Field>
          <Field label="Home Address" error={errors.address}>
            <textarea name="address" value={form.address} onChange={set} rows={3} placeholder="Township, Yangon" />
          </Field>
          <Row2>
            <Field label="Phone Number" error={errors.phone}>
              <input type="tel" name="phone" value={form.phone} onChange={set} placeholder="09-xxx-xxx-xxx" />
            </Field>
            <Field label="Emergency Contact Phone" error={errors.emergencyPhone}>
              <input type="tel" name="emergencyPhone" value={form.emergencyPhone} onChange={set} placeholder="09-xxx-xxx-xxx" />
            </Field>
          </Row2>
          <Row2>
            <Field label="NRC Number" error={errors.nrcNumber}>
              <input name="nrcNumber" value={form.nrcNumber} onChange={set} placeholder="12/ABCDE(N)000000" />
            </Field>
            <Field label="Blood Type" error={errors.bloodType}>
              <select name="bloodType" value={form.bloodType} onChange={set}>
                <option value="">Select</option>
                {BLOOD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </Row2>
        </Section>

        <Section legend="Membership Details">
          <Field label="Preferred Department" error={errors.department}>
            <select name="department" value={form.department} onChange={set}>
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Why do you want to join Yangon Nation?" error={errors.whyJoin}>
            <textarea name="whyJoin" value={form.whyJoin} onChange={set} rows={4}
              placeholder="Tell us about yourself and your passion for car culture..." />
          </Field>
        </Section>

        <Section legend="Profile Photo">
          <Field label="Upload your photo" error={errors.photo}>
            <div className={styles.photoArea}>
              {preview && <div className={styles.photoPreview} style={{ backgroundImage: `url(${preview})` }} />}
              <label className={styles.photoBtn}>
                <input type="file" accept="image/*" onChange={onPhoto} hidden />
                {photo ? 'Change Photo' : 'Choose Photo'}
              </label>
              <p className={styles.photoHint}>JPG, PNG or WebP &bull; Max 5 MB</p>
            </div>
          </Field>
        </Section>

        <Section legend="Terms & Conditions">
          <div className={styles.tcRow}>
            <button type="button" className={styles.tcBtn} onClick={() => setTcOpen(true)}>
              Read Terms & Conditions
            </button>
            <label className={styles.tcCheck}>
              <input type="checkbox" checked={tcAgreed}
                onChange={e => { setTcAgreed(e.target.checked); setErrors(err => ({ ...err, tc: null })); }}
                style={{ width: 'auto' }} />
              I have read and agree to the Terms & Conditions
            </label>
            {errors.tc && <p className={styles.err}>{errors.tc}</p>}
          </div>
        </Section>

        {serverError && <p className={styles.serverErr}>{serverError}</p>}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>

      {tcOpen && (
        <div className={styles.overlay} onClick={() => setTcOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span>Terms & Conditions</span>
              <button onClick={() => setTcOpen(false)}>✕</button>
            </div>
            <pre className={styles.modalBody}>{TC}</pre>
            <button className={styles.modalAgree}
              onClick={() => { setTcAgreed(true); setTcOpen(false); setErrors(err => ({ ...err, tc: null })); }}>
              I Agree
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({ legend, children }) {
  return (
    <fieldset className={styles.section}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );
}
function Row2({ children }) { return <div className={styles.row2}>{children}</div>; }
function Field({ label, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <p className={styles.err}>{error}</p>}
    </div>
  );
}
