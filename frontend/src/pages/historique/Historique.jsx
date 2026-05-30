import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { etudiantService } from '../../services/api';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineExclamationCircle,
  HiOutlineFolderOpen,
  HiOutlineInbox,
} from 'react-icons/hi2';

const STATUT_STYLES = {
  en_attente: { bg: '#FFF7ED', color: '#F28C28', label: 'En attente' },
  en_cours:   { bg: '#EFF6FF', color: '#0A74D1', label: 'En cours' },
  prete:      { bg: '#F0FDF4', color: '#27AE60', label: 'Prête' },
  refusee:    { bg: '#FFF1F2', color: '#E74C3C', label: 'Refusée' },
};

const TYPE_LABELS = {
  attestation_inscription: 'Attestation inscription',
  certificat_scolarite:    'Certificat scolarité',
  releve_notes:            'Relevé de notes',
  diplome_deust:           'Diplôme DEUST',
  retrait_bac:             'Retrait bac',
};

export default function Historique() {
  const [cne, setCne]           = useState('');
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!cne.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    setSearched(true);
    try {
      const res = await etudiantService.historique(cne.trim());
      setData(res.data);
    } catch {
      setError('Erreur lors de la recherche. Vérifiez le CNE saisi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.container}>

      {/* ── Barre de recherche ── */}
      <div style={S.searchCard}>
        <div style={S.searchCardLeft}>
          <h3 style={S.searchTitle}>Recherche par CNE</h3>
          <form onSubmit={handleSearch} style={S.searchForm}>
          <input
            type="text"
            value={cne}
            onChange={e => setCne(e.target.value)}
            placeholder="Ex : R123456789"
            style={S.searchInput}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !cne.trim()}
            style={{ ...S.searchBtn, opacity: loading || !cne.trim() ? 0.6 : 1 }}
          >
            <HiOutlineMagnifyingGlass style={{ fontSize:'16px', flexShrink:0 }} />
            <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
          </button>
        </form>
        </div>
        
      </div>

      {/* ── Erreur ── */}
      {error && (
        <div style={S.errorBox}>
          <HiOutlineExclamationCircle style={{ fontSize:'18px', flexShrink:0 }} />
          <span><span style={{ fontWeight:'600' }}>Erreur —</span> {error}</span>
        </div>
      )}

      {/* ── Résultats ── */}
      {data && (
        <>
          {data.historique && data.historique.length > 0 ? (
            <>
              {/* Carte étudiant */}
              <div style={S.etudiantCard}>
                <div style={S.etudiantLeft}>
                  <div style={S.avatar}>
                    {data.etudiant?.prenom?.[0]}{data.etudiant?.nom?.[0]}
                  </div>
                  <div>
                    <p style={S.etudiantName}>
                      {data.etudiant?.prenom} {data.etudiant?.nom}
                    </p>
                    <p style={S.etudiantMeta}>CNE : {data.cne}</p>
                    {data.etudiant?.code_apogee && (
                      <p style={S.etudiantMeta}>Apogée : {data.etudiant.code_apogee}</p>
                    )}
                  </div>
                </div>

                {/* Résumé chiffré */}
                <div style={S.resumeRow}>
                  <ResumeItem label="Total"      value={data.resume?.total      ?? 0} color="#0F5FB4" />
                  <ResumeItem label="En attente" value={data.resume?.en_attente ?? 0} color="#F28C28" />
                  <ResumeItem label="Prêtes"     value={data.resume?.prete      ?? 0} color="#27AE60" />
                  <ResumeItem label="Refusées"   value={data.resume?.refusee    ?? 0} color="#E74C3C" />
                </div>
              </div>

              {/* Tableau */}
              <div style={S.tableContainer}>
                <table style={S.table}>
                  <thead>
                    <tr style={S.thead}>
                      <th style={S.th}>DOSSIER</th>
                      <th style={S.th}>TYPE DE DOCUMENT</th>
                      <th style={S.th}>DATE</th>
                      <th style={S.th}>STATUT</th>
                      <th style={S.th}>TRAITÉ PAR</th>
                      <th style={S.th}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.historique.map((d, i) => {
                      const ss = STATUT_STYLES[d.statut] || {};
                      return (
                        <tr key={d.id} style={{
                          backgroundColor: i % 2 === 0 ? '#fff' : '#F5F7FB',
                          borderBottom: '1px solid #E2E8F0',
                        }}>
                          <td style={S.td}>
                            <span style={S.refBadge}>
                              REQ-{String(d.id).padStart(4,'0')}
                            </span>
                          </td>
                          <td style={S.td}>
                            <p style={{ fontSize:'13px', fontWeight:'600', color:'#1B263B' }}>
                              {TYPE_LABELS[d.type_document] || d.type_document}
                            </p>
                            {d.semestre && (
                              <span style={S.semestreBadge}>Semestre {d.semestre}</span>
                            )}
                          </td>
                          <td style={S.td}>
                            <span style={{ fontSize:'12px', color:'#374151' }}>
                              {new Date(d.date_creation).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                          <td style={S.td}>
                            <span style={{
                              padding:'4px 10px', borderRadius:'20px',
                              fontSize:'11px', fontWeight:'600',
                              backgroundColor: ss.bg, color: ss.color,
                            }}>
                              {ss.label}
                            </span>
                          </td>
                          <td style={S.td}>
                            {d.traite_par ? (
                              <span style={{ fontSize:'12px', color:'#374151' }}>
                                {d.traite_par.prenom} {d.traite_par.nom}
                              </span>
                            ) : (
                              <span style={{ fontSize:'12px', color:'#CBD5E1' }}>—</span>
                            )}
                          </td>
                          <td style={S.td}>
                            <button
                              onClick={() => navigate(`/demandes/${d.id}`)}
                              style={S.viewBtn}
                            >
                              <HiOutlineFolderOpen style={{ fontSize:'14px' }} />
                              <span>Ouvrir</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={S.emptyBox}>
              <HiOutlineInbox style={{ fontSize:'40px', color:'#CBD5E1' }} />
              <p style={{ fontSize:'13px', color:'#374151', fontWeight:'500', marginTop:'12px' }}>
                Aucune demande trouvée pour le CNE <strong>{data.cne}</strong>
              </p>
            </div>
          )}
        </>
      )}

      {/* ── État initial ── */}
      {!searched && !loading && (
        <div style={S.initialBox}>
          <div style={S.initialIconWrapper}>
            <HiOutlineMagnifyingGlass style={{ fontSize:'28px', color:'#0F5FB4' }} />
          </div>
          <p style={{ color:'#1B263B', fontSize:'14px', fontWeight:'600', marginTop:'16px' }}>
            Recherche par CNE
          </p>
          <p style={{ color:'#374151', marginTop:'6px', fontSize:'13px', lineHeight:'1.5' }}>
            Saisissez le CNE d'un étudiant pour accéder à l'historique de ses demandes
          </p>
        </div>
      )}

    </div>
  );
}

function ResumeItem({ label, value, color }) {
  return (
    <div style={{
      textAlign:'center', padding:'12px 20px',
      borderLeft:'1px solid #E2E8F0',
    }}>
      <p style={{ fontSize:'26px', fontWeight:'800', color }}>{value}</p>
      <p style={{
        fontSize:'10px', color:'#374151', marginTop:'4px',
        textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:'600',
      }}>
        {label}
      </p>
    </div>
  );
}

const S = {
  container: { display:'flex', flexDirection:'column', gap:'20px' },

  searchCard: {
    backgroundColor:'#fff', borderRadius:'12px', padding:'24px 28px',
    boxShadow:'0 1px 6px rgba(15,95,180,0.08)', border:'1px solid #E2E8F0',
    display:'flex', alignItems:'flex-end', justifyContent:'space-between',
    gap:'24px', flexWrap:'wrap',
  },
  searchCardLeft: { flex:1, minWidth:'200px' },
  searchTitle: { fontSize:'15px', fontWeight:'700', color:'#1B263B', marginBottom:'4px' },
  searchSubtitle: { fontSize:'13px', color:'#374151', lineHeight:'1.5' },
  searchForm: { display:'flex', gap:'10px', flexShrink:0, minWidth:'340px' },
  searchInput: {
    flex:1, padding:'11px 16px', borderRadius:'8px',
    border:'1.5px solid #E2E8F0', fontSize:'14px',
    outline:'none', color:'#1B263B', backgroundColor:'#F5F7FB',
  },
  searchBtn: {
    padding:'11px 20px',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', border:'none', borderRadius:'8px',
    fontSize:'14px', fontWeight:'600', cursor:'pointer',
    whiteSpace:'nowrap',
    boxShadow:'0 2px 8px rgba(15,95,180,0.25)',
    display:'flex', alignItems:'center', gap:'8px',
  },

  errorBox: {
    backgroundColor:'#FFF1F2', border:'1px solid #FECDD3',
    borderLeft:'3px solid #E74C3C',
    borderRadius:'0 8px 8px 0', padding:'12px 16px',
    color:'#991B1B', fontSize:'13px',
    display:'flex', alignItems:'center', gap:'8px',
  },

  etudiantCard: {
    backgroundColor:'#fff', borderRadius:'12px', padding:'20px',
    boxShadow:'0 1px 6px rgba(15,95,180,0.08)', border:'1px solid #E2E8F0',
    display:'flex', alignItems:'center', justifyContent:'space-between',
    flexWrap:'wrap', gap:'16px',
  },
  etudiantLeft: { display:'flex', alignItems:'center', gap:'16px' },
  avatar: {
    width:'52px', height:'52px', borderRadius:'50%',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'18px', fontWeight:'700', textTransform:'uppercase', flexShrink:0,
    boxShadow:'0 3px 10px rgba(15,95,180,0.3)',
  },
  etudiantName: { fontSize:'17px', fontWeight:'800', color:'#1B263B' },
  etudiantMeta: { fontSize:'12px', color:'#374151', marginTop:'3px' },
  resumeRow: { display:'flex' },

  tableContainer: {
    backgroundColor:'#fff', borderRadius:'12px',
    border:'1px solid #E2E8F0', overflow:'hidden',
    boxShadow:'0 1px 6px rgba(15,95,180,0.06)',
  },
  table: { width:'100%', borderCollapse:'collapse' },
  thead: { backgroundColor:'#0A2D6A' },
  th: {
    padding:'12px 16px', textAlign:'left', fontSize:'10px',
    fontWeight:'700', color:'rgba(255,255,255,0.65)',
    letterSpacing:'1px', textTransform:'uppercase',
  },
  td: { padding:'12px 16px', fontSize:'13px', verticalAlign:'middle' },

  refBadge: {
    fontSize:'11px', fontWeight:'700', color:'#0F5FB4',
    fontFamily:'monospace', letterSpacing:'0.5px',
  },
  semestreBadge: {
    fontSize:'10px', backgroundColor:'#EFF6FF', color:'#0F5FB4',
    padding:'2px 7px', borderRadius:'4px',
    display:'inline-block', marginTop:'3px',
  },
  viewBtn: {
    padding:'6px 12px',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', border:'none', borderRadius:'6px',
    fontSize:'11px', fontWeight:'600', cursor:'pointer',
    display:'flex', alignItems:'center', gap:'5px',
  },

  emptyBox: {
    backgroundColor:'#fff', borderRadius:'12px', padding:'50px',
    textAlign:'center', border:'1px solid #E2E8F0',
    display:'flex', flexDirection:'column', alignItems:'center',
  },
  initialBox: {
    backgroundColor:'#fff', borderRadius:'12px', padding:'70px 40px',
    textAlign:'center', border:'1px dashed #E2E8F0',
    display:'flex', flexDirection:'column', alignItems:'center',
  },
  initialIconWrapper: {
    width:'64px', height:'64px', borderRadius:'50%',
    backgroundColor:'#EFF6FF', border:'2px solid #BFDBFE',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
};