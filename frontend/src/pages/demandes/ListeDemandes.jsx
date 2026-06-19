import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { demandeService } from '../../services/api';
import DetailDemande from './DetailDemande';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineXMark,
  HiOutlineInbox,
  HiOutlineChevronRight,
  HiOutlineArrowPath,
} from 'react-icons/hi2';

const STATUTS = [
  { key: '',           label: 'Tous' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'en_cours',   label: 'En cours' },
  { key: 'prete',      label: 'Prête' },
  { key: 'refusee',    label: 'Refusée' },
];

const TYPES = [
  { key: '',                        label: 'Tous les types' },
  { key: 'attestation_inscription', label: 'Attestation inscription' },
  { key: 'certificat_scolarite',    label: 'Certificat scolarité' },
  { key: 'releve_notes',            label: 'Relevé de notes' },
  { key: 'attestation_reussite',    label: 'Attestation de réussite' },
  { key: 'diplome_deust',           label: 'Diplôme DEUST' },
  { key: 'retrait_bac',             label: 'Retrait bac' },
];

const STATUT_STYLES = {
  en_attente: { bg: '#FFF7ED', color: '#F28C28', label: 'En attente' },
  en_cours:   { bg: '#EFF6FF', color: '#0A74D1', label: 'En cours' },
  prete:      { bg: '#F0FDF4', color: '#27AE60', label: 'Prête' },
  refusee:    { bg: '#FFF1F2', color: '#E74C3C', label: 'Refusée' },
};

const TYPE_LABELS = {
  attestation_inscription: "Attestation d'inscription",
  certificat_scolarite:    'Certificat de scolarité',
  releve_notes:            'Relevé de notes',
  attestation_reussite:    'Attestation de réussite',
  diplome_deust:           'Diplôme DEUST',
  retrait_bac:             'Retrait bac',
};

export default function ListeDemandes() {
  const [demandes, setDemandes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statut, setStatut]       = useState('');
  const [type, setType]           = useState('');
  const [page, setPage]           = useState(1);
  const [meta, setMeta]           = useState({});
  const [modalId, setModalId]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate                  = useNavigate();
  const [searchParams]            = useSearchParams();

  useEffect(() => {
    const s = searchParams.get('statut');
    if (s) setStatut(s);

    const open = searchParams.get('open');
    if (open) setModalId(Number(open));
  }, []);

  useEffect(() => { fetchDemandes(); }, [statut, type, page]);

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (statut) params.statut        = statut;
      if (type)   params.type_document = type;
      if (search) params.search        = search;
      const res = await demandeService.getAll(params);
      setDemandes(res.data.data);
      setMeta({
        total:       res.data.total,
        lastPage:    res.data.last_page,
        currentPage: res.data.current_page,
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchDemandes(); };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDemandes();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div style={S.container}>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .spinning { animation: spin 0.6s linear; }
      `}</style>

      <div style={S.toolbar}>
        <div style={S.statutRow}>
          {STATUTS.map(s => (
            <button key={s.key}
              onClick={() => { setStatut(s.key); setPage(1); }}
              style={{
                ...S.statutBtn,
                backgroundColor: statut === s.key ? '#0F5FB4' : '#fff',
                color:           statut === s.key ? '#fff'    : '#374151',
                border:          statut === s.key
                  ? '1.5px solid #0F5FB4' : '1.5px solid #E2E8F0',
                boxShadow: statut === s.key
                  ? '0 2px 6px rgba(15,95,180,0.2)' : 'none',
              }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={S.rightToolbar}>
          <form onSubmit={handleSearch} style={S.searchForm}>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher étudiant, Apogée, ID..."
              style={S.searchInput}
            />
            <button type="submit" style={S.searchBtn}>
              <HiOutlineMagnifyingGlass style={{ fontSize:'15px' }} />
              <span>Rechercher</span>
            </button>
          </form>
          <select
            value={type}
            onChange={e => { setType(e.target.value); setPage(1); }}
            style={S.select}
          >
            {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Compteur + bouton actualiser */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <p style={S.compteur}>{meta.total ?? 0} demande(s) trouvée(s)</p>
        <button
          onClick={handleRefresh}
          style={S.refreshBtn}
          title="Actualiser"
          className={refreshing ? 'spinning' : ''}
        >
          <HiOutlineArrowPath style={{ fontSize:'16px' }} />
        </button>
      </div>

      <div style={S.tableWrapper}>
        <div style={S.tableSection}>
          {loading ? (
            <div style={S.emptyBox}>
              <p style={{ color:'#374151', fontSize:'13px' }}>Chargement...</p>
            </div>
          ) : demandes.length === 0 ? (
            <div style={S.emptyBox}>
              <HiOutlineInbox style={{ fontSize:'40px', color:'#CBD5E1' }} />
              <p style={{ fontSize:'13px', color:'#374151', marginTop:'10px' }}>
                Aucune demande trouvée
              </p>
            </div>
          ) : (
            <div style={S.tableContainer}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thead}>
                    <th style={S.th}>DOSSIER ID</th>
                    <th style={S.th}>ÉTUDIANT</th>
                    <th style={S.th}>DEMANDE</th>
                    <th style={S.th}>DÉPÔT</th>
                    <th style={S.th}>STATUT</th>
                    <th style={S.th}>DÉTAILS</th>
                  </tr>
                </thead>
                <tbody>
                  {demandes.map((d, i) => {
                    const ss = STATUT_STYLES[d.statut] || {};
                    return (
                      <tr key={d.id}
                        onClick={() => setModalId(d.id)}
                        style={{
                          ...S.tr,
                          backgroundColor: i % 2 === 0 ? '#fff' : '#F5F7FB',
                        }}
                      >
                        <td style={S.td}>
                          <span style={S.refBadge}>
                            REQ-{String(d.id).padStart(4,'0')}
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <div style={S.avatar}>{d.prenom?.[0]}{d.nom?.[0]}</div>
                            <div>
                              <p style={{ fontSize:'13px', fontWeight:'600', color:'#1B263B' }}>
                                {d.prenom} {d.nom}
                              </p>
                              <p style={{ fontSize:'10px', color:'#374151', marginTop:'1px' }}>
                                Apogée : {d.code_apogee}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}>
                          <p style={{ fontSize:'13px', fontWeight:'500', color:'#1B263B' }}>
                            {TYPE_LABELS[d.type_document]}
                          </p>
                          {d.semestre && (
                            <span style={S.semestreBadge}>Semestre S{d.semestre}</span>
                          )}
                          {d.type_retrait && (
                            <span style={S.semestreBadge}>{d.type_retrait}</span>
                          )}
                        </td>
                        <td style={S.td}>
                          <span style={{ fontSize:'12px', color:'#374151' }}>
                            {new Date(d.date_creation).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td style={S.td}>
                          <span style={{
                            ...S.statutBadge,
                            backgroundColor: ss.bg,
                            color: ss.color,
                          }}>
                            {ss.label}
                          </span>
                        </td>
                        <td style={S.td}>
                          <button
                            onClick={e => { e.stopPropagation(); setModalId(d.id); }}
                            style={S.traitBtn}
                          >
                            <span>Traiter</span>
                            <HiOutlineChevronRight style={{ fontSize:'13px' }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {meta.lastPage > 1 && (
            <div style={S.pagination}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ ...S.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
              >
                <HiOutlineArrowLeft style={{ fontSize:'14px' }} />
                <span>Précédent</span>
              </button>
              <span style={{ fontSize:'12px', color:'#374151', fontWeight:'500' }}>
                Page {page} / {meta.lastPage}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))}
                disabled={page === meta.lastPage}
                style={{ ...S.pageBtn, opacity: page === meta.lastPage ? 0.4 : 1 }}
              >
                <span>Suivant</span>
                <HiOutlineArrowRight style={{ fontSize:'14px' }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal DetailDemande ── */}
      {modalId && (
        <div style={S.modalOverlay} onClick={() => setModalId(null)}>
          <div style={S.modalContainer} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalId(null)} style={S.modalClose}>
              <HiOutlineXMark style={{ fontSize:'18px' }} />
            </button>
            <div style={S.modalBody}>
              <DetailDemande
                modalId={modalId}
                onClose={() => { setModalId(null); fetchDemandes(); }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const S = {
  container: {
    display:'flex', flexDirection:'column', gap:'12px',
    height:'calc(100vh - 130px)',
  },
  toolbar: {
    display:'flex', alignItems:'center',
    justifyContent:'space-between', gap:'12px', flexWrap:'wrap',
  },
  statutRow: { display:'flex', gap:'6px', flexWrap:'wrap' },
  statutBtn: {
    padding:'7px 16px', borderRadius:'20px', fontSize:'12px',
    fontWeight:'500', cursor:'pointer', transition:'all 0.2s',
  },
  rightToolbar: { display:'flex', gap:'8px' },
  searchForm:   { display:'flex', gap:'6px' },
  searchInput: {
    padding:'8px 14px', borderRadius:'8px', border:'1.5px solid #E2E8F0',
    fontSize:'13px', outline:'none', color:'#1B263B', width:'240px',
    backgroundColor:'#fff',
  },
  searchBtn: {
    padding:'8px 18px', backgroundColor:'#0F5FB4', color:'#fff',
    border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:'600',
    cursor:'pointer', display:'flex', alignItems:'center', gap:'6px',
  },
  select: {
    padding:'8px 12px', borderRadius:'8px', border:'1.5px solid #E2E8F0',
    fontSize:'12px', color:'#374151', backgroundColor:'#fff', outline:'none',
  },
  compteur: { fontSize:'12px', color:'#374151', fontWeight:'500' },
  refreshBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '1.5px solid #E2E8F0',
    backgroundColor: '#fff',
    color: '#0F5FB4',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 1px 4px rgba(15,95,180,0.08)',
    flexShrink: 0,
  },
  tableWrapper: {
    display:'flex', flex:1, overflow:'hidden',
    borderRadius:'12px', border:'1px solid #E2E8F0',
    boxShadow:'0 1px 6px rgba(15,95,180,0.08)',
  },
  tableSection: {
    flex:1, display:'flex', flexDirection:'column',
    overflow:'hidden', backgroundColor:'#fff',
  },
  tableContainer: { flex:1, overflowY:'auto' },
  table:  { width:'100%', borderCollapse:'collapse' },
  thead:  { backgroundColor:'#0A2D6A', position:'sticky', top:0 },
  th: {
    padding:'11px 14px', textAlign:'left', fontSize:'10px',
    fontWeight:'700', color:'rgba(255,255,255,0.65)',
    letterSpacing:'1px', textTransform:'uppercase',
  },
  tr: {
    cursor:'pointer', transition:'all 0.15s',
    borderBottom:'1px solid #E2E8F0',
  },
  td: { padding:'12px 14px', fontSize:'13px', verticalAlign:'middle' },
  refBadge: {
    fontSize:'11px', fontWeight:'700', color:'#0F5FB4',
    fontFamily:'monospace', letterSpacing:'0.5px',
  },
  avatar: {
    width:'32px', height:'32px', borderRadius:'50%',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'11px', fontWeight:'700', textTransform:'uppercase', flexShrink:0,
  },
  semestreBadge: {
    fontSize:'10px', backgroundColor:'#EFF6FF', color:'#0F5FB4',
    padding:'2px 7px', borderRadius:'4px',
    display:'inline-block', marginTop:'3px',
  },
  statutBadge: {
    padding:'4px 10px', borderRadius:'20px',
    fontSize:'11px', fontWeight:'600', whiteSpace:'nowrap',
  },
  traitBtn: {
    padding:'5px 12px', backgroundColor:'transparent',
    border:'1px solid #0F5FB4', color:'#0F5FB4',
    borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer',
    transition:'all 0.2s', display:'flex', alignItems:'center', gap:'4px',
  },
  pagination: {
    display:'flex', alignItems:'center', justifyContent:'center',
    gap:'16px', padding:'12px', borderTop:'1px solid #E2E8F0',
  },
  pageBtn: {
    padding:'6px 14px', backgroundColor:'#fff',
    border:'1.5px solid #E2E8F0', borderRadius:'8px',
    fontSize:'12px', cursor:'pointer', color:'#374151', fontWeight:'500',
    display:'flex', alignItems:'center', gap:'6px',
  },
  emptyBox: {
    flex:1, display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center',
    padding:'40px', textAlign:'center',
  },
  modalOverlay: {
    position:'fixed', inset:0,
    backgroundColor:'rgba(10,45,106,0.55)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:1000,
    backdropFilter:'blur(3px)',
  },
  modalContainer: {
    position:'relative',
    backgroundColor:'#F5F7FB',
    borderRadius:'16px',
    width:'90vw',
    maxWidth:'1100px',
    maxHeight:'90vh',
    overflowY:'auto',
    boxShadow:'0 24px 60px rgba(10,45,106,0.25)',
  },
  modalClose: {
    position:'sticky',
    top:'12px',
    float:'right',
    marginRight:'12px',
    marginTop:'12px',
    zIndex:10,
    backgroundColor:'#fff',
    border:'1px solid #E2E8F0',
    borderRadius:'8px',
    padding:'6px',
    cursor:'pointer',
    color:'#374151',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    boxShadow:'0 2px 6px rgba(0,0,0,0.08)',
  },
  modalBody: {
    padding:'24px',
    clear:'both',
  },
};