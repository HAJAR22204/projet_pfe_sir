import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { HiOutlineBars3, HiChevronDown } from 'react-icons/hi2';

const pageTitles = {
  '/dashboard':       'Tableau de bord',
  '/demandes':        'Demandes',
  '/historique':      'Historique',
  '/admin/dashboard': 'Administration',
  '/admin/users':     'Utilisateurs',
};

function getRoleLabel(role) {
  const labels = {
    admin:          'Administrateur',
    chefScolarite:  'Chef de scolarité',
    agentScolarite: 'Agent de scolarité',
  };
  return labels[role] || role;
}

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const isDetailPage =
    location.pathname.startsWith('/demandes/') &&
    location.pathname !== '/demandes';

  const pageTitle = isDetailPage
    ? 'Détail Demande'
    : pageTitles[location.pathname] || 'Back-office';

  return (
    <div style={S.navbar}>

      {/* Gauche — icône menu + fil d'Ariane */}
      <div style={S.left}>
        <button style={S.menuIcon} aria-label="Menu">
          <HiOutlineBars3 style={{ fontSize: '20px' }} />
        </button>
        <div style={S.breadcrumb}>
          <span style={S.breadcrumbRoot}>Scolarité</span>
          <span style={S.breadcrumbSep}>›</span>
          <span style={S.breadcrumbCurrent}>{pageTitle}</span>
        </div>
      </div>

      {/* Droite — profil utilisateur */}
      <div style={S.right}>
        <div style={S.avatar}>
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <div style={S.userInfo}>
          <p style={S.userName}>{user?.prenom} {user?.nom}</p>
          <p style={S.userSub}>{getRoleLabel(user?.role)}</p>
        </div>
        <HiChevronDown style={{ fontSize: '16px', color: '#374151' }} />
      </div>
    </div>
  );
}

const S = {
  navbar: {
    backgroundColor: '#fff',
    padding: '0 28px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '64px',
    boxShadow: '0 1px 4px rgba(15,95,180,0.06)',
  },

  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  menuIcon: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#374151',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breadcrumbRoot: {
    fontSize: '13px',
    color: '#374151',
    fontWeight: '500',
  },
  breadcrumbSep: {
    fontSize: '13px',
    color: '#CBD5E1',
  },
  breadcrumbCurrent: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0F5FB4',
  },

  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    flexShrink: 0,
    boxShadow: '0 2px 6px rgba(15,95,180,0.25)',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1B263B',
    whiteSpace: 'nowrap',
  },
  userSub: {
    fontSize: '10px',
    color: '#374151',
    marginTop: '1px',
    whiteSpace: 'nowrap',
  },
};