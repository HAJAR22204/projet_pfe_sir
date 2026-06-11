import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { demandeService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

export default function DetailDemande({ modalId, onClose }) {
  const params    = useParams();
  const id        = modalId ?? params.id;
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const [demande, setDemande]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRefusModal, setShowRefusModal] = useState(false);
  const [motifRefus, setMotifRefus]     = useState('');
  const [message, setMessage]           = useState(null);

  useEffect(() => { fetchDemande(); }, [id]);

  const fetchDemande = async () => {
    setLoading(true);
    try {
      const res = await demandeService.getById(id);
      setDemande(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleMettreEnCours = async () => {
    setActionLoading(true);
    try {
      await demandeService.mettreEnCours(id);
      setMessage({ type:'success', text:'Demande prise en charge avec succès !' });
      fetchDemande();
    } catch (e) {
      setMessage({ type:'error', text: e.response?.data?.message || 'Erreur' });
    } finally { setActionLoading(false); }
  };

  const handleValider = async () => {
    setActionLoading(true);
    try {
      await demandeService.valider(id);
      setMessage({ type:'success', text:'Demande validée ! Document généré et email envoyé.' });
      fetchDemande();
    } catch (e) {
      setMessage({ type:'error', text: e.response?.data?.message || 'Erreur lors de la validation' });
      fetchDemande();
    } finally { setActionLoading(false); }
  };

  const handleRefuser = async () => {
    if (!motifRefus.trim()) return;
    setActionLoading(true);
    try {
      await demandeService.refuser(id, motifRefus);
      setMessage({ type:'success', text:"Demande refusée. Email envoyé à l'étudiant." });
      setShowRefusModal(false);
      setMotifRefus('');
      fetchDemande();
    } catch (e) {
      setMessage({ type:'error', text: e.response?.data?.message || 'Erreur' });
    } finally { setActionLoading(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'60px' }}>
      <p style={{ color:'#374151', fontSize:'13px' }}>Chargement...</p>
    </div>
  );

  if (!demande) return (
    <div style={{ textAlign:'center', padding:'60px' }}>
      <p style={{ color:'#E74C3C', marginBottom:'16px' }}>Demande introuvable</p>
      <button
        onClick={() => onClose ? onClose() : navigate('/demandes')}
        style={S.backBtn}
      >
        Retour aux demandes
      </button>
    </div>
  );

  const ss              = STATUT_STYLES[demande.statut] || {};
  const peutMettreEnCours = demande.statut === 'en_attente';
  const peutValider       = demande.statut === 'en_cours';
  const peutRefuser       = ['en_attente','en_cours'].includes(demande.statut);

  return (
    <div style={S.container}>

      {/* ── Header ── */}
      <div style={S.header}>
        <button
          onClick={() => onClose ? onClose() : navigate('/demandes')}
          style={S.backBtn}
        >
          ← Retour aux demandes
        </button>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <span style={{ ...S.statutBadge, backgroundColor:ss.bg, color:ss.color }}>
            {ss.label}
          </span>
          <span style={S.idBadge}>
            REQ-{String(demande.id).padStart(4,'0')}
          </span>
        </div>
      </div>

      {/* ── Message ── */}
      {message && (
        <div style={{
          ...S.messageBox,
          backgroundColor: message.type === 'success' ? '#F0FDF4' : '#FFF1F2',
          borderColor:     message.type === 'success' ? '#27AE60' : '#E74C3C',
          color:           message.type === 'success' ? '#166534' : '#991B1B',
        }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} style={S.closeMsg}>✕</button>
        </div>
      )}

      <div style={S.content}>

        {/* ── Colonne gauche ── */}
        <div style={S.leftCol}>

          <div style={S.card}>
            <h3 style={S.cardTitle}>Informations étudiant</h3>
            <div style={S.etudiantHeader}>
              <div style={S.avatar}>
                {demande.prenom?.[0]}{demande.nom?.[0]}
              </div>
              <div>
                <p style={S.etudiantName}>{demande.prenom} {demande.nom}</p>
                <p style={S.etudiantEmail}>{demande.email}</p>
              </div>
            </div>
            <InfoRow label="CNE"         value={demande.cne} />
            <InfoRow label="Code Apogée" value={demande.code_apogee} />
          </div>

          <div style={S.card}>
            <h3 style={S.cardTitle}>Détails de la demande</h3>
            <div style={{ marginBottom:'12px' }}>
              <p style={S.infoLabel}>Type de document</p>
              <p style={{
                fontSize:'13px', color:'#374151', fontWeight:'500',
                backgroundColor:'#F5F7FB', padding:'10px 12px',
                borderRadius:'6px', borderLeft:'3px solid #0F5FB4',
                marginTop:'4px', lineHeight:'1.5',
              }}>
                {TYPE_LABELS[demande.type_document] || demande.type_document}
              </p>
            </div>
            {demande.semestre && (
              <InfoRow label="Semestre" value={`Semestre ${demande.semestre}`} />
            )}
            {demande.type_retrait && (
              <InfoRow label="Type retrait" value={demande.type_retrait} />
            )}
            <InfoRow
              label="Date de soumission"
              value={new Date(demande.date_creation).toLocaleDateString('fr-FR', {
                day:'2-digit', month:'long', year:'numeric',
              })}
            />
            {demande.commentaire && (
              <InfoRow label="Commentaire" value={demande.commentaire} />
            )}
          </div>

          {(demande.traite_par || demande.date_traitement || demande.motif_refus) && (
            <div style={S.card}>
              <h3 style={S.cardTitle}>Informations de traitement</h3>
              {demande.traite_par && (
                <InfoRow
                  label="Traité par"
                  value={`${demande.traite_par.prenom} ${demande.traite_par.nom}`}
                />
              )}
              {demande.date_traitement && (
                <InfoRow
                  label="Date de traitement"
                  value={new Date(demande.date_traitement).toLocaleDateString('fr-FR', {
                    day:'2-digit', month:'long', year:'numeric',
                  })}
                />
              )}
              {demande.motif_refus && (
                <div style={S.motifRefus}>
                  <p style={S.infoLabel}>Motif de refus</p>
                  <p style={{ fontSize:'13px', color:'#E74C3C', marginTop:'4px', lineHeight:'1.5' }}>
                    {demande.motif_refus}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Colonne droite ── */}
        <div style={S.rightCol}>

          <div style={S.card}>
            <h3 style={S.cardTitle}>Actions</h3>

            <div style={{ marginBottom:'20px' }}>
              <Step
                done  label="Soumission"
                date={new Date(demande.date_creation).toLocaleDateString('fr-FR')}
                color="#0F5FB4"
              />
              <Step
                done={['en_cours','prete','refusee'].includes(demande.statut)}
                active={demande.statut === 'en_cours'}
                label="En cours de traitement"
                color="#0A74D1"
              />
              <Step
                done={demande.statut === 'prete'}
                label="Document prêt"
                color="#27AE60"
              />
              <Step
                done={demande.statut === 'refusee'}
                label="Refusée"
                color="#E74C3C"
              />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {peutMettreEnCours && (
                <button
                  onClick={handleMettreEnCours}
                  disabled={actionLoading}
                  style={{ ...S.actionBtn, background:'linear-gradient(135deg, #0F5FB4, #0A74D1)' }}
                >
                  {actionLoading ? 'Traitement...' : 'Prendre en charge'}
                </button>
              )}
              {peutValider && (
                <button
                  onClick={handleValider}
                  disabled={actionLoading}
                  style={{ ...S.actionBtn, background:'linear-gradient(135deg, #27AE60, #1E8449)' }}
                >
                  {actionLoading
                    ? 'Traitement...'
                    : demande.type_document === 'retrait_bac'
                      ? 'Valider la demande'
                      : 'Valider et générer PDF'
                  }
                </button>
              )}
              {peutRefuser && (
                <button
                  onClick={() => setShowRefusModal(true)}
                  disabled={actionLoading}
                  style={{ ...S.actionBtn, backgroundColor:'transparent',
                    border:'1.5px solid #E74C3C', color:'#E74C3C' }}
                >
                  Refuser la demande
                </button>
              )}
              {!peutMettreEnCours && !peutValider && !peutRefuser && (
                <div style={S.treatedBox}>
                  <p style={{ fontSize:'13px', color:'#374151', fontWeight:'500' }}>
                    Cette demande a été traitée.
                  </p>
                </div>
              )}
            </div>
          </div>

          {demande.document && (
            <div style={S.card}>
              <h3 style={S.cardTitle}>Document généré</h3>
              <div style={S.documentBox}>
                <div style={S.pdfIcon}>
                  <span style={{ fontSize:'11px', fontWeight:'800', color:'#0F5FB4' }}>PDF</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:'12px', fontWeight:'600', color:'#1B263B',
                    wordBreak:'break-all', lineHeight:'1.4' }}>
                    {demande.document.nom}
                  </p>
                  <p style={{ fontSize:'11px', color:'#374151', marginTop:'4px' }}>
                    Généré le {new Date(demande.document.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <a
                  href={`http://localhost:8000/storage/${demande.document.chemin_fichier}`}
                  target="_blank"
                  rel="noreferrer"
                  style={S.downloadBtn}
                >
                  Télécharger
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Refus ── */}
      {showRefusModal && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>Refuser la demande</h3>
            </div>
            <p style={{ fontSize:'13px', color:'#374151', marginBottom:'20px', lineHeight:'1.6' }}>
              Veuillez indiquer le motif du refus. L'étudiant sera notifié par email.
            </p>
            <textarea
              value={motifRefus}
              onChange={e => setMotifRefus(e.target.value)}
              placeholder="Ex : Dossier incomplet, document déjà délivré..."
              style={S.textarea}
              rows={4}
            />
            <div style={{ display:'flex', gap:'10px', marginTop:'20px', justifyContent:'flex-end' }}>
              <button
                onClick={() => { setShowRefusModal(false); setMotifRefus(''); }}
                style={S.cancelBtn}
              >
                Annuler
              </button>
              <button
                onClick={handleRefuser}
                disabled={!motifRefus.trim() || actionLoading}
                style={{ ...S.confirmBtn, opacity: !motifRefus.trim() ? 0.5 : 1 }}
              >
                {actionLoading ? 'Envoi...' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom:'12px' }}>
      <p style={S.infoLabel}>{label}</p>
      <p style={{ fontSize:'14px', color:'#1B263B', fontWeight:'500' }}>{value || '—'}</p>
    </div>
  );
}

function Step({ done, active, label, date, color }) {
  const c = color || (done ? '#0F5FB4' : '#E2E8F0');
  return (
    <div style={{ display:'flex', gap:'12px', marginBottom:'12px', alignItems:'flex-start' }}>
      <div style={{
        width:'20px', height:'20px', borderRadius:'50%',
        backgroundColor: done ? c : '#F5F7FB',
        border: `2px solid ${done ? c : '#E2E8F0'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        flexShrink:0, marginTop:'2px',
        boxShadow: done ? `0 2px 6px ${c}40` : 'none',
      }}>
        {done && <span style={{ color:'#fff', fontSize:'9px', fontWeight:'800' }}>✓</span>}
      </div>
      <div>
        <p style={{
          fontSize:'13px',
          fontWeight: active ? '700' : done ? '500' : '400',
          color: done ? '#1B263B' : '#CBD5E1',
        }}>
          {label}
        </p>
        {date && <p style={{ fontSize:'11px', color:'#374151', marginTop:'1px' }}>{date}</p>}
      </div>
    </div>
  );
}

const S = {
  container: { display:'flex', flexDirection:'column', gap:'16px' },

  header: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  backBtn: {
    padding:'8px 16px', backgroundColor:'#fff',
    border:'1.5px solid #E2E8F0', borderRadius:'8px',
    fontSize:'13px', cursor:'pointer', color:'#374151', fontWeight:'500',
  },
  statutBadge: {
    padding:'6px 14px', borderRadius:'20px',
    fontSize:'12px', fontWeight:'700',
  },
  idBadge: {
    backgroundColor:'#EFF6FF', color:'#0F5FB4',
    padding:'6px 12px', borderRadius:'8px',
    fontSize:'13px', fontWeight:'700', fontFamily:'monospace',
  },

  messageBox: {
    padding:'12px 16px', borderRadius:'8px',
    border:'1px solid', fontSize:'13px', fontWeight:'500',
    display:'flex', alignItems:'center', justifyContent:'space-between',
  },
  closeMsg: {
    backgroundColor:'transparent', border:'none',
    cursor:'pointer', fontSize:'16px', color:'inherit',
  },

  content: {
    display:'grid', gridTemplateColumns:'1fr 380px',
    gap:'20px', alignItems:'start',
  },
  leftCol:  { display:'flex', flexDirection:'column', gap:'16px' },
  rightCol: { display:'flex', flexDirection:'column', gap:'16px' },

  card: {
    backgroundColor:'#fff', borderRadius:'12px', padding:'20px',
    boxShadow:'0 1px 4px rgba(15,95,180,0.08)', border:'1px solid #E2E8F0',
  },
  cardTitle: {
    fontSize:'12px', fontWeight:'700', color:'#1B263B',
    marginBottom:'16px', textTransform:'uppercase',
    letterSpacing:'0.5px', paddingBottom:'10px',
    borderBottom:'1px solid #E2E8F0',
  },

  etudiantHeader: {
    display:'flex', alignItems:'center', gap:'14px', marginBottom:'16px',
    padding:'12px', backgroundColor:'#F5F7FB',
    borderRadius:'10px', border:'1px solid #E2E8F0',
  },
  avatar: {
    width:'48px', height:'48px', borderRadius:'50%',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'16px', fontWeight:'700', textTransform:'uppercase', flexShrink:0,
    boxShadow:'0 3px 10px rgba(15,95,180,0.3)',
  },
  etudiantName:  { fontSize:'16px', fontWeight:'700', color:'#1B263B' },
  etudiantEmail: { fontSize:'12px', color:'#374151', marginTop:'2px' },

  infoLabel: {
    fontSize:'10px', color:'#CBD5E1', fontWeight:'700',
    textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'3px',
  },
  motifRefus: {
    backgroundColor:'#FFF1F2', border:'1px solid #FECDD3',
    borderLeft:'3px solid #E74C3C',
    borderRadius:'0 8px 8px 0', padding:'12px', marginTop:'8px',
  },

  actionBtn: {
    padding:'12px', color:'#fff', border:'none',
    borderRadius:'8px', fontSize:'14px', fontWeight:'600',
    cursor:'pointer', transition:'opacity 0.2s',
    letterSpacing:'0.3px',
  },
  treatedBox: {
    padding:'16px', backgroundColor:'#F5F7FB',
    borderRadius:'8px', textAlign:'center',
    border:'1px solid #E2E8F0',
  },

  documentBox: {
    display:'flex', alignItems:'center', gap:'14px',
    padding:'14px', backgroundColor:'#F5F7FB',
    borderRadius:'10px', border:'1px solid #E2E8F0',
  },
  pdfIcon: {
    width:'42px', height:'42px', borderRadius:'8px',
    backgroundColor:'#EFF6FF', border:'1px solid #BFDBFE',
    display:'flex', alignItems:'center', justifyContent:'center',
    flexShrink:0,
  },
  downloadBtn: {
    padding:'8px 16px',
    background:'linear-gradient(135deg, #0F5FB4, #0A74D1)',
    color:'#fff', borderRadius:'8px', textDecoration:'none',
    fontSize:'12px', fontWeight:'600', flexShrink:0,
    boxShadow:'0 2px 6px rgba(15,95,180,0.25)',
  },

  modalOverlay: {
    position:'fixed', inset:0,
    backgroundColor:'rgba(10,45,106,0.5)',
    display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000,
  },
  modal: {
    backgroundColor:'#fff', borderRadius:'16px', padding:'28px',
    width:'100%', maxWidth:'480px',
    boxShadow:'0 20px 60px rgba(10,45,106,0.2)',
  },
  modalHeader: {
    marginBottom:'12px', paddingBottom:'12px',
    borderBottom:'1px solid #E2E8F0',
  },
  modalTitle: { fontSize:'17px', fontWeight:'700', color:'#1B263B' },

  textarea: {
    width:'100%', padding:'12px', borderRadius:'8px',
    border:'1.5px solid #E2E8F0', fontSize:'13px',
    resize:'vertical', outline:'none', color:'#1B263B',
    fontFamily:'inherit', boxSizing:'border-box',
    backgroundColor:'#F5F7FB', lineHeight:'1.5',
  },
  cancelBtn: {
    padding:'10px 20px', backgroundColor:'#fff',
    border:'1.5px solid #E2E8F0', borderRadius:'8px',
    fontSize:'13px', cursor:'pointer', color:'#374151', fontWeight:'500',
  },
  confirmBtn: {
    padding:'10px 20px', backgroundColor:'#E74C3C', color:'#fff',
    border:'none', borderRadius:'8px',
    fontSize:'13px', fontWeight:'600', cursor:'pointer',
  },
};