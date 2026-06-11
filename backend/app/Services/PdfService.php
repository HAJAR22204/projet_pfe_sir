<?php

namespace App\Services;

use App\Models\Demande;
use App\Models\DocumentDemande;
use Carbon\Carbon;
use Mpdf\Mpdf;

class PdfService
{
    protected $apogeeService;

    public function __construct(ApogeeService $apogeeService)
    {
        $this->apogeeService = $apogeeService;
    }

    public function genererDocument(Demande $demande)
{
    $etudiant            = $this->apogeeService->getInfosEtudiant($demande->code_apogee);
    $filiere             = $this->apogeeService->getFiliere($etudiant->FILIERE_CODE);
    $annee_universitaire = $this->apogeeService->getAnneeUniversitaireActuelle();

    switch ($demande->type_document) {
        case 'attestation_inscription':
            return $this->genererAttestationInscription($demande, $etudiant, $filiere, $annee_universitaire);
        case 'certificat_scolarite':
            return $this->genererCertificatScolarite($demande, $etudiant, $filiere, $annee_universitaire);
        case 'releve_notes':
            return $this->genererReleveNotes($demande, $etudiant, $filiere, $annee_universitaire);
        case 'attestation_reussite':
            return $this->genererAttestationReussite($demande, $etudiant, $filiere);
        case 'diplome_deust':  
        case 'retrait_bac':  
            return null;
        default:
            return null;
    }
}

    private function getMpdf(): Mpdf
{
    $mpdf = new Mpdf([
        'mode'          => 'utf-8',
        'format'        => 'A4',
        'margin_top'    => 12,
        'margin_bottom' => 12,
        'margin_left'   => 14,
        'margin_right'  => 14,
        'tempDir'       => storage_path('app/mpdf_tmp'),
        'fontDir'       => [storage_path('fonts')],
        'fontdata'      => [
            'dejavusans' => [
                'R'      => 'DejaVuSans.ttf',
                'useOTL' => 0xFF,
            ],
        ],
        'default_font' => 'dejavusans',
    ]);

    $mpdf->autoScriptToLang = false;
    $mpdf->autoLangToFont   = false;

    return $mpdf;
}
    private function getMpdfPaysage(): Mpdf
    {
        return $this->createMpdfLandscape(12, 14);
    }

    private function getMpdfDiplome(): Mpdf
    {
        $mpdf = new Mpdf([
            'mode'          => 'utf-8',
            'format'        => 'A4-L',
            'margin_top'    => 6,
            'margin_bottom' => 6,
            'margin_left'   => 8,
            'margin_right'  => 8,
            'tempDir'       => storage_path('app/mpdf_tmp'),
            'fontDir'       => [storage_path('fonts')],
            'fontdata'      => $this->getFontDataDiplome(),
            'default_font'  => 'dejavusans',
        ]);

        $mpdf->autoScriptToLang = false;
        $mpdf->autoLangToFont   = false;

        return $mpdf;
    }

    private function getFontDataDiplome(): array
    {
        return [
            'dejavusans' => [
                'R'      => 'DejaVuSans.ttf',
                'useOTL' => 0xFF,
            ],
            'amiri' => [
                'R'      => 'Amiri-Regular.ttf',
                'B'      => 'Amiri-Bold.ttf',
                // Amiri + OTL provoque « GPOS Lookup Type 5, Format 3 » dans mPDF
                'useOTL' => 0,
            ],
        ];
    }

    private function createMpdfLandscape(int $marginVertical, int $marginHorizontal): Mpdf
    {
        $mpdf = new Mpdf([
            'mode'          => 'utf-8',
            'format'        => 'A4-L',
            'margin_top'    => $marginVertical,
            'margin_bottom' => $marginVertical,
            'margin_left'   => $marginHorizontal,
            'margin_right'  => $marginHorizontal,
            'tempDir'       => storage_path('app/mpdf_tmp'),
            'fontDir'       => [storage_path('fonts')],
            'fontdata'      => [
                'dejavusans' => [
                    'R'      => 'DejaVuSans.ttf',
                    'useOTL' => 0xFF,
                ],
            ],
            'default_font' => 'dejavusans',
        ]);

        $mpdf->autoScriptToLang = false;
        $mpdf->autoLangToFont   = false;

        return $mpdf;
    }

    private function mentionEnArabe(?string $mention): string
    {
        $m = mb_strtolower(trim($mention ?? ''));

        return match ($m) {
            'passable'              => 'مقبول',
            'assez bien'            => 'حسن',
            'bien'                  => 'جيد',
            'très bien', 'tres bien' => 'حسن جدا',
            'excellent'             => 'ممتاز',
            default                 => $mention ?? '',
        };
    }

    private function renderView(string $view, array $data): string
    {
        return view($view, $data)->render();
    }

    private function genererAttestationInscription($demande, $etudiant, $filiere, $annee_universitaire)
    {
        $mpdf = $this->getMpdf();
        $html = $this->renderView('pdf.attestation_inscription', [
            'demande'             => $demande,
            'etudiant'            => $etudiant,
            'filiere'             => $filiere,
            'annee_universitaire' => $annee_universitaire,
        ]);
        $mpdf->WriteHTML($html);
        return $this->sauvegarderMpdf($mpdf, $demande, 'attestation_inscription');
    }

    private function genererCertificatScolarite($demande, $etudiant, $filiere, $annee_universitaire)
    {
        $mpdf = $this->getMpdf();
        $html = $this->renderView('pdf.certificat_scolarite', [
            'demande'             => $demande,
            'etudiant'            => $etudiant,
            'filiere'             => $filiere,
            'annee_universitaire' => $annee_universitaire,
        ]);
        $mpdf->WriteHTML($html);
        return $this->sauvegarderMpdf($mpdf, $demande, 'certificat_scolarite');
    }

    private function genererAttestationReussite($demande, $etudiant, $filiere)
{
    $diplome          = $this->apogeeService->getDiplome($demande->code_apogee);
    $moyenne_generale = $this->apogeeService->getMoyenneGenerale($demande->code_apogee);

    $anneeUniv = $this->apogeeService->getAnneeUniversitaireEtudiant($demande->code_apogee)
        ?? $this->apogeeService->getAnneeUniversitaireActuelle();

    // Barcode
    $generator     = new \Picqer\Barcode\BarcodeGeneratorSVG();
    $barcodeSvg    = $generator->getBarcode(
        (string) $etudiant->CODE_APOGEE,
        $generator::TYPE_CODE_128,
        2, 60
    );
    $barcodeBase64 = 'data:image/svg+xml;base64,' . base64_encode($barcodeSvg);

    $mpdf = $this->getMpdf();
    $html = $this->renderView('pdf.attestation_reussite', [
        'demande'             => $demande,
        'etudiant'            => $etudiant,
        'filiere'             => $filiere,
        'diplome'             => $diplome,
        'moyenne_generale'    => $moyenne_generale,
        'annee_universitaire' => str_replace('-', '/', $anneeUniv),
        'mention_ar'          => $this->mentionEnArabe($diplome?->MENTION),
        'barcodeBase64'       => $barcodeBase64,
    ]);
    $mpdf->WriteHTML($html);
    return $this->sauvegarderMpdf($mpdf, $demande, 'attestation_reussite');
}

    private function genererReleveNotes($demande, $etudiant, $filiere, $annee_universitaire)
{
    $notes   = $this->apogeeService->getNotesParSemestre($demande->code_apogee, $demande->semestre);
    $moyenne = $this->apogeeService->getMoyenneSemestre($demande->code_apogee, $demande->semestre);

    // ── Lire l'année universitaire réelle depuis INSCRIPTIONS ──
    $anneeUniv = $this->apogeeService->getAnneeUniversitaireParSemestre(
        $demande->code_apogee,
        $demande->semestre
    ) ?? $annee_universitaire;

    $anneeUnivAffichage = str_replace('-', '/', $anneeUniv);

    // Année dans le cadre selon le semestre
    // S1,S3,S5 (impairs) → 1ère partie | S2,S4,S6 (pairs) → 2ème partie
    $parts = preg_split('/[\-\/]/', $anneeUniv);
    $semestre = intval($demande->semestre);
    $anneeReleve = ($semestre % 2 !== 0)
        ? intval($parts[0])
        : intval($parts[1] ?? $parts[0]);

    // Générer le barcode
    $generator     = new \Picqer\Barcode\BarcodeGeneratorSVG();
    $barcodeData   = (string) $etudiant->CODE_APOGEE;
    $barcodeSvg    = $generator->getBarcode(
        $barcodeData,
        $generator::TYPE_CODE_128,
        2,
        60
    );
    $barcodeBase64 = 'data:image/svg+xml;base64,' . base64_encode($barcodeSvg);

    $mpdf = $this->getMpdf();
    $html = $this->renderView('pdf.releve_notes', [
        'demande'             => $demande,
        'etudiant'            => $etudiant,
        'filiere'             => $filiere,
        'annee_universitaire' => $anneeUnivAffichage,  
        'notes'               => $notes,
        'moyenne'             => $moyenne,
        'barcodeBase64'       => $barcodeBase64,
        'anneeReleve'         => $anneeReleve,        
    ]);
    $mpdf->WriteHTML($html);
    return $this->sauvegarderMpdf($mpdf, $demande, 'releve_notes_s' . $demande->semestre);
}

    private function genererDiplomeDeust($demande, $etudiant, $filiere)
{
    $toutes_notes     = $this->apogeeService->getToutesLesNotes($demande->code_apogee);
    $toutes_moyennes  = $this->apogeeService->getToutesMoyennesSemestres($demande->code_apogee);
    $moyenne_generale = $this->apogeeService->getMoyenneGenerale($demande->code_apogee);
    $diplome          = $this->apogeeService->getDiplome($demande->code_apogee);

    $notes_par_semestre = [];
    foreach ($toutes_notes as $note) {
        $notes_par_semestre[$note->SEMESTRE][] = $note;
    }

    $moyennes_semestres = [];
    foreach ($toutes_moyennes as $moyenne) {
        $moyennes_semestres[$moyenne->SEMESTRE] = $moyenne;
    }

    // ── Dates bilingues ──
    $dateEmission = $diplome?->DATE_OBTENTION
        ? \Carbon\Carbon::parse($diplome->DATE_OBTENTION)
        : \Carbon\Carbon::now();

    $date_emission_fr = $dateEmission->locale('fr')->isoFormat('D MMMM YYYY');
    $date_emission_ar = $dateEmission->locale('ar')->isoFormat('D MMMM YYYY');

    // ── Année du diplôme ──
    $annee_diplome = $dateEmission->year;

    // ── Numéro de série (bord gauche) ──
    $numero_serie = $annee_diplome . '/' . $demande->code_apogee;

    // ── Mention en arabe ──
    $mentions_ar = [
        'Passable'    => 'مقبول',
        'Assez Bien'  => 'مستحسن',
        'Bien'        => 'حسن',
        'Très Bien'   => 'جيد جدا',
        'Excellent'   => 'ممتاز',
    ];
    $mention_ar = $mentions_ar[$diplome?->MENTION ?? ''] ?? ($diplome?->MENTION ?? '');

    $mpdf = $this->getMpdfPaysage();
    $html = $this->renderView('pdf.diplome_deust', [
        'demande'            => $demande,
        'etudiant'           => $etudiant,
        'filiere'            => $filiere,
        'notes_par_semestre' => $notes_par_semestre,
        'moyennes_semestres' => $moyennes_semestres,
        'moyenne_generale'   => $moyenne_generale,
        'diplome'            => $diplome,
        'date_emission_fr'   => $date_emission_fr,
        'date_emission_ar'   => $date_emission_ar,
        'annee_diplome'      => $annee_diplome,
        'numero_serie'       => $numero_serie,
        'mention_ar'         => $mention_ar,
    ]);
    $mpdf->WriteHTML($html);
    return $this->sauvegarderMpdf($mpdf, $demande, 'diplome_deust');
}

    private function sauvegarderMpdf(Mpdf $mpdf, Demande $demande, string $type): DocumentDemande
    {
        $nomFichier = $type . '_' . $demande->code_apogee . '_' . time() . '.pdf';
        $chemin     = 'documents/' . $nomFichier;
        $cheminComplet = storage_path('app/public/' . $chemin);

        // Créer le dossier si inexistant
        if (!file_exists(dirname($cheminComplet))) {
            mkdir(dirname($cheminComplet), 0755, true);
        }

        $mpdf->Output($cheminComplet, 'F');

        return DocumentDemande::create([
            'demande_id'      => $demande->id,
            'nom'             => $nomFichier,
            'chemin_fichier'  => $chemin,
            'date_generation' => Carbon::now(),
        ]);
    }
}