import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { demandeService } from '../../services/api';
import {
  HiOutlineInboxStack,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
} from 'react-icons/hi2';

const PERIODES = [
  { key: 'aujourd_hui', label: "Aujourd'hui" },
  { key: 'cette_semaine', label: 'Cette semaine' },
  { key: 'ce_mois', label: 'Ce mois' },
  { key: 'cette_annee', label: 'Cette année' },
];

const TYPE_LABELS = {
  attestation_inscription: "Attestation d'inscription",
  certificat_scolarite:    'Certificat de scolarité',
  releve_notes:            'Relevé de notes',
  attestation_reussite:    'Attestation de réussite',
  diplome_deust:           'Diplôme DEUST',
  retrait_bac:             'Retrait bac',
};

const STATUT_BADGE = {
  en_attente: { label: 'En attente', color: '#F28C28', bg: '#FFF7ED' },
  en_cours:   { label: 'En cours',   color: '#0A74D1', bg: '#EFF6FF' },
  prete:      { label: 'Prête',      color: '#27AE60', bg: '#F0FDF4' },
  refusee:    { label: 'Refusée',    color: '#E74C3C', bg: '#FFF1F2' },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [periode, setPeriode] = useState('ce_mois');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [evolutionMode, setEvolutionMode] = useState('recues');

  useEffect(() => { fetchStats(); }, [periode]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await demandeService.statistiques(periode);
      setStats(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={S.loadingContainer}>
      <div style={S.spinner} />
      <p style={{ color: '#374151', marginTop: '12px', fontSize: '13px' }}>Chargement...</p>
    </div>
  );

  const resume    = stats?.resume              || {};
  const perf      = stats?.performance         || {};
  const parType   = stats?.par_type_document   || {};
  const parAgent  = stats?.par_agent           || [];
  const evolution = stats?.evolution_par_jour  || [];
  const recentes  = stats?.demandes_recentes   || [];
  const evolutionTraitees = stats?.evolution_traitees_par_jour || [];

  return (
    <div style={S.container}>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cardFlip {
          0%   { opacity: 0; transform: rotateY(90deg); }
          100% { opacity: 1; transform: rotateY(0deg); }
        }
        .card-flip { animation: cardFlip 0.6s ease 0.2s both; }

.card-flip {
  animation: cardFlip 0.6s ease 0.2s both;

  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;

  transform-style: preserve-3d;
  will-change: transform, opacity;
}

        @keyframes donutGrow {
          from { stroke-dashoffset: var(--circ); }
        }
        .donut-seg { animation: donutGrow 1s ease forwards; }
      `}</style>

      {/* ── Filtres période ── */}
      <div style={S.periodeRow}>
        {PERIODES.map(p => (
          <button key={p.key} onClick={() => setPeriode(p.key)}
            style={{
              ...S.periodeBtn,
              backgroundColor: periode === p.key ? '#0F5FB4' : '#fff',
              color: periode === p.key ? '#fff' : '#374151',
              border: periode === p.key ? '1.5px solid #0F5FB4' : '1.5px solid #E2E8F0',
              boxShadow: periode === p.key ? '0 2px 8px rgba(15,95,180,0.2)' : 'none',
            }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* ── 2 colonnes indépendantes ── */}
      <div style={S.twoColLayout}>

        {/* ══════════ COLONNE GAUCHE ══════════ */}
        <div style={S.colLeft}>

          {/* Grande carte stats */}
          <div
            style={S.bigCard}
            className="card-flip"
            onClick={() => navigate('/demandes')}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(15,95,180,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,95,180,0.25)';
            }}
          >
            <div style={S.bigCardTop}>
              <div>
                <p style={S.bigCardLabel}>TOTAL DEMANDES REÇUES</p>
                <p style={S.bigCardValue}>{resume.total ?? 0}</p>
              </div>
              <div style={S.bigCardIcon}>
                <HiOutlineInboxStack style={{ fontSize:'32px', color:'#fff' }} />
              </div>
            </div>
            <div style={S.miniCardsGrid}>
              <MiniCard
                label="En attente"
                value={resume.en_attente ?? 0}
                icon={<HiOutlineClock style={{ fontSize:'16px' }} />}
                sub={resume.total > 0 ? `${Math.round(((resume.en_attente ?? 0) / resume.total) * 100)}%` : '0%'}
                onClick={e => { e.stopPropagation(); navigate('/demandes?statut=en_attente'); }}
              />
              <MiniCard
                label="En cours"
                value={resume.en_cours ?? 0}
                icon={<HiOutlineArrowPath style={{ fontSize:'16px' }} />}
                onClick={e => { e.stopPropagation(); navigate('/demandes?statut=en_cours'); }}
              />
              <MiniCard
                label="Documents prêts"
                value={resume.prete ?? 0}
                icon={<HiOutlineCheckBadge style={{ fontSize:'16px' }} />}
                sub={resume.total > 0 ? `${Math.round(((resume.prete ?? 0) / resume.total) * 100)}%` : '0%'}
                onClick={e => { e.stopPropagation(); navigate('/demandes?statut=prete'); }}
              />
              <MiniCard
                label="Refusées"
                value={resume.refusee ?? 0}
                icon={<HiOutlineXCircle style={{ fontSize:'16px' }} />}
                sub={resume.total > 0 ? `${Math.round(((resume.refusee ?? 0) / resume.total) * 100)}%` : '0%'}
                onClick={e => { e.stopPropagation(); navigate('/demandes?statut=refusee'); }}
              />
            </div>
          </div>

          {/* Par type de document */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>Par type de document</h3>
            <div style={S.typeList}>
              {Object.entries(parType).map(([type, count]) => (
                <div key={type} style={S.typeRow}>
                  <span style={S.typeLabel}>{TYPE_LABELS[type] || type}</span>
                  <div style={S.typeBarContainer}>
                    <div style={{
                      ...S.typeBar,
                      width: resume.total > 0 ? `${(count / resume.total) * 100}%` : '0%',
                    }} />
                  </div>
                  <span style={S.typeCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evolution */}
<div style={S.card}>
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #E2E8F0' }}>
    <h3 style={{ fontSize:'13px', fontWeight:'700', color:'#1B263B', textTransform:'uppercase', letterSpacing:'0.5px' }}>
      Évolution des demandes
    </h3>
    <div style={{ display:'flex', gap:'4px' }}>
      <button
        onClick={() => setEvolutionMode('recues')}
        style={{
          padding:'4px 12px', borderRadius:'20px', fontSize:'11px',
          fontWeight:'600', cursor:'pointer', border:'1.5px solid',
          backgroundColor: evolutionMode === 'recues' ? '#0F5FB4' : '#fff',
          color: evolutionMode === 'recues' ? '#fff' : '#374151',
          borderColor: evolutionMode === 'recues' ? '#0F5FB4' : '#E2E8F0',
        }}
      >
        Reçues
      </button>
      <button
        onClick={() => setEvolutionMode('traitees')}
        style={{
          padding:'4px 12px', borderRadius:'20px', fontSize:'11px',
          fontWeight:'600', cursor:'pointer', border:'1.5px solid',
          backgroundColor: evolutionMode === 'traitees' ? '#27AE60' : '#fff',
          color: evolutionMode === 'traitees' ? '#fff' : '#374151',
          borderColor: evolutionMode === 'traitees' ? '#27AE60' : '#E2E8F0',
        }}
      >
        Traitées
      </button>
    </div>
  </div>

  {/* Graphique */}
  {(() => {
    const data = evolutionMode === 'recues' ? evolution : evolutionTraitees;
    const maxVal = Math.max(...data.map(d => d.total), 1);
    return (
      <div style={S.evolutionContainer}>
        {data.slice(-14).map((day, i) => (
          <div key={i} style={S.evolutionDay}>
            <div style={S.evolutionBar}>
              <div
                style={{
                  ...S.evolutionFill,
                  height: `${Math.max((day.total / maxVal) * 80, 4)}px`,
                  backgroundColor: evolutionMode === 'recues' ? '#0F5FB4' : '#27AE60',
                }}
              />
            </div>
            <span style={S.evolutionDate}>
              {new Date(day.jour + "T00:00:00").toLocaleDateString("fr-FR", {
                day: "2-digit", month: "2-digit",
              })}
            </span>
            <span style={S.evolutionCount}>{day.total}</span>
          </div>
        ))}
        {data.length === 0 && (
          <p style={{ fontSize:'13px', color:'#374151', margin:'auto' }}>
            Aucune donnée disponible
          </p>
        )}
      </div>
    );
  })()}
</div>

        </div>

        {/* ══════════ COLONNE DROITE ══════════ */}
        <div style={S.colRight}>

          {/* Taux de traitement + Performance côte à côte */}
          <div style={S.topRightRow}>
            <div style={S.card}>
              <h3 style={S.cardTitle}>Taux de traitement</h3>
              <DonutChart resume={resume} />
            </div>

            <div style={S.card}>
              <h3 style={S.cardTitle}>Performance</h3>
              <div style={S.perfGrid}>
                <PerfCard label="Temps moyen de réponse" value={`${perf.temps_reponse_moyen_heures ?? 0}h`} />
              </div>
            </div>
          </div>

          {/* Demandes récentes */}
          <div style={S.card}>
            <div style={S.recentesHeader}>
              <div>
                <h3 style={{ ...S.cardTitle, border:'none', marginBottom:'2px', paddingBottom:0 }}>
                  Demandes récentes
                </h3>
                <p style={S.recentesSub}>5 dernières soumissions</p>
              </div>
              <button onClick={() => navigate('/demandes')} style={S.voirToutBtn}>
                Voir tout →
              </button>
            </div>

            {recentes.length === 0 ? (
              <div style={S.emptyState}>
                <p style={{ fontSize:'13px', color:'#374151' }}>Aucune demande pour le moment</p>
              </div>
            ) : (
              <div style={S.recentesList}>
                {recentes.map((d) => {
                  const badge = STATUT_BADGE[d.statut] || {};
                  return (
                    <div
                      key={d.id}
                      style={S.recenteRow}
                      onClick={() => navigate(`/demandes?open=${d.id}`)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F5F7FB'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={S.recenteAvatar}>
                        {d.prenom?.[0]}{d.nom?.[0]}
                      </div>
                      <div style={S.recenteInfo}>
                        <p style={S.recenteName}>{d.prenom} {d.nom}</p>
                        <p style={S.recenteType}>{TYPE_LABELS[d.type_document] || d.type_document}</p>
                      </div>
                      <span style={{
                        ...S.recenteBadge,
                        color: badge.color,
                        backgroundColor: badge.bg,
                      }}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Performance agents */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>Performance des agents</h3>

            {parAgent.length === 0 ? (
              <div style={S.emptyState}>
                Aucune donnée disponible
              </div>
            ) : (
              <div style={S.agentList}>
                {parAgent.map((agent, i) => (
                  <div key={i} style={S.agentRow}>

                    <div style={S.agentAvatar}>
                      {agent.prenom?.[0]}
                      {agent.nom?.[0]}
                    </div>

                    <div style={S.agentInfo}>
                      <p style={S.agentName}>
                        {agent.prenom} {agent.nom}
                      </p>

                      <p style={S.agentStats}>
                        {agent.total} demandes traitées
                      </p>
                    </div>


                    <div style={{
                      display: "flex",
                      gap: "8px",
                    }}>

                      <span style={{
                        color:"#27AE60",
                        fontWeight:"700",
                      }}>
                        {agent.prete ?? 0} ✓
                      </span>


                      <span style={{
                        color:"#E74C3C",
                        fontWeight:"700",
                      }}>
                        {agent.refusee ?? 0} ✗
                      </span>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

function DonutChart({ resume }) {
  const [hovered, setHovered] = useState(null);

  const total     = resume.total ?? 0;
  const prete     = resume.prete ?? 0;
  const refusee   = resume.refusee ?? 0;
  const enCours   = resume.en_cours ?? 0;
  const enAttente = resume.en_attente ?? 0;
  const taux      = resume.taux_traitement ?? 0;

  const radius = 55;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { key:'prete',     label:'Validées',   value: prete,     color: '#27AE60' },
    { key:'enCours',   label:'En cours',   value: enCours,   color: '#0A74D1' },
    { key:'enAttente', label:'En attente', value: enAttente, color: '#F28C28' },
    { key:'refusee',   label:'Refusées',   value: refusee,   color: '#E74C3C' },
  ];

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const dash     = fraction * circumference;
    const offset   = circumference - dash;
    const rotation = total > 0 ? (cumulative / total) * 360 : 0;
    cumulative += seg.value;
    return { ...seg, dash, offset, rotation };
  });

  const centerLabel = hovered
    ? segments.find(s => s.key === hovered)
    : null;

  return (
    <div style={S.tauxContainer}>
      <div style={{ position:'relative', width:'130px', height:'130px', flexShrink:0 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="16" />
          {arcs.map((arc) => (
            arc.value > 0 && (
              <circle
                key={arc.key}
                className="donut-seg"
                style={{ '--circ': circumference, cursor:'pointer' }}
                cx="65" cy="65" r={radius} fill="none"
                stroke={arc.color}
                strokeWidth={hovered === arc.key ? 19 : 16}
                strokeDasharray={circumference}
                strokeDashoffset={arc.offset}
                transform={`rotate(${arc.rotation - 90} 65 65)`}
                strokeLinecap="butt"
                onMouseEnter={() => setHovered(arc.key)}
                onMouseLeave={() => setHovered(null)}
              />
            )
          ))}
        </svg>
        <div style={{
          position:'absolute', inset:0, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', pointerEvents:'none',
        }}>
          {centerLabel ? (
            <>
              <span style={{ fontSize:'22px', fontWeight:'800', color: centerLabel.color }}>
                {centerLabel.value}
              </span>
              <span style={{ fontSize:'10px', color:'#374151', marginTop:'2px' }}>
                {centerLabel.label}
              </span>
            </>
          ) : (
            <>
              <span style={{ fontSize:'22px', fontWeight:'800', color:'#0F5FB4' }}>{taux}%</span>
              <span style={{ fontSize:'10px', color:'#374151', marginTop:'2px' }}>Traité</span>
            </>
          )}
        </div>
      </div>

      <div style={S.tauxLegend}>
        {segments.map(seg => (
          <div
            key={seg.key}
            style={{
              ...S.legendItem,
              backgroundColor: hovered === seg.key ? '#F5F7FB' : 'transparent',
            }}
            onMouseEnter={() => setHovered(seg.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={{ ...S.legendDot, backgroundColor: seg.color }} />
            <span style={S.legendLabel}>{seg.label}</span>
            <span style={{ ...S.legendValue, color: seg.color }}>
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCard({ label, value, icon, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      style={S.miniCard}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
        <span style={{ fontSize:'10px', fontWeight:'700', color:'rgba(255,255,255,0.7)',
          textTransform:'uppercase', letterSpacing:'0.5px' }}>
          {label}
        </span>
        <div style={{ width:'26px', height:'26px', borderRadius:'8px',
          backgroundColor:'rgba(255,255,255,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
          {icon}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'6px' }}>
        <span style={{ fontSize:'24px', fontWeight:'800', color:'#fff', lineHeight:1 }}>{value}</span>
        {sub && (
          <span style={{ fontSize:'10px', fontWeight:'600', color:'#FFD23F',
            backgroundColor:'rgba(255,210,63,0.2)', padding:'2px 6px',
            borderRadius:'10px', marginBottom:'2px' }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function PerfCard({ label, value, alert }) {
  return (
    <div style={{ ...S.perfCard,
      borderColor: alert ? '#FECDD3' : '#E2E8F0',
      backgroundColor: alert ? '#FFF1F2' : '#F5F7FB' }}>
      <p style={{ fontSize:'28px', fontWeight:'800', lineHeight:1,
        color: alert ? '#E74C3C' : '#0F5FB4' }}>
        {value}
      </p>
      <p style={{ fontSize:'11px', color:'#374151', textAlign:'center', marginTop:'6px', lineHeight:'1.4' }}>
        {label}
      </p>
    </div>
  );
}

const S = {
  container: { display:'flex', flexDirection:'column', gap:'20px' },

  loadingContainer: {
    display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center', height:'60vh',
  },
  spinner: {
    width:'40px', height:'40px', border:'4px solid #E2E8F0',
    borderTop:'4px solid #0F5FB4', borderRadius:'50%',
    animation:'spin 1s linear infinite',
  },

  periodeRow: { display:'flex', gap:'8px', flexWrap:'wrap' },
  periodeBtn: {
    padding:'8px 18px', borderRadius:'20px', fontSize:'13px',
    fontWeight:'500', cursor:'pointer', transition:'all 0.2s',
  },

  twoColLayout: {
    display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:'20px', alignItems:'start',
  },
  colLeft:  { display:'flex', flexDirection:'column', gap:'20px' },
  colRight: { display:'flex', flexDirection:'column', gap:'20px' },

  topRightRow: {
    display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px',
  },

  bigCard: {
    background: 'linear-gradient(135deg, #0F5FB4 0%, #0A74D1 100%)',
  borderRadius:'16px',
  padding:'24px',
  boxShadow:'0 4px 20px rgba(15,95,180,0.25)',

  transform: 'translateZ(0)',
  },
  bigCardTop: {
    display:'flex', alignItems:'flex-start',
    justifyContent:'space-between', marginBottom:'20px',
  },
  bigCardLabel: {
    fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.7)',
    textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'8px',
  },
  bigCardValue: {
    fontSize:'56px', fontWeight:'800', color:'#fff', lineHeight:1,
  },
  bigCardIcon: {
    width:'56px', height:'56px', borderRadius:'14px',
    backgroundColor:'rgba(255,255,255,0.2)',
    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  miniCardsGrid: {
    display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px',
  },
  miniCard: {
    backgroundColor:'rgba(255,255,255,0.12)',
    borderRadius:'10px', padding:'12px',
    border:'1px solid rgba(255,255,255,0.2)',
    cursor:'pointer', transition:'background-color 0.2s',
  },

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

  tauxContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
  },
  tauxLegend: { display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'6px', width:'100%' },
  legendItem: {
    display:'flex', alignItems:'center', gap:'6px',
    padding:'4px 8px', borderRadius:'6px', cursor:'pointer',
    transition:'background-color 0.15s',
  },
  legendDot: { width:'8px', height:'8px', borderRadius:'50%', flexShrink:0 },
  legendLabel: { fontSize:'11px', color:'#374151' },
  legendValue: { fontSize:'12px', fontWeight:'700' },

  perfGrid: { display:'grid', gridTemplateColumns:'1fr', gap:'12px' },
  perfCard: {
    border:'1.5px solid', borderRadius:'10px', padding:'16px',
    display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
  },

  typeList: { display:'flex', flexDirection:'column', gap:'10px' },
  typeRow: { display:'flex', alignItems:'center', gap:'10px' },
  typeLabel: { fontSize:'12px', color:'#374151', width:'170px', flexShrink:0 },
  typeBarContainer: {
    flex:1, backgroundColor:'#E2E8F0', borderRadius:'6px', height:'8px', overflow:'hidden',
  },
  typeBar: {
    height:'8px', backgroundColor:'#0F5FB4',
    borderRadius:'6px', transition:'width 0.5s ease',
  },
  typeCount: { fontSize:'13px', fontWeight:'700', color:'#1B263B', width:'30px', textAlign:'right' },

  recentesHeader: {
    display:'flex', justifyContent:'space-between', alignItems:'flex-start',
    marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #E2E8F0',
  },
  recentesSub: { fontSize:'11px', color:'#374151', marginTop:'2px' },
  voirToutBtn: {
    backgroundColor:'transparent', border:'none', color:'#0F5FB4',
    fontSize:'12px', fontWeight:'600', cursor:'pointer', padding:0,
    flexShrink:0,
  },
  recentesList: { display:'flex', flexDirection:'column', gap:'4px' },
  recenteRow: {
    display:'flex', alignItems:'center', gap:'12px',
    padding:'10px 8px', borderRadius:'8px', cursor:'pointer',
    transition:'background-color 0.15s',
  },
  recenteAvatar: {
    width:'36px', height:'36px', borderRadius:'50%',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'12px', fontWeight:'700', textTransform:'uppercase', flexShrink:0,
  },
  recenteInfo: { flex:1, minWidth:0 },
  recenteName: { fontSize:'13px', fontWeight:'600', color:'#1B263B' },
  recenteType: { fontSize:'11px', color:'#374151', marginTop:'2px' },
  recenteBadge: {
    fontSize:'11px', fontWeight:'700', padding:'4px 10px',
    borderRadius:'20px', flexShrink:0, whiteSpace:'nowrap',
  },

  agentList: { display:'flex', flexDirection:'column', gap:'10px' },
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
  agentInfo: { flex:1 },
  agentName: { fontSize:'13px', fontWeight:'600', color:'#1B263B' },
  agentStats: { fontSize:'11px', color:'#374151', marginTop:'2px' },

  emptyState: {
    padding:'20px', textAlign:'center', backgroundColor:'#F5F7FB', borderRadius:'8px',
  },

  evolutionContainer: {
    display:'flex', alignItems:'flex-end', gap:'8px', overflowX:'auto', paddingBottom:'8px',
  },
  evolutionDay: {
    display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', minWidth:'40px',
  },
  evolutionBar: {
    width:'28px', height:'80px', backgroundColor:'#E2E8F0',
    borderRadius:'4px', display:'flex', alignItems:'flex-end', overflow:'hidden',
  },
  evolutionFill: {
    width:'100%', backgroundColor:'#0F5FB4', borderRadius:'4px', transition:'height 0.5s',
  },
  evolutionDate: { fontSize:'10px', color:'#374151' },
  evolutionCount: { fontSize:'11px', fontWeight:'700', color:'#1B263B' },
};