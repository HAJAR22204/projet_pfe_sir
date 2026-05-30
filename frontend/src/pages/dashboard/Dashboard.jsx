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
  attestation_inscription: 'Attestation inscription',
  certificat_scolarite: 'Certificat scolarité',
  releve_notes: 'Relevé de notes',
  diplome_deust: 'Diplôme DEUST',
  retrait_bac: 'Retrait bac',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [periode, setPeriode] = useState('ce_mois');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const resume   = stats?.resume              || {};
  const perf     = stats?.performance         || {};
  const parType  = stats?.par_type_document   || {};
  const parAgent = stats?.par_agent           || [];
  const evolution = stats?.evolution_par_jour || [];

  return (
    <div style={S.container}>

      <div style={S.periodeRow}>
        {PERIODES.map(p => (
          <button key={p.key} onClick={() => setPeriode(p.key)}
            style={{
              ...S.periodeBtn,
              backgroundColor: periode === p.key ? '#0F5FB4' : '#fff',
              color: periode === p.key ? '#fff' : '#374151',
              border: periode === p.key
                ? '1.5px solid #0F5FB4'
                : '1.5px solid #E2E8F0',
              boxShadow: periode === p.key
                ? '0 2px 8px rgba(15,95,180,0.2)'
                : 'none',
            }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={S.cardsRow}>
        <StatCard
          label="TOTAL DEMANDES REÇUES"
          value={resume.total ?? 0}
          color="#0F5FB4"
          bgColor="#EFF6FF"
          icon={<HiOutlineInboxStack />}
          onClick={() => navigate('/demandes')}
        />
        <StatCard
          label="EN ATTENTE DE TRAITEMENT"
          value={resume.en_attente ?? 0}
          color="#F28C28"
          bgColor="#FFF7ED"
          icon={<HiOutlineClock />}
          sub={resume.total > 0
            ? `${Math.round(((resume.en_attente ?? 0) / resume.total) * 100)}% du total`
            : '0%'}
          subColor="#F28C28"
          onClick={() => navigate('/demandes?statut=en_attente')}
        />
        <StatCard
          label="EN COURS DE TRAITEMENT"
          value={resume.en_cours ?? 0}
          color="#0A74D1"
          bgColor="#EFF6FF"
          icon={<HiOutlineArrowPath />}
          onClick={() => navigate('/demandes?statut=en_cours')}
        />
        <StatCard
          label="DOCUMENTS PRÊTS"
          value={resume.prete ?? 0}
          color="#27AE60"
          bgColor="#F0FDF4"
          icon={<HiOutlineCheckBadge />}
          sub={resume.total > 0
            ? `${Math.round(((resume.prete ?? 0) / resume.total) * 100)}% Taux`
            : '0% Taux'}
          subColor="#27AE60"
          onClick={() => navigate('/demandes?statut=prete')}
        />
        <StatCard
          label="DEMANDES REFUSÉES"
          value={resume.refusee ?? 0}
          color="#E74C3C"
          bgColor="#FFF1F2"
          icon={<HiOutlineXCircle />}
          sub={resume.total > 0
            ? `${Math.round(((resume.refusee ?? 0) / resume.total) * 100)}% Taux`
            : '0% Taux'}
          subColor="#E74C3C"
          onClick={() => navigate('/demandes?statut=refusee')}
        />
      </div>

      <div style={S.row2}>
        <div style={S.card}>
          <h3 style={S.cardTitle}>Taux de traitement</h3>
          <div style={S.tauxContainer}>
            <div style={S.tauxCircle}>
              <span style={S.tauxValue}>{resume.taux_traitement ?? 0}%</span>
              <span style={S.tauxLabel}>Traité</span>
            </div>
            <div style={S.tauxDetails}>
              <TauxRow label="Validées" value={resume.prete ?? 0} total={resume.total ?? 1} color="#27AE60" />
              <TauxRow label="Refusées" value={resume.refusee ?? 0} total={resume.total ?? 1} color="#E74C3C" />
              <TauxRow label="En cours"
                value={(resume.en_attente ?? 0) + (resume.en_cours ?? 0)}
                total={resume.total ?? 1}
                color="#F28C28"
              />
            </div>
          </div>
        </div>

        <div style={S.card}>
          <h3 style={S.cardTitle}>Performance</h3>
          <div style={S.perfGrid}>
            <PerfCard
              label="Temps moyen de réponse"
              value={`${perf.temps_reponse_moyen_heures ?? 0}h`}
            />
            <PerfCard
              label="Demandes en retard (+48h)"
              value={perf.demandes_en_retard ?? 0}
              alert={(perf.demandes_en_retard ?? 0) > 0}
            />
          </div>
          {(perf.demandes_en_retard ?? 0) > 0 && (
            <div style={S.alertBox}>
              <span>{perf.demandes_en_retard} demande(s) en attente depuis plus de 48h</span>
              <button onClick={() => navigate('/demandes?statut=en_attente')} style={S.alertBtn}>
                Voir
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={S.row2}>
        <div style={S.card}>
          <h3 style={S.cardTitle}>Par type de document</h3>
          <div style={S.typeList}>
            {Object.entries(parType).map(([type, count]) => (
              <div key={type} style={S.typeRow}>
                <span style={S.typeLabel}>{TYPE_LABELS[type] || type}</span>
                <div style={S.typeBarContainer}>
                  <div style={{
                    ...S.typeBar,
                    width: resume.total > 0
                      ? `${(count / resume.total) * 100}%` : '0%',
                  }} />
                </div>
                <span style={S.typeCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={S.card}>
          <h3 style={S.cardTitle}>Performance des agents</h3>
          {parAgent.length === 0 ? (
            <div style={S.emptyState}>
              <p style={{ fontSize:'13px', color:'#374151' }}>Aucune donnée disponible</p>
            </div>
          ) : (
            <div style={S.agentList}>
              {parAgent.map((agent, i) => (
                <div key={i} style={S.agentRow}>
                  <div style={S.agentAvatar}>
                    {agent.prenom?.[0]}{agent.nom?.[0]}
                  </div>
                  <div style={S.agentInfo}>
                    <p style={S.agentName}>{agent.prenom} {agent.nom}</p>
                    <p style={S.agentStats}>{agent.total} demandes traitées</p>
                  </div>
                  <div style={{ display:'flex', gap:'8px', fontSize:'12px' }}>
                    <span style={{
                      color:'#27AE60', fontWeight:'600',
                      backgroundColor:'#F0FDF4',
                      padding:'2px 8px', borderRadius:'12px',
                    }}>
                      {agent.prete} ✓
                    </span>
                    <span style={{
                      color:'#E74C3C', fontWeight:'600',
                      backgroundColor:'#FFF1F2',
                      padding:'2px 8px', borderRadius:'12px',
                    }}>
                      {agent.refusee} ✗
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {evolution.length > 0 && (
        <div style={S.card}>
          <h3 style={S.cardTitle}>Évolution des demandes</h3>
          <div style={S.evolutionContainer}>
            {evolution.slice(-14).map((day, i) => (
              <div key={i} style={S.evolutionDay}>
                <div style={S.evolutionBar}>
                  <div style={{
                    ...S.evolutionFill,
                    height: `${Math.max(
                      (day.total / Math.max(...evolution.map(d => d.total))) * 80, 4
                    )}px`,
                  }} />
                </div>
                <span style={S.evolutionDate}>
                  {new Date(day.jour + 'T00:00:00').toLocaleDateString('fr-FR', {
                    day:'2-digit', month:'2-digit',
                  })}
                </span>
                <span style={S.evolutionCount}>{day.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ label, value, color, bgColor, icon, sub, subColor, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ ...S.statCard, cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 6px 20px ${color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <p style={S.statLabel}>{label}</p>
        <div style={{
          width:'42px', height:'42px', borderRadius:'12px',
          backgroundColor: bgColor,
          display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize:'22px', color: color, display:'flex' }}>{icon}</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:'10px', marginTop:'14px' }}>
        <p style={{ ...S.statValue, color }}>{value}</p>
        {sub && (
          <span style={{
            fontSize:'11px', fontWeight:'600', color: subColor || '#374151',
            backgroundColor: (subColor || '#374151') + '18',
            padding:'3px 8px', borderRadius:'20px',
            marginBottom:'4px', whiteSpace:'nowrap',
          }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

function TauxRow({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom:'12px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
        <span style={{ fontSize:'12px', color:'#374151' }}>{label}</span>
        <span style={{ fontSize:'12px', fontWeight:'700', color }}>
          {value} <span style={{ fontWeight:'400', color:'#374151' }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ backgroundColor:'#E2E8F0', borderRadius:'6px', height:'7px' }}>
        <div style={{
          width:`${pct}%`, backgroundColor:color,
          borderRadius:'6px', height:'7px', transition:'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

function PerfCard({ label, value, alert }) {
  return (
    <div style={{
      ...S.perfCard,
      borderColor: alert ? '#FECDD3' : '#E2E8F0',
      backgroundColor: alert ? '#FFF1F2' : '#F5F7FB',
    }}>
      <p style={{
        fontSize:'28px', fontWeight:'800', lineHeight:1,
        color: alert ? '#E74C3C' : '#0F5FB4',
      }}>
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
    width:'40px', height:'40px',
    border:'4px solid #E2E8F0',
    borderTop:'4px solid #0F5FB4',
    borderRadius:'50%',
    animation:'spin 1s linear infinite',
  },

  periodeRow: { display:'flex', gap:'8px', flexWrap:'wrap' },
  periodeBtn: {
    padding:'8px 18px', borderRadius:'20px', fontSize:'13px',
    fontWeight:'500', cursor:'pointer', transition:'all 0.2s',
  },

  cardsRow: {
    display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'16px',
  },
  statCard: {
    backgroundColor:'#fff', borderRadius:'16px', padding:'20px',
    boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #E2E8F0',
    transition:'transform 0.2s, box-shadow 0.2s',
    display:'flex', flexDirection:'column', justifyContent:'space-between',
    minHeight:'110px',
  },
  statValue: { fontSize:'36px', fontWeight:'800', lineHeight:1 },
  statLabel: {
    fontSize:'10px', color:'#374151', fontWeight:'700',
    letterSpacing:'0.8px', textTransform:'uppercase',
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

  tauxContainer: { display:'flex', alignItems:'center', gap:'24px' },
  tauxCircle: {
    width:'100px', height:'100px', borderRadius:'50%',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center',
    flexShrink:0, boxShadow:'0 4px 16px rgba(15,95,180,0.3)',
  },
  tauxValue: { fontSize:'22px', fontWeight:'800', color:'#fff' },
  tauxLabel: { fontSize:'10px', color:'rgba(255,255,255,0.8)', marginTop:'2px' },
  tauxDetails: { flex:1 },

  perfGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  perfCard: {
    border:'1.5px solid', borderRadius:'10px', padding:'16px',
    display:'flex', flexDirection:'column', alignItems:'center', gap:'4px',
    transition:'border-color 0.2s',
  },

  alertBox: {
    marginTop:'12px', backgroundColor:'#FFF1F2',
    border:'1px solid #FECDD3', borderLeft:'3px solid #E74C3C',
    borderRadius:'8px', padding:'10px 14px', fontSize:'12px',
    color:'#991B1B', display:'flex', alignItems:'center', justifyContent:'space-between',
  },
  alertBtn: {
    backgroundColor:'#E74C3C', color:'#fff', border:'none',
    borderRadius:'6px', padding:'4px 12px', fontSize:'11px',
    fontWeight:'600', cursor:'pointer', flexShrink:0, marginLeft:'12px',
  },

  typeList: { display:'flex', flexDirection:'column', gap:'10px' },
  typeRow: { display:'flex', alignItems:'center', gap:'10px' },
  typeLabel: { fontSize:'12px', color:'#374151', width:'170px', flexShrink:0 },
  typeBarContainer: {
    flex:1, backgroundColor:'#E2E8F0',
    borderRadius:'6px', height:'8px', overflow:'hidden',
  },
  typeBar: {
    height:'8px', backgroundColor:'#0F5FB4',
    borderRadius:'6px', transition:'width 0.5s ease',
  },
  typeCount: { fontSize:'13px', fontWeight:'700', color:'#1B263B', width:'30px', textAlign:'right' },

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
    padding:'20px', textAlign:'center',
    backgroundColor:'#F5F7FB', borderRadius:'8px',
  },

  evolutionContainer: {
    display:'flex', alignItems:'flex-end', gap:'8px',
    overflowX:'auto', paddingBottom:'8px',
  },
  evolutionDay: {
    display:'flex', flexDirection:'column',
    alignItems:'center', gap:'4px', minWidth:'40px',
  },
  evolutionBar: {
    width:'28px', height:'80px', backgroundColor:'#E2E8F0',
    borderRadius:'4px', display:'flex', alignItems:'flex-end', overflow:'hidden',
  },
  evolutionFill: {
    width:'100%', backgroundColor:'#0F5FB4',
    borderRadius:'4px', transition:'height 0.5s',
  },
  evolutionDate: { fontSize:'10px', color:'#374151' },
  evolutionCount: { fontSize:'11px', fontWeight:'700', color:'#1B263B' },
};