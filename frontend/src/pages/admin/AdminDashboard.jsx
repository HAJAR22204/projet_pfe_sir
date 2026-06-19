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

  const statuts     = data?.demandes_par_statut || {};
  const performance = data?.agents_performance  || [];
  const activite    = data?.activite_recente    || [];

  return (
    <div style={S.container}>

      {/* ── Cartes principales ── */}
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

      {/* ── Ligne 2 : Diagramme barres + Demandes par statut ── */}
      <div style={S.row2}>

        {/* Diagramme à barres — demandes traitées par agent */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Demandes traitées par agent</h3>
          {performance.length === 0 ? (
            <div style={S.emptyState}>
              <p style={{ fontSize:'13px', color:'#374151' }}>Aucune donnée disponible</p>
            </div>
          ) : (
            <BarChart data={performance} />
          )}
        </div>

        {/* Demandes par statut */}
        <div style={S.card}>
          <h3 style={S.cardTitle}>Demandes par statut</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            <RoleBar label="En attente" value={statuts.en_attente ?? 0} total={data?.total_demandes ?? 1} color="#F28C28" />
            <RoleBar label="En cours"   value={statuts.en_cours   ?? 0} total={data?.total_demandes ?? 1} color="#0A74D1" />
            <RoleBar label="Prêtes"     value={statuts.prete      ?? 0} total={data?.total_demandes ?? 1} color="#27AE60" />
            <RoleBar label="Refusées"   value={statuts.refusee    ?? 0} total={data?.total_demandes ?? 1} color="#E74C3C" />
          </div>
        </div>

      </div>

      {/* ── Ligne 3 : Activité récente (pleine largeur) ── */}
      <div style={S.card}>
        <h3 style={S.cardTitle}>Activité récente</h3>
        {activite.length === 0 ? (
          <div style={S.emptyState}>
            <p style={{ fontSize:'13px', color:'#374151' }}>Aucune activité récente</p>
          </div>
        ) : (
          <div style={S.activiteGrid}>
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
                  padding:'2px 8px', borderRadius:'20px',
                  fontSize:'10px', fontWeight:'700', letterSpacing:'0.3px',
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
  );
}

/* ── Diagramme à barres ── */
function BarChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const chartH = 160;
  const barW   = 36; // largeur fixe et étroite pour chaque barre
  const maxVal = Math.max(...data.map(d => d.total), 1);

  // Graduations axe Y
  const ySteps  = 5;
  const stepVal = Math.ceil(maxVal / ySteps);
  const yMax    = stepVal * ySteps;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => i * stepVal).reverse();

  return (
    <div style={{ display:'flex', gap:'8px', alignItems:'stretch', overflowX:'auto' }}>

      {/* ── Axe Y ── */}
      <div style={{
        display:'flex', flexDirection:'column', justifyContent:'space-between',
        paddingBottom:'52px', alignItems:'flex-end', flexShrink:0, minWidth:'28px',
      }}>
        {yLabels.map((v, i) => (
          <span key={i} style={{ fontSize:'10px', color:'#374151', lineHeight:1 }}>{v}</span>
        ))}
      </div>

      {/* ── Zone graphique + labels ── */}
      <div style={{ display:'flex', flexDirection:'column', flex:1 }}>

        {/* Zone barres */}
        <div style={{
          position:'relative', height:`${chartH}px`,
          display:'flex', alignItems:'flex-end', gap:'24px', padding:'0 12px',
        }}>

          {/* Lignes de grille horizontales */}
          {yLabels.map((_, i) => (
            <div key={i} style={{
              position:'absolute', left:0, right:0,
              top:`${(i / ySteps) * 100}%`,
              borderTop: i === ySteps ? '2px solid #E2E8F0' : '1px dashed #E2E8F0',
              zIndex:0,
            }} />
          ))}

          {/* Barres */}
          {data.map((agent, i) => {
            const barH  = Math.max((agent.total / yMax) * chartH, 2);
            const isHov = hovered === i;

            return (
              <div
                key={i}
                style={{
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'flex-end',
                  height:'100%', position:'relative', zIndex:1,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Valeur au dessus de la barre */}
                <span style={{
                  fontSize:'12px', fontWeight:'700',
                  color: isHov ? '#0A2D6A' : '#0F5FB4',
                  marginBottom:'4px', whiteSpace:'nowrap',
                }}>
                  {agent.total}
                </span>

                {/* Barre étroite */}
                <div style={{
                  width:`${barW}px`,
                  height:`${barH}px`,
                  background: isHov
                    ? 'linear-gradient(180deg, #0A74D1 0%, #0A2D6A 100%)'
                    : 'linear-gradient(180deg, #0F5FB4 0%, #0A2D6A 100%)',
                  borderRadius:'4px 4px 0 0',
                  transition:'background 0.2s, height 0.4s ease',
                  cursor:'pointer',
                  boxShadow: isHov ? '0 4px 12px rgba(15,95,180,0.4)' : 'none',
                  position:'relative',
                }}>
                  {/* Tooltip centré */}
                  {isHov && (
                    <div style={{
                      position:'absolute', bottom:'calc(100% + 8px)',
                      left:'50%', transform:'translateX(-50%)',
                      backgroundColor:'#0A2D6A', color:'#fff',
                      fontSize:'11px', fontWeight:'600',
                      padding:'6px 10px', borderRadius:'6px',
                      whiteSpace:'nowrap', zIndex:20,
                      boxShadow:'0 2px 8px rgba(10,45,106,0.3)',
                      lineHeight:'1.7',
                      textAlign:'center',
                    }}>
                      {agent.prenom} {agent.nom}<br/>
                      <span style={{ color:'#27AE60' }}>{agent.prete ?? 0} ✓</span>
                      {' · '}
                      <span style={{ color:'#E74C3C' }}>{agent.refusee ?? 0} ✗</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ligne de base */}
        <div style={{ height:'2px', backgroundColor:'#E2E8F0', margin:'0 12px' }} />

        {/* Labels agents en dessous */}
        <div style={{
          display:'flex', gap:'24px', padding:'8px 12px 0',
        }}>
          {data.map((agent, i) => (
            <div
              key={i}
              style={{
                display:'flex', flexDirection:'column',
                alignItems:'center', gap:'4px',
                cursor:'pointer', width:`${barW}px`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{
                width:'28px', height:'28px', borderRadius:'50%',
                background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
                color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'9px', fontWeight:'700', textTransform:'uppercase',
                border: hovered === i ? '2px solid #F28C28' : '2px solid transparent',
                transition:'border 0.15s', flexShrink:0,
              }}>
                {agent.prenom?.[0]}{agent.nom?.[0]}
              </div>
              <span style={{
                fontSize:'10px', color:'#374151', fontWeight:'500',
                textAlign:'center', lineHeight:'1.3',
                width:`${barW + 20}px`,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>
                {agent.prenom}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function BigCard({ label, value, color, subLabel }) {
  return (
    <div style={{ ...S.bigCard, borderTop:`3px solid ${color}` }}>
      <div>
        <p style={S.bigCardLabel}>{label}</p>
        <p style={{ ...S.bigCardValue, color }}>{value}</p>
        {subLabel && <p style={S.bigCardSub}>{subLabel}</p>}
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
          width:`${pct}%`, backgroundColor:color,
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
  },
  bigCardLabel: {
    fontSize:'10px', fontWeight:'700', color:'#374151',
    textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px',
  },
  bigCardValue: { fontSize:'32px', fontWeight:'800', lineHeight:1 },
  bigCardSub:   { fontSize:'11px', color:'#374151', marginTop:'6px' },
  bigCardAccent: {
    width:'40px', height:'40px', borderRadius:'10px',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
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
    padding:'20px', textAlign:'center', backgroundColor:'#F5F7FB', borderRadius:'8px',
  },

  activiteGrid: {
    display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px',
  },
  activiteRow: {
    display:'flex', alignItems:'flex-start', gap:'10px',
    padding:'8px 10px', borderRadius:'6px',
    backgroundColor:'#F5F7FB', border:'1px solid #E2E8F0',
  },
};