import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard':       { title: 'Tableau de bord',  subtitle: 'Vue générale des demandes' },
  '/demandes':        { title: 'Demandes',          subtitle: 'Gestion des demandes administratives' },
  '/historique':      { title: 'Historique',        subtitle: 'Historique des demandes par étudiant' },
  '/admin/dashboard': { title: 'Administration',    subtitle: 'Tableau de bord administrateur' },
  '/admin/users':     { title: 'Utilisateurs',      subtitle: 'Gestion des comptes utilisateurs' },
};

const ROLE_COLORS = {
  admin:          { bg: '#EFF6FF', color: '#0A2D6A', label: 'Administrateur' },
  chefScolarite:  { bg: '#E0F2FE', color: '#0F5FB4', label: 'Chef de Scolarité' },
  agentScolarite: { bg: '#F0FDF4', color: '#27AE60', label: 'Agent de Scolarité' },
};

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const isDetailPage =
    location.pathname.startsWith('/demandes/') &&
    location.pathname !== '/demandes';

  const pageInfo = isDetailPage
    ? { title: 'Détail Demande', subtitle: 'Traitement de la demande' }
    : pageTitles[location.pathname] || { title: 'Back-office', subtitle: '' };

  const roleStyle = ROLE_COLORS[user?.role] || { bg: '#F5F7FB', color: '#374151', label: user?.role };

  return (
    <div style={S.navbar}>

      {/* Gauche — fil d'Ariane / titre */}
      <div style={S.left}>
        <div style={S.breadcrumb}>
          <span style={S.breadcrumbRoot}>Scolarité</span>
          <span style={S.breadcrumbSep}>/</span>
          <span style={S.breadcrumbCurrent}>{pageInfo.title}</span>
        </div>
        {pageInfo.subtitle && (
          <p style={S.subtitle}>{pageInfo.subtitle}</p>
        )}
      </div>

      {/* Droite — profil utilisateur */}
      <div style={S.right}>

        {/* Badge rôle */}
        <span style={{ ...S.roleBadge, backgroundColor: roleStyle.bg, color: roleStyle.color }}>
          {roleStyle.label}
        </span>

        {/* Carte utilisateur */}
        <div style={S.userBadge}>
          <div style={S.avatar}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div style={S.userInfo}>
            <p style={S.userName}>{user?.prenom} {user?.nom}</p>
            <p style={S.userSub}>{user?.email}</p>
          </div>
        </div>

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

  /* Gauche */
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  breadcrumbRoot: {
    fontSize: '12px',
    color: '#374151',
    fontWeight: '500',
  },
  breadcrumbSep: {
    fontSize: '12px',
    color: '#CBD5E1',
  },
  breadcrumbCurrent: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1B263B',
  },
  subtitle: {
    fontSize: '11px',
    color: '#374151',
    marginTop: '1px',
  },

  /* Droite */
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  roleBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 14px 6px 8px',
    backgroundColor: '#F5F7FB',
    borderRadius: '30px',
    border: '1px solid #E2E8F0',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
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