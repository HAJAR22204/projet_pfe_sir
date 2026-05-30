import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await adminService.dashboard();
      setData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
      <p style={{ color:'#374151' }}>Chargement...</p>
    </div>
  );

  const statuts = data?.demandes_par_statut || {};
  const performance = data?.agents_performance || [];
  const activite = data?.activite_recente || [];
  const parRole = data?.users_par_role || {};

  return (
    <div style={S.container}>

      {/* Cartes principales */}
      <div style={S.cardsRow}>
        <BigCard
          label="Total utilisateurs"
          value={data?.total_users ?? 0}
          color="#0F5FB4"
          subLabel="Comptes actifs"
        />
        <BigCard
          label="Total demandes"
          value={data?.total_demandes ?? 0}
          color="#0A74D1"
          subLabel="Toutes périodes"
        />
        <BigCard
          label="En attente"
          value={statuts.en_attente ?? 0}
          color="#F28C28"
          subLabel="À traiter"
        />
        <BigCard
          label="Traitées"
          value={(statuts.prete ?? 0) + (statuts.refusee ?? 0)}
          color="#27AE60"
          subLabel={`${statuts.prete ?? 0} validées · ${statuts.refusee ?? 0} refusées`}
        />
      </div>

      <div style={S.row2}>

        {/* Utilisateurs par rôle */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Utilisateurs par rôle</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <RoleBar label="Administrateurs" value={parRole.admin ?? 0} total={data?.total_users ?? 1} color="#0A2D6A" />
            <RoleBar label="Chefs de Scolarité" value={parRole.chefScolarite ?? 0} total={data?.total_users ?? 1} color="#0F5FB4" />
            <RoleBar label="Agents de Scolarité" value={parRole.agentScolarite ?? 0} total={data?.total_users ?? 1} color="#0A74D1" />
          </div>
        </div>

        {/* Demandes par statut */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Demandes par statut</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <RoleBar label="En attente" value={statuts.en_attente ?? 0} total={data?.total_demandes ?? 1} color="#F28C28" />
            <RoleBar label="En cours" value={statuts.en_cours ?? 0} total={data?.total_demandes ?? 1} color="#0A74D1" />
            <RoleBar label="Prêtes" value={statuts.prete ?? 0} total={data?.total_demandes ?? 1} color="#27AE60" />
            <RoleBar label="Refusées" value={statuts.refusee ?? 0} total={data?.total_demandes ?? 1} color="#E74C3C" />
          </div>
        </div>

      </div>

      <div style={S.row2}>

        {/* Performance agents */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Performance des agents</h3>
          {performance.length === 0 ? (
            <div style={S.emptyState}>
              <p style={{ fontSize:'13px', color:'#374151' }}>Aucune donnée disponible</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {performance.map((a, i) => (
                <div key={i} style={S.agentRow}>
                  <div style={S.agentAvatar}>
                    {a.prenom?.[0]}{a.nom?.[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'13px', fontWeight:'600', color:'#1B263B' }}>
                      {a.prenom} {a.nom}
                    </p>
                    <p style={{ fontSize:'11px', color:'#374151', marginTop:'2px' }}>
                      {a.total} demandes traitées
                    </p>
                  </div>
                  <div style={{ display:'flex', gap:'10px', fontSize:'12px' }}>
                    <span style={{
                      color:'#27AE60', fontWeight:'600',
                      backgroundColor:'#E8F5E9', padding:'2px 8px',
                      borderRadius:'12px',
                    }}>
                      {a.prete} ✓
                    </span>
                    <span style={{
                      color:'#E74C3C', fontWeight:'600',
                      backgroundColor:'#FFEBEE', padding:'2px 8px',
                      borderRadius:'12px',
                    }}>
                      {a.refusee} ✗
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Activité récente</h3>
          {activite.length === 0 ? (
            <div style={S.emptyState}>
              <p style={{ fontSize:'13px', color:'#374151' }}>Aucune activité récente</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {activite.slice(0, 8).map((a, i) => (
                <div key={i} style={S.activiteRow}>
                  <div style={{
                    width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
                    backgroundColor:
                      a.statut === 'prete'   ? '#27AE60' :
                      a.statut === 'refusee' ? '#E74C3C' : '#F28C28',
                    marginTop:'4px',
                  }} />
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'12px', color:'#1B263B' }}>
                      <strong>{a.prenom} {a.nom}</strong>
                      <span style={{ color:'#374151', fontWeight:'400' }}>
                        {' — '}{a.type_document?.replace(/_/g, ' ')}
                      </span>
                    </p>
                    <p style={{ fontSize:'11px', color:'#374151', marginTop:'2px' }}>
                      {a.date_creation
                        ? new Date(a.date_creation).toLocaleDateString('fr-FR')
                        : a.date
                          ? new Date(a.date).toLocaleDateString('fr-FR')
                          : '-'}
                    </p>
                  </div>
                  <span style={{
                    padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'700',
                    letterSpacing:'0.3px',
                    backgroundColor:
                      a.statut === 'prete'    ? '#E8F5E9' :
                      a.statut === 'refusee'  ? '#FFEBEE' :
                      a.statut === 'en_cours' ? '#EFF6FF' : '#FFF3E0',
                    color:
                      a.statut === 'prete'    ? '#27AE60' :
                      a.statut === 'refusee'  ? '#E74C3C' :
                      a.statut === 'en_cours' ? '#0F5FB4' : '#F28C28',
                  }}>
                    {a.statut?.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function BigCard({ label, value, color, subLabel }) {
  return (
    <div style={{ ...S.bigCard, borderTop: `3px solid ${color}` }}>
      <div>
        <p style={S.bigCardLabel}>{label}</p>
        <p style={{ ...S.bigCardValue, color }}>{value}</p>
        {subLabel && (
          <p style={S.bigCardSub}>{subLabel}</p>
        )}
      </div>
      <div style={{ ...S.bigCardAccent, backgroundColor: color + '15' }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', backgroundColor: color }} />
      </div>
    </div>
  );
}

function RoleBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
        <span style={{ fontSize:'12px', color:'#374151', fontWeight:'500' }}>{label}</span>
        <span style={{ fontSize:'12px', fontWeight:'700', color }}>
          {value} <span style={{ color:'#374151', fontWeight:'400' }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ backgroundColor:'#E2E8F0', borderRadius:'6px', height:'8px' }}>
        <div style={{
          width:`${pct}%`, backgroundColor: color,
          borderRadius:'6px', height:'8px', transition:'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

const S = {
  container: { display:'flex', flexDirection:'column', gap:'20px' },

  cardsRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' },

  bigCard: {
    backgroundColor:'#fff', borderRadius:'12px', padding:'20px',
    display:'flex', alignItems:'center', justifyContent:'space-between',
    boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #E2E8F0',
    transition:'box-shadow 0.2s',
  },
  bigCardLabel: {
    fontSize:'10px', fontWeight:'700', color:'#374151',
    textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px',
  },
  bigCardValue: {
    fontSize:'32px', fontWeight:'800', lineHeight:1,
  },
  bigCardSub: {
    fontSize:'11px', color:'#374151', marginTop:'6px',
  },
  bigCardAccent: {
    width:'40px', height:'40px', borderRadius:'10px',
    display:'flex', alignItems:'center', justifyContent:'center',
    flexShrink:0,
  },

  row2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' },

  card: {
    backgroundColor:'#fff', borderRadius:'12px', padding:'20px',
    boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #E2E8F0',
  },
  cardTitle: {
    fontSize:'13px', fontWeight:'700', color:'#1B263B',
    marginBottom:'16px', textTransform:'uppercase',
    letterSpacing:'0.5px', paddingBottom:'10px',
    borderBottom:'1px solid #E2E8F0',
  },

  emptyState: {
    padding:'20px', textAlign:'center',
    backgroundColor:'#F5F7FB', borderRadius:'8px',
  },

  agentRow: {
    display:'flex', alignItems:'center', gap:'12px',
    padding:'10px 12px', backgroundColor:'#F5F7FB',
    borderRadius:'8px', border:'1px solid #E2E8F0',
  },
  agentAvatar: {
    width:'36px', height:'36px', borderRadius:'50%',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'12px', fontWeight:'700', textTransform:'uppercase', flexShrink:0,
  },

  activiteRow: {
    display:'flex', alignItems:'flex-start', gap:'10px',
    padding:'8px 10px', borderRadius:'6px',
    backgroundColor:'#F5F7FB', border:'1px solid #E2E8F0',
  },
};