import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { demandeService } from '../../services/api';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineXMark,
  HiOutlineInbox,
  HiOutlineCheckCircle,
  HiOutlineFolderOpen,
  HiOutlineChevronRight,
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
  attestation_inscription: 'Attestation inscription',
  certificat_scolarite:    'Certificat scolarité',
  releve_notes:            'Relevé de notes',
  diplome_deust:           'Diplôme DEUST',
  retrait_bac:             'Retrait bac',
};

export default function ListeDemandes() {
  const [demandes, setDemandes]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statut, setStatut]         = useState('');
  const [type, setType]             = useState('');
  const [page, setPage]             = useState(1);
  const [meta, setMeta]             = useState({});
  const [selected, setSelected]     = useState(null);
  const navigate                    = useNavigate();
  const [searchParams]              = useSearchParams();

  useEffect(() => {
    const s = searchParams.get('statut');
    if (s) setStatut(s);
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

  return (
    <div style={S.container}>

      <div style={S.toolbar}>
        <div style={S.statutRow}>
          {STATUTS.map(s => (
            <button key={s.key}
              onClick={() => { setStatut(s.key); setPage(1); setSelected(null); }}
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

      <p style={S.compteur}>{meta.total ?? 0} demande(s) trouvée(s)</p>

      <div style={S.splitView}>

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
                    const ss         = STATUT_STYLES[d.statut] || {};
                    const isSelected = selected?.id === d.id;
                    return (
                      <tr key={d.id}
                        onClick={() => setSelected(isSelected ? null : d)}
                        style={{
                          ...S.tr,
                          backgroundColor: isSelected
                            ? '#EFF6FF'
                            : i % 2 === 0 ? '#fff' : '#F5F7FB',
                          borderLeft: isSelected
                            ? '3px solid #0F5FB4'
                            : '3px solid transparent',
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
                            onClick={e => { e.stopPropagation(); navigate(`/demandes/${d.id}`); }}
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

        {selected && (
          <div style={S.detailPanel}>

            <div style={S.panelHeader}>
              <div>
                <p style={S.panelTitle}>Console d'évaluation du dossier</p>
                <p style={S.panelRef}>REQ-{String(selected.id).padStart(4,'0')}</p>
              </div>
              <button onClick={() => setSelected(null)} style={S.closePanel}>
                <HiOutlineXMark style={{ fontSize:'16px' }} />
              </button>
            </div>

            <div style={S.panelSection}>
              <div style={S.panelEtudiant}>
                <div style={S.panelAvatar}>
                  {selected.prenom?.[0]}{selected.nom?.[0]}
                </div>
                <div>
                  <p style={S.panelEtudiantName}>
                    {selected.prenom?.toUpperCase()} {selected.nom?.toUpperCase()}
                  </p>
                  <p style={S.panelEtudiantSub}>Apogée : {selected.code_apogee}</p>
                  <p style={S.panelEtudiantSub}>CNE : {selected.cne}</p>
                  <p style={S.panelEtudiantSub}>{selected.email}</p>
                </div>
              </div>
            </div>

            <div style={S.panelDivider} />

            <div style={S.panelSection}>
              <div style={S.panelGrid}>
                <div>
                  <p style={S.panelLabel}>Type de document</p>
                  <p style={S.panelValue}>{TYPE_LABELS[selected.type_document]}</p>
                </div>
                {selected.semestre && (
                  <div>
                    <p style={S.panelLabel}>Semestre</p>
                    <p style={S.panelValue}>Semestre {selected.semestre}</p>
                  </div>
                )}
                {selected.type_retrait && (
                  <div>
                    <p style={S.panelLabel}>Type retrait</p>
                    <p style={S.panelValue}>{selected.type_retrait}</p>
                  </div>
                )}
                <div>
                  <p style={S.panelLabel}>Date de dépôt</p>
                  <p style={S.panelValue}>
                    {new Date(selected.date_creation).toLocaleDateString('fr-FR', {
                      day:'2-digit', month:'long', year:'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div style={S.panelDivider} />

            <div style={S.panelSection}>
              <p style={S.panelLabel}>STATUT ACTUEL</p>
              <div style={{ marginTop:'8px' }}>
                {(() => {
                  const ss = STATUT_STYLES[selected.statut] || {};
                  return (
                    <span style={{
                      ...S.statutBadge,
                      backgroundColor: ss.bg, color: ss.color,
                      fontSize:'13px', padding:'6px 16px',
                    }}>
                      {ss.label}
                    </span>
                  );
                })()}
              </div>

              <div style={{ marginTop:'16px' }}>
                {[
                  { label:'Soumis', done:true,
                    date: new Date(selected.date_creation).toLocaleDateString('fr-FR'),
                    color:'#0F5FB4' },
                  { label:'Pris en charge',
                    done:['en_cours','prete','refusee'].includes(selected.statut),
                    color:'#0A74D1' },
                  { label:'Document prêt',
                    done: selected.statut === 'prete', color:'#27AE60' },
                  { label:'Refusé',
                    done: selected.statut === 'refusee', color:'#E74C3C' },
                ].map((step, i) => (
                  <div key={i} style={{
                    display:'flex', gap:'10px',
                    marginBottom:'10px', alignItems:'flex-start',
                  }}>
                    <div style={{
                      width:'18px', height:'18px', borderRadius:'50%',
                      flexShrink:0, marginTop:'1px',
                      backgroundColor: step.done ? step.color : '#E2E8F0',
                      border: `2px solid ${step.done ? step.color : '#E2E8F0'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {step.done && (
                        <HiOutlineCheckCircle
                          style={{ fontSize:'11px', color:'#fff', strokeWidth:3 }}
                        />
                      )}
                    </div>
                    <div>
                      <p style={{
                        fontSize:'12px',
                        fontWeight: step.done ? '600' : '400',
                        color: step.done ? '#1B263B' : '#CBD5E1',
                      }}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p style={{ fontSize:'10px', color:'#374151' }}>{step.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selected.traite_par && (
              <>
                <div style={S.panelDivider} />
                <div style={S.panelSection}>
                  <p style={S.panelLabel}>TRAITEMENT</p>
                  <div style={S.panelGrid}>
                    <div>
                      <p style={S.panelLabel}>Traité par</p>
                      <p style={S.panelValue}>
                        {selected.traite_par?.prenom} {selected.traite_par?.nom}
                      </p>
                    </div>
                    {selected.date_traitement && (
                      <div>
                        <p style={S.panelLabel}>Date traitement</p>
                        <p style={S.panelValue}>
                          {new Date(selected.date_traitement).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                  </div>
                  {selected.motif_refus && (
                    <div style={S.motifBox}>
                      <p style={S.panelLabel}>Motif de refus</p>
                      <p style={{ fontSize:'13px', color:'#E74C3C', marginTop:'4px', lineHeight:'1.5' }}>
                        {selected.motif_refus}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

           

            <div style={S.panelDivider} />

            <div style={{ padding:'16px' }}>
              <button
                onClick={() => navigate(`/demandes/${selected.id}`)}
                style={S.fullTraitBtn}
              >
                <HiOutlineFolderOpen style={{ fontSize:'16px' }} />
                <span>Ouvrir le dossier complet</span>
                <HiOutlineChevronRight style={{ fontSize:'14px', marginLeft:'auto' }} />
              </button>
            </div>

          </div>
        )}

        {!selected && (
          <div style={S.placeholderPanel}>
            <div style={S.placeholderIconWrapper}>
              <HiOutlineFolderOpen style={{ fontSize:'30px', color:'#0F5FB4' }} />
            </div>
            <p style={{ fontSize:'13px', color:'#374151', fontWeight:'600', marginTop:'12px' }}>
              Sélectionnez un dossier
            </p>
            <p style={{ fontSize:'11px', color:'#CBD5E1', marginTop:'4px', textAlign:'center' }}>
              Cliquez sur une ligne pour voir les détails
            </p>
          </div>
        )}

      </div>
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
  splitView: {
    display:'flex', flex:1, overflow:'hidden',
    borderRadius:'12px', border:'1px solid #E2E8F0',
    boxShadow:'0 1px 6px rgba(15,95,180,0.08)',
    position:'relative',
  },
  tableSection: {
    flex:1, display:'flex', flexDirection:'column',
    overflow:'hidden', backgroundColor:'#fff', minWidth:0,
  },
  tableContainer: { flex:1, overflowY:'auto' },
  table:  { width:'100%', borderCollapse:'collapse' },
  thead:  { backgroundColor:'#0A2D6A', position:'sticky', top:0 },
  th: {
    padding:'11px 14px', textAlign:'left', fontSize:'10px',
    fontWeight:'700', color:'rgba(255,255,255,0.65)',
    letterSpacing:'1px', textTransform:'uppercase',
  },
  tr: { cursor:'pointer', transition:'all 0.15s', borderBottom:'1px solid #E2E8F0' },
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
  detailPanel: {
    width:'380px', minWidth:'380px', maxWidth:'380px',
    backgroundColor:'#fff', borderLeft:'1px solid #E2E8F0',
    overflowY:'auto', display:'flex', flexDirection:'column', flexShrink:0,
  },
  panelHeader: {
    padding:'16px 20px',
    background:'linear-gradient(135deg, #0A2D6A, #0F5FB4)',
    display:'flex', alignItems:'center', justifyContent:'space-between',
    flexShrink:0,
  },
  panelTitle: {
    fontSize:'10px', fontWeight:'700',
    color:'rgba(255,255,255,0.6)',
    textTransform:'uppercase', letterSpacing:'1px',
  },
  panelRef: {
    fontSize:'15px', fontWeight:'800', color:'#FFD23F',
    marginTop:'3px', fontFamily:'monospace',
  },
  closePanel: {
    backgroundColor:'rgba(255,255,255,0.1)', border:'none',
    color:'rgba(255,255,255,0.8)', fontSize:'14px',
    cursor:'pointer', padding:'6px', borderRadius:'6px',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  panelSection: { padding:'14px 18px' },
  panelDivider: { height:'1px', backgroundColor:'#E2E8F0', flexShrink:0 },
  panelEtudiant: { display:'flex', gap:'14px', alignItems:'center' },
  panelAvatar: {
    width:'46px', height:'46px', borderRadius:'50%',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'15px', fontWeight:'700', textTransform:'uppercase', flexShrink:0,
    boxShadow:'0 2px 8px rgba(15,95,180,0.3)',
  },
  panelEtudiantName: {
    fontSize:'14px', fontWeight:'800', color:'#1B263B', letterSpacing:'0.3px',
  },
  panelEtudiantSub: { fontSize:'11px', color:'#374151', marginTop:'2px' },
  panelGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'4px' },
  panelLabel: {
    fontSize:'9px', fontWeight:'700', color:'#CBD5E1',
    textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'3px',
  },
  panelValue: { fontSize:'13px', fontWeight:'600', color:'#1B263B' },
  motifBox: {
    marginTop:'10px', backgroundColor:'#FFF1F2',
    borderLeft:'3px solid #E74C3C',
    padding:'10px 12px', borderRadius:'0 6px 6px 0',
  },
  fullTraitBtn: {
    width:'100%', padding:'12px 14px',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', border:'none', borderRadius:'8px',
    fontSize:'13px', fontWeight:'700', cursor:'pointer',
    letterSpacing:'0.3px',
    boxShadow:'0 3px 10px rgba(15,95,180,0.25)',
    display:'flex', alignItems:'center', gap:'8px',
  },
  placeholderPanel: {
    width:'280px', minWidth:'280px', maxWidth:'280px',
    backgroundColor:'#F5F7FB', borderLeft:'1px solid #E2E8F0',
    display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center', flexShrink:0,
  },
  placeholderIconWrapper: {
    width:'60px', height:'60px', borderRadius:'50%',
    backgroundColor:'#EFF6FF', border:'2px solid #BFDBFE',
    display:'flex', alignItems:'center', justifyContent:'center',
  },
  emptyBox: {
    flex:1, display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center',
    padding:'40px', textAlign:'center',
  },
};