import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineSquares2X2,
  HiOutlineInbox,
  HiOutlineClock,
  HiOutlineCog6Tooth,
  HiOutlineUsers,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineChevronLeft,
} from 'react-icons/hi2';

const menuItems = [
  { path: '/dashboard',  icon: <HiOutlineSquares2X2 />, label: 'Tableau de bord' },
  { path: '/demandes',   icon: <HiOutlineInbox />,      label: 'Demandes' },
  { path: '/historique', icon: <HiOutlineClock />,      label: 'Historique' },
];

const adminItems = [
  { path: '/admin/dashboard', icon: <HiOutlineCog6Tooth />, label: 'Admin Dashboard' },
  { path: '/admin/users',     icon: <HiOutlineUsers />,     label: 'Utilisateurs' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div style={{
      ...S.sidebar,
      width:    collapsed ? '68px' : '260px',
      minWidth: collapsed ? '68px' : '260px',
    }}>

      <style>{`
        @keyframes flipH {
          0%   { transform: rotateY(0deg); }
          50%  { transform: rotateY(90deg); }
          100% { transform: rotateY(0deg); }
        }
        .logo-flip { animation: flipH 0.5s ease forwards; }
      `}</style>

      {/* ── Logo ── */}
      <div style={{
        ...S.logoSection,
        flexDirection: 'column',
        alignItems: 'center',
        padding: collapsed ? '14px 8px' : '16px 12px',
      }}>
        <div style={{
          ...S.logoImgWrapper,
          width:  collapsed ? '44px' : '100%',
          height: collapsed ? '44px' : '80px',
        }}>
          <img
            key={collapsed ? 'c' : 'e'}
            src={collapsed ? '/logo_univ_orange.png' : '/LOGO_FST-NObg.png'}
            alt="logo"
            style={S.logo}
            className="logo-flip"
          />
        </div>
      </div>

      {/* ── Toggle ── */}
      <div style={{
        display: 'flex',
        justifyContent: collapsed ? 'center' : 'flex-end',
        padding: collapsed ? '0 0 8px' : '0 12px 8px',
      }}>
        <button onClick={() => setCollapsed(!collapsed)} style={S.toggleBtn}>
          <HiOutlineChevronLeft style={{
            fontSize: '15px',
            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }} />
        </button>
      </div>

      <div style={S.divider} />

      {/* ── Utilisateur ── */}
      <div style={{
        ...S.userSection,
        padding:        collapsed ? '12px 0' : '14px 20px',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={S.avatar}>
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        {!collapsed && (
          <div style={S.userInfo}>
            <p style={S.userName}>{user?.prenom} {user?.nom}</p>
            <p style={S.userRole}>{getRoleLabel(user?.role)}</p>
          </div>
        )}
      </div>

      <div style={S.divider} />

      {/* ── Navigation ── */}
      <nav style={{ ...S.nav, padding: collapsed ? '14px 6px' : '14px 10px' }}>

        {/* Admin : seulement Admin Dashboard + Utilisateurs */}
        {isAdmin ? (
          <>
            {!collapsed && <p style={S.navSection}>ADMINISTRATION</p>}
            {adminItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : ''}
                style={({ isActive }) => ({
                  ...S.navItem,
                  padding:         collapsed ? '10px' : '10px 14px',
                  justifyContent:  collapsed ? 'center' : 'flex-start',
                  backgroundColor: isActive ? '#F28C28' : 'transparent',
                  color:           isActive ? '#fff'    : 'rgba(255,255,255,0.55)',
                  fontWeight:      isActive ? '600'     : '400',
                  boxShadow:       isActive ? '0 2px 8px rgba(242,140,40,0.35)' : 'none',
                })}
              >
                <span style={S.navIcon}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        ) : (
          /* Non-admin : Tableau de bord + Demandes + Historique */
          <>
            {!collapsed && <p style={S.navSection}>NAVIGATION</p>}
            {menuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : ''}
                style={({ isActive }) => ({
                  ...S.navItem,
                  padding:         collapsed ? '10px' : '10px 14px',
                  justifyContent:  collapsed ? 'center' : 'flex-start',
                  backgroundColor: isActive ? '#F28C28' : 'transparent',
                  color:           isActive ? '#fff'    : 'rgba(255,255,255,0.55)',
                  fontWeight:      isActive ? '600'     : '400',
                  boxShadow:       isActive ? '0 2px 8px rgba(242,140,40,0.35)' : 'none',
                })}
              >
                <span style={S.navIcon}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}

      </nav>

      {/* ── Bas ── */}
      <div style={S.bottom}>
        <div style={S.divider} />

        {!collapsed && (
          <div style={S.versionRow}>
            <span style={S.versionText}>UCA — FST Marrakech</span>
            <span style={S.versionBadge}>v1.0</span>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Déconnexion' : ''}
          style={{
            ...S.logoutBtn,
            padding:        collapsed ? '10px 0' : '10px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
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
          {!collapsed && <span>Déconnexion</span>}
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
    background: 'linear-gradient(180deg, #0a398b 0%, #092555 60%, #041738 100%)',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    transition: 'width 0.3s ease, min-width 0.3s ease',
  },
  logoSection: { display:'flex', gap:'6px' },
  logoImgWrapper: {},
  logo: {
    width: '100%', height: '100%', objectFit: 'contain',
    mixBlendMode: 'screen', filter: 'brightness(2) contrast(0.9)',
  },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px', color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer', padding: '4px 6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all 0.2s',
  },
  divider: {
    height: '1px', backgroundColor: 'rgba(255,255,255,0.07)', margin: '0 16px',
  },
  divider2: {
    height: '1px', backgroundColor: 'rgba(255,255,255,0.07)', margin: '12px 8px 0',
  },
  userSection: { display:'flex', alignItems:'center', gap:'12px' },
  avatar: {
    width:'36px', height:'36px', minWidth:'36px', borderRadius:'50%',
    background:'linear-gradient(135deg, #F28C28, #C6701C)',
    color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'12px', fontWeight:'700', textTransform:'uppercase',
    boxShadow:'0 2px 8px rgba(242,140,40,0.4)', flexShrink:0,
  },
  userInfo: { overflow:'hidden' },
  userName: {
    color:'#fff', fontSize:'13px', fontWeight:'600',
    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
  },
  userRole: {
    color:'rgba(255,255,255,0.4)', fontSize:'10px', marginTop:'2px',
    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
    textTransform:'uppercase', letterSpacing:'0.5px',
  },
  nav: { flex:1, overflowY:'auto' },
  navSection: {
    color:'rgba(255,255,255,0.25)', fontSize:'9px', fontWeight:'700',
    letterSpacing:'1.5px', padding:'0 10px', marginBottom:'6px', marginTop:'4px',
  },
  navItem: {
    display:'flex', alignItems:'center', gap:'12px',
    borderRadius:'8px', textDecoration:'none',
    fontSize:'13px', marginBottom:'2px', transition:'all 0.2s',
  },
  navIcon: {
    fontSize:'18px', width:'20px', display:'flex',
    alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  bottom: { paddingBottom:'12px' },
  versionRow: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'10px 20px 4px',
  },
  versionText: { fontSize:'10px', color:'rgba(255,255,255,0.18)', letterSpacing:'0.3px' },
  versionBadge: {
    fontSize:'9px', fontWeight:'700', color:'rgba(255,255,255,0.22)',
    backgroundColor:'rgba(255,255,255,0.06)', padding:'2px 7px',
    borderRadius:'10px', letterSpacing:'0.5px',
  },
  logoutBtn: {
    display:'flex', alignItems:'center', gap:'10px', width:'100%',
    backgroundColor:'transparent', border:'none',
    color:'rgba(255,255,255,0.35)', fontSize:'13px',
    cursor:'pointer', transition:'all 0.2s',
  },
};