import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineSquares2X2,
  HiOutlineInbox,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineUsers,
  HiOutlineArrowLeftOnRectangle,
} from 'react-icons/hi2';

const menuItems = [
  { path: '/dashboard',  icon: <HiOutlineSquares2X2 />,     label: 'Tableau de bord' },
  { path: '/demandes', icon: <HiOutlineInbox />, label: 'Demandes' },
  { path: '/historique', icon: <HiOutlineClock />, label: 'Historique' },
];

const adminItems = [
  { path: '/admin/dashboard', icon: <HiOutlineCog6Tooth />, label: 'Admin Dashboard' },
  { path: '/admin/users',     icon: <HiOutlineUsers />,      label: 'Utilisateurs' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={S.sidebar}>

      {/* ── Logo ── */}
      <div style={S.logoSection}>
        <div style={S.logoImgWrapper}>
          <img src="/LOGO_FST.png" alt="FST" style={S.logo} />
        </div>
        <div>
          <p style={S.logoTitle}>FST Marrakech</p>
          <p style={S.logoSub}>Scolarité Digitale</p>
        </div>
      </div>

      <div style={S.divider} />

      {/* ── Utilisateur ── */}
      <div style={S.userSection}>
        <div style={S.avatar}>
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <div style={S.userInfo}>
          <p style={S.userName}>{user?.prenom} {user?.nom}</p>
          <p style={S.userRole}>{getRoleLabel(user?.role)}</p>
        </div>
      </div>

      <div style={S.divider} />

      {/* ── Navigation ── */}
      <nav style={S.nav}>
        <p style={S.navSection}>NAVIGATION</p>

        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...S.navItem,
              backgroundColor: isActive ? '#F28C28' : 'transparent',
              color:            isActive ? '#fff'    : 'rgba(255,255,255,0.55)',
              fontWeight:       isActive ? '600'     : '400',
              boxShadow:        isActive
                ? '0 2px 8px rgba(242,140,40,0.35)'
                : 'none',
            })}
          >
            <span style={S.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* ── Admin ── */}
        {user?.role === 'admin' && (
          <>
            <div style={S.divider2} />
            <p style={{ ...S.navSection, marginTop:'16px' }}>ADMINISTRATION</p>
            {adminItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  ...S.navItem,
                  backgroundColor: isActive ? '#F28C28' : 'transparent',
                  color:            isActive ? '#fff'    : 'rgba(255,255,255,0.55)',
                  fontWeight:       isActive ? '600'     : '400',
                  boxShadow:        isActive
                    ? '0 2px 8px rgba(242,140,40,0.35)'
                    : 'none',
                })}
              >
                <span style={S.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* ── Bas ── */}
      <div style={S.bottom}>
        <div style={S.divider} />

        <div style={S.versionRow}>
          <span style={S.versionText}>UCA — FST Marrakech</span>
          <span style={S.versionBadge}>v1.0</span>
        </div>

        <button
          onClick={handleLogout}
          style={S.logoutBtn}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'rgba(242,140,40,0.10)';
            e.currentTarget.style.color = '#F28C28';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
          }}
        >
          <span style={S.navIcon}><HiOutlineArrowLeftOnRectangle /></span>
          <span>Déconnexion</span>
        </button>
      </div>

    </div>
  );
}

function getRoleLabel(role) {
  const labels = {
    admin:          'Administrateur',
    chefScolarite:  'Chef de Scolarité',
    agentScolarite: 'Agent de Scolarité',
  };
  return labels[role] || role;
}

const S = {
  sidebar: {
    width: '260px',
    minWidth: '260px',
    background: 'linear-gradient(180deg, #0A2D6A 0%, #0A2D6A 60%, #071E47 100%)',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },

  /* Logo */
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
  },
  logoImgWrapper: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3px',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  logo: {
    width: '36px',
    height: '36px',
    objectFit: 'contain',
  },
  logoTitle: {
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.2px',
  },
  logoSub: {
    color: '#FFD23F',
    fontSize: '10px',
    fontWeight: '600',
    marginTop: '2px',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
  },

  divider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    margin: '0 16px',
  },
  divider2: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    margin: '12px 8px 0',
  },

  /* User */
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #F28C28, #C6701C)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    boxShadow: '0 2px 8px rgba(242,140,40,0.4)',
  },
  userInfo: { overflow: 'hidden' },
  userName: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '10px',
    marginTop: '2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  /* Nav */
  nav: {
    flex: 1,
    padding: '14px 10px',
    overflowY: 'auto',
  },
  navSection: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    padding: '0 10px',
    marginBottom: '6px',
    marginTop: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    marginBottom: '2px',
    transition: 'all 0.2s',
  },
  navIcon: {
    fontSize: '18px',
    width: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Bottom */
  bottom: { paddingBottom: '12px' },
  versionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px 4px',
  },
  versionText: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.18)',
    letterSpacing: '0.3px',
  },
  versionBadge: {
    fontSize: '9px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    padding: '2px 7px',
    borderRadius: '10px',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.35)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};