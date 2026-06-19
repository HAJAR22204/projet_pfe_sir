import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const user = await login({ email, password });

    // Redirection selon le rôle
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }

  } catch (err) {
    setError(err.response?.data?.message || 'Erreur de connexion');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={S.container}>

      <style>{`
        @keyframes fadeInPhoto {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 0.8; }
        }
        @keyframes logoSlideIn {
          0%   { opacity: 0;    transform: translateX(120%) translateY(-50%); }
          60%  { opacity: 0.3; transform: translateX(-2%) translateY(-50%); }
          100% { opacity: 0.3; transform: translateX(0%)  translateY(-50%); }
        }
        @keyframes logoFloat {
          0%   { opacity: 0.3; transform: translateX(0%) translateY(-50%); }
          50%  { opacity: 0.3; transform: translateX(0%) translateY(calc(-50% - 4px)); }
          100% { opacity: 0.3; transform: translateX(0%) translateY(-50%); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(198,112,28,0.5) !important;
        }
        .login-btn:active {
          transform: translateY(0px) !important;
        }
        .login-input:focus {
          border-color: rgba(255,255,255,0.6) !important;
          background-color: rgba(255,255,255,0.12) !important;
        }
      `}</style>

      {/* ── Photo de la faculté ── */}
      <img
        src="/fstg.jpg"
        alt="FST"
        style={{
          ...S.photo,
          animation: 'fadeInPhoto 1.6s ease forwards',
        }}
      />

      {/* ── Overlay dégradé bleu ── */}
      <div style={{
        ...S.overlay,
        animation: 'overlayIn 2s ease 0.3s forwards',
        opacity: 0,
      }} />

      {/* ── Logo UCA : slide depuis droite puis flotte ── */}
      <img
        src="/logo_univ_orange.png"
        alt="UCA"
        style={{
          ...S.ucaLogo,
          animation: mounted
            ? 'logoSlideIn 1.2s ease 0.5s forwards, logoFloat 3.5s ease-in-out 1.7s infinite'
            : 'none',
          opacity: 0,
        }}
      />

      {/* ── Formulaire centré ── */}
      <div style={{
        ...S.formWrapper,
        animation: 'slideUp 0.8s ease 0.5s forwards',
        opacity: 0,
      }}>

        <div style={S.logoWrapper}>
          <img src="/LOGO_FST-NObg.png" width="80" height="80" alt="FST" style={S.fstLogo} />
        </div>

        <h2 style={S.formTitle}>Connexion</h2>
        <p style={S.formSubtitle}>Scolarité Digitale — FST Marrakech</p>

        {error && (
          <div style={S.errorBox}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={S.form}>
          <div style={S.inputGroup}>
            <label style={S.label}>Adresse email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="exemple@scolarite.ma"
              style={S.input}
              className="login-input"
              required
            />
          </div>

          <div style={S.inputGroup}>
            <label style={S.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={S.input}
              className="login-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
            style={{
              ...S.button,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p style={S.footer}>
          FST Marrakech — Scolarité © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

const S = {
  container: {
    position: 'relative',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#041b44',
  },

  photo: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1,
    opacity: 0,
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(4,27,68,0.82) 0%, rgba(10,57,139,0.75) 100%)',
    zIndex: 2,
    opacity: 0,
  },

  ucaLogo: {
    position: 'absolute',
    top: '50%',
    left: '-2%',
    transform: 'translateX(120%) translateY(-50%)',
    width: '52%',
    maxWidth: '580px',
    zIndex: 3,
    opacity: 0,
    pointerEvents: 'none',
    objectFit: 'contain',
    objectPosition: 'center center',
  },

  formWrapper: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '24px',
    padding: '48px 44px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
    opacity: 0,
  },

  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },

  fstLogo: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 10px rgba(255,255,255,0.2))',
  },

  formTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '4px',
    letterSpacing: '-0.3px',
  },

  formSubtitle: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: '28px',
    letterSpacing: '0.3px',
  },

  errorBox: {
    backgroundColor: 'rgba(231,76,60,0.2)',
    border: '1px solid rgba(231,76,60,0.4)',
    borderLeft: '4px solid #E74C3C',
    borderRadius: '8px',
    padding: '11px 14px',
    marginBottom: '20px',
    color: '#FECDD3',
    fontSize: '13px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },

  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },

  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid rgba(255,255,255,0.2)',
    fontSize: '14px',
    outline: 'none',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.08)',
    transition: 'border-color 0.2s, background-color 0.2s',
  },

  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #F28C28, #C6701C)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: '6px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 14px rgba(198,112,28,0.35)',
  },

  footer: {
    marginTop: '24px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.3px',
  },
};