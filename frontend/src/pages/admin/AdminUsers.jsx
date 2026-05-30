import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const ROLES = [
  { key: '', label: 'Tous les rôles' },
  { key: 'admin', label: 'Administrateur' },
  { key: 'chefScolarite', label: 'Chef de Scolarité' },
  { key: 'agentScolarite', label: 'Agent de Scolarité' },
];

const ROLE_STYLES = {
  admin:          { bg: '#EFF6FF', color: '#0A2D6A', label: 'Administrateur' },
  chefScolarite:  { bg: '#E0F2FE', color: '#0F5FB4', label: 'Chef Scolarité' },
  agentScolarite: { bg: '#F0FDF4', color: '#27AE60', label: 'Agent Scolarité' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [filterRole, setFilterRole] = useState('');
  const [message, setMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', role: 'agentScolarite'
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data.users);
      setStats(res.data.stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ nom:'', prenom:'', email:'', password:'', role:'agentScolarite' });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ nom:user.nom, prenom:user.prenom, email:user.email, password:'', role:user.role });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormErrors({});
    try {
      const data = { ...form };
      if (editUser && !data.password) delete data.password;
      if (editUser) {
        await adminService.updateUser(editUser.id, data);
        setMessage({ type:'success', text:'Utilisateur modifié avec succès !' });
      } else {
        await adminService.createUser(data);
        setMessage({ type:'success', text:'Utilisateur créé avec succès !' });
      }
      setShowModal(false);
      fetchUsers();
    } catch (e) {
      if (e.response?.data?.errors) {
        setFormErrors(e.response.data.errors);
      } else {
        setMessage({ type:'error', text: e.response?.data?.message || 'Erreur' });
        setShowModal(false);
      }
    } finally { setFormLoading(false); }
  };

  const handleToggle = async (id) => {
    try {
      await adminService.toggleActif(id);
      fetchUsers();
    } catch (e) {
      setMessage({ type:'error', text: e.response?.data?.message || 'Erreur' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteUser(id);
      setMessage({ type:'success', text:'Utilisateur supprimé.' });
      setConfirmDelete(null);
      fetchUsers();
    } catch (e) {
      setMessage({ type:'error', text: e.response?.data?.message || 'Erreur' });
      setConfirmDelete(null);
    }
  };

  const filtered = filterRole ? users.filter(u => u.role === filterRole) : users;

  return (
    <div style={S.container}>

      {/* Message */}
      {message && (
        <div style={{
          ...S.messageBox,
          backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FFF1F2',
          borderColor: message.type === 'success' ? '#27AE60' : '#E74C3C',
          color: message.type === 'success' ? '#166534' : '#991B1B',
        }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} style={S.closeMsg}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div style={S.statsRow}>
        <StatCard label="Total" value={users.length} color="#0F5FB4" borderColor="#0F5FB4" />
        <StatCard label="Administrateurs" value={stats.admins ?? 0} color="#0A2D6A" borderColor="#0A2D6A" />
        <StatCard label="Chefs Scolarité" value={stats.chefs ?? 0} color="#0A74D1" borderColor="#0A74D1" />
        <StatCard label="Agents" value={stats.agents ?? 0} color="#0D8DE3" borderColor="#0D8DE3" />
        <StatCard label="Actifs" value={users.filter(u => u.actif).length} color="#27AE60" borderColor="#27AE60" />
        <StatCard label="Désactivés" value={users.filter(u => !u.actif).length} color="#E74C3C" borderColor="#E74C3C" />
      </div>

      {/* Toolbar */}
      <div style={S.toolbar}>
        <div style={S.filterRow}>
          {ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => setFilterRole(r.key)}
              style={{
                ...S.filterBtn,
                backgroundColor: filterRole === r.key ? '#0F5FB4' : '#fff',
                color: filterRole === r.key ? '#fff' : '#374151',
                border: filterRole === r.key ? '1.5px solid #0F5FB4' : '1.5px solid #E2E8F0',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button onClick={openCreate} style={S.createBtn}>
          + Nouvel utilisateur
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={S.loadingBox}>
          <p style={{ color:'#374151' }}>Chargement...</p>
        </div>
      ) : (
        <div style={S.tableContainer}>
          <table style={S.table}>
            <thead>
              <tr style={S.thead}>
                <th style={S.th}>Utilisateur</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Rôle</th>
                <th style={S.th}>Statut</th>
                <th style={S.th}>Inscrit le</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rs = ROLE_STYLES[u.role] || {};
                return (
                  <tr key={u.id} style={{
                    backgroundColor: i % 2 === 0 ? '#fff' : '#F5F7FB',
                    borderBottom: '1px solid #E2E8F0',
                  }}>
                    <td style={S.td}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{
                          ...S.avatar,
                          background: u.actif
                            ? 'linear-gradient(135deg, #0F5FB4, #0A74D1)'
                            : '#CBD5E1',
                        }}>
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                        <div>
                          <p style={{ fontSize:'13px', fontWeight:'600', color:'#1B263B' }}>
                            {u.prenom} {u.nom}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize:'12px', color:'#374151' }}>{u.email}</span>
                    </td>
                    <td style={S.td}>
                      <span style={{
                        padding:'4px 10px', borderRadius:'20px',
                        fontSize:'11px', fontWeight:'600',
                        backgroundColor: rs.bg, color: rs.color,
                      }}>
                        {rs.label}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{
                        padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                        backgroundColor: u.actif ? '#F0FDF4' : '#FFF1F2',
                        color: u.actif ? '#27AE60' : '#E74C3C',
                      }}>
                        {u.actif ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize:'12px', color:'#374151' }}>
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button onClick={() => openEdit(u)} style={S.editBtn}>
                          Modifier
                        </button>
                        <button
                          onClick={() => handleToggle(u.id)}
                          style={{
                            ...S.toggleBtn,
                            backgroundColor: u.actif ? '#FFF7ED' : '#F0FDF4',
                            color: u.actif ? '#F28C28' : '#27AE60',
                            border: u.actif ? '1px solid #F28C28' : '1px solid #27AE60',
                          }}
                        >
                          {u.actif ? 'Désactiver' : 'Activer'}
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => setConfirmDelete(u)} style={S.deleteBtn}>
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>
                {editUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
              </h3>
              <button onClick={() => setShowModal(false)} style={S.closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div style={S.formRow}>
                <FormField
                  label="Nom" value={form.nom}
                  onChange={(v) => setForm({...form, nom:v})}
                  error={formErrors.nom?.[0]}
                  placeholder="Nom"
                />
                <FormField
                  label="Prénom" value={form.prenom}
                  onChange={(v) => setForm({...form, prenom:v})}
                  error={formErrors.prenom?.[0]}
                  placeholder="Prénom"
                />
              </div>
              <FormField
                label="Email" type="email" value={form.email}
                onChange={(v) => setForm({...form, email:v})}
                error={formErrors.email?.[0]}
                placeholder="email@scolarite.ma"
              />
              <FormField
                label={editUser ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
                type="password" value={form.password}
                onChange={(v) => setForm({...form, password:v})}
                error={formErrors.password?.[0]}
                placeholder="••••••••"
                required={!editUser}
              />
              <div>
                <label style={S.label}>Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({...form, role:e.target.value})}
                  style={S.select}
                >
                  <option value="agentScolarite">Agent de Scolarité</option>
                  <option value="chefScolarite">Chef de Scolarité</option>
                  <option value="admin">Administrateur</option>
                </select>
                {formErrors.role && <p style={S.errorText}>{formErrors.role[0]}</p>}
              </div>
              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={S.cancelBtn}>
                  Annuler
                </button>
                <button type="submit" disabled={formLoading}
                  style={{ ...S.submitBtn, opacity: formLoading ? 0.7 : 1 }}>
                  {formLoading ? 'Enregistrement...' : (editUser ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {confirmDelete && (
        <div style={S.modalOverlay}>
          <div style={{ ...S.modal, maxWidth:'420px' }}>
            <div style={{ ...S.modalHeader, borderBottom:'none', paddingBottom:0 }}>
              <h3 style={{ fontSize:'16px', fontWeight:'700', color:'#1B263B' }}>
                Confirmer la suppression
              </h3>
            </div>
            <p style={{ fontSize:'13px', color:'#374151', margin:'12px 0 20px', lineHeight:'1.6' }}>
              Voulez-vous supprimer <strong>{confirmDelete.prenom} {confirmDelete.nom}</strong> ?
              Cette action est irréversible.
            </p>
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)} style={S.cancelBtn}>Annuler</button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                style={{ ...S.deleteBtn, padding:'10px 20px', fontSize:'13px', borderRadius:'8px' }}
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ label, value, color, borderColor }) {
  return (
    <div style={{ ...S.statCard, borderTop: `3px solid ${borderColor}` }}>
      <p style={{ fontSize:'24px', fontWeight:'800', color }}>{value}</p>
      <p style={{ fontSize:'10px', color:'#374151', marginTop:'4px', fontWeight:'600',
        textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</p>
    </div>
  );
}

function FormField({ label, value, onChange, error, type='text', placeholder, required }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px', flex:1 }}>
      <label style={S.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...S.input, borderColor: error ? '#E74C3C' : '#E2E8F0' }}
        required={required}
      />
      {error && <p style={S.errorText}>{error}</p>}
    </div>
  );
}

const S = {
  container: { display:'flex', flexDirection:'column', gap:'16px' },

  messageBox: {
    padding:'12px 16px', borderRadius:'8px', border:'1px solid',
    fontSize:'13px', fontWeight:'500',
    display:'flex', alignItems:'center', justifyContent:'space-between',
  },
  closeMsg: { backgroundColor:'transparent', border:'none', cursor:'pointer', fontSize:'16px', color:'inherit' },

  statsRow: { display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'12px' },
  statCard: {
    backgroundColor:'#fff', borderRadius:'10px', padding:'16px',
    textAlign:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
    border:'1px solid #E2E8F0',
  },

  toolbar: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' },
  filterRow: { display:'flex', gap:'8px', flexWrap:'wrap' },
  filterBtn: { padding:'7px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'500', cursor:'pointer', transition:'all 0.2s' },
  createBtn: {
    padding:'10px 20px', backgroundColor:'#0F5FB4', color:'#fff',
    border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600',
    cursor:'pointer', whiteSpace:'nowrap', transition:'background-color 0.2s',
  },

  loadingBox: { backgroundColor:'#fff', borderRadius:'12px', padding:'60px', textAlign:'center', border:'1px solid #E2E8F0' },

  tableContainer: {
    backgroundColor:'#fff', borderRadius:'12px',
    border:'1px solid #E2E8F0', overflow:'hidden',
    boxShadow:'0 1px 4px rgba(0,0,0,0.06)',
  },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { backgroundColor:'#0A2D6A' },
  th: {
    padding:'12px 16px', textAlign:'left', fontSize:'10px',
    fontWeight:'700', color:'rgba(255,255,255,0.7)',
    letterSpacing:'1px', textTransform:'uppercase',
  },
  td: { padding:'12px 16px', fontSize:'13px', verticalAlign:'middle' },

  avatar: {
    width:'34px', height:'34px', borderRadius:'50%', color:'#fff',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'11px', fontWeight:'700', textTransform:'uppercase', flexShrink:0,
  },

  editBtn: {
    padding:'5px 12px', backgroundColor:'#EFF6FF',
    color:'#0F5FB4', border:'1px solid #0F5FB4',
    borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer',
  },
  toggleBtn: {
    padding:'5px 12px', borderRadius:'6px',
    fontSize:'11px', fontWeight:'600', cursor:'pointer',
  },
  deleteBtn: {
    padding:'5px 12px', backgroundColor:'#FFF1F2',
    color:'#E74C3C', border:'1px solid #E74C3C',
    borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer',
  },

  modalOverlay: {
    position:'fixed', inset:0, backgroundColor:'rgba(10,45,106,0.5)',
    display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
  },
  modal: {
    backgroundColor:'#fff', borderRadius:'16px', padding:'28px',
    width:'100%', maxWidth:'520px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    marginBottom:'20px', paddingBottom:'14px', borderBottom:'1px solid #E2E8F0',
  },
  modalTitle: { fontSize:'17px', fontWeight:'700', color:'#1B263B' },
  closeModal: {
    backgroundColor:'transparent', border:'none', cursor:'pointer',
    fontSize:'18px', color:'#374151', padding:'4px 8px',
  },

  formRow: { display:'flex', gap:'12px' },
  label: { fontSize:'12px', fontWeight:'600', color:'#374151', marginBottom:'4px', display:'block' },
  input: {
    padding:'10px 14px', borderRadius:'8px', border:'1.5px solid',
    fontSize:'13px', outline:'none', color:'#1B263B',
    width:'100%', boxSizing:'border-box',
    transition:'border-color 0.2s',
  },
  select: {
    padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #E2E8F0',
    fontSize:'13px', color:'#1B263B', backgroundColor:'#fff',
    width:'100%', outline:'none', marginTop:'4px',
  },
  errorText: { fontSize:'11px', color:'#E74C3C', marginTop:'3px' },

  cancelBtn: {
    padding:'10px 20px', backgroundColor:'#fff',
    border:'1.5px solid #E2E8F0', borderRadius:'8px',
    fontSize:'13px', cursor:'pointer', color:'#374151', fontWeight:'500',
  },
  submitBtn: {
    padding:'10px 24px', backgroundColor:'#0F5FB4', color:'#fff',
    border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer',
  },
};