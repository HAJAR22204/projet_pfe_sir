import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* Côté gauche */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <img
            src="/ministry.png"
            alt="Ministère"
            height={90}
            width={200}
            style={styles.ministryLogo}
          />
          <h1 style={styles.leftTitle}>Université Cadi Ayyad</h1>
          <h2 style={styles.leftSubtitle}>Faculté des Sciences et Techniques</h2>
          <p style={styles.leftCity}>Marrakech</p>
          <div style={styles.divider} />
          <p style={styles.leftDesc}>
            Système de gestion des demandes administratives
          </p>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>Scolarité Digitale</span>
            <span style={styles.badge}>Sécurisé</span>
          </div>
        </div>
      </div>

      {/* Côté droit */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>

          {/* Logo + Titre */}
          <div style={styles.logoWrapper}>
            <img src="/LOGO_FST.png" alt="FST" style={styles.fstLogo} />
          </div>

          <h2 style={styles.formTitle}>Connexion</h2>
          <p style={styles.formSubtitle}>Back-office Scolarité — FST Marrakech</p>

          {/* Erreur */}
          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@scolarite.ma"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <p style={styles.footer}>
            FST Marrakech — Scolarité © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },

  /* ── Panneau gauche ── */
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(160deg, #0A2D6A 0%, #0F5FB4 55%, #0A74D1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    textAlign: 'center',
    color: '#fff',
    position: 'relative',
    zIndex: 1,
  },
  ministryLogo: {
    width: '130px',
    marginBottom: '32px',
    filter: 'brightness(1.1) drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
  },
  leftTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '8px',
    letterSpacing: '0.3px',
  },
  leftSubtitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#FFD23F',
    marginBottom: '6px',
  },
  leftCity: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '28px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  divider: {
    width: '50px',
    height: '3px',
    background: 'linear-gradient(90deg, #F28C28, #FFD23F)',
    margin: '0 auto 24px',
    borderRadius: '2px',
  },
  leftDesc: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.65)',
    lineHeight: '1.7',
    maxWidth: '260px',
    margin: '0 auto 24px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginTop: '4px',
  },
  badge: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '4px 10px',
    borderRadius: '20px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },

  /* ── Panneau droit ── */
  rightPanel: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '48px 44px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 8px 32px rgba(15,95,180,0.1)',
    border: '1px solid #E2E8F0',
    textAlign: 'center',
  },
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  fstLogo: {
    width: '90px',
    height: '90px',
    objectFit: 'contain',
  },
  formTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#1B263B',
    marginBottom: '6px',
    letterSpacing: '-0.3px',
  },
  formSubtitle: {
    fontSize: '13px',
    color: '#374151',
    marginBottom: '28px',
  },

  /* Erreur */
  errorBox: {
    backgroundColor: '#FFF1F2',
    border: '1px solid #FECDD3',
    borderLeft: '4px solid #E74C3C',
    borderRadius: '8px',
    padding: '11px 14px',
    marginBottom: '20px',
    color: '#991B1B',
    fontSize: '13px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },

  /* Formulaire */
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    textAlign: 'left',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #E2E8F0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    color: '#1B263B',
    backgroundColor: '#F5F7FB',
  },
  button: {
    padding: '14px',
    background: 'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: '6px',
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 12px rgba(15,95,180,0.3)',
  },

  footer: {
    marginTop: '28px',
    fontSize: '11px',
    color: '#374151',
    letterSpacing: '0.3px',
  },
};