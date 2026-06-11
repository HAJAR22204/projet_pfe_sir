<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page {
            margin: 6mm 22mm 18mm 22mm;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
            margin: 0;
            padding: 0;
        }

        .ar {
            font-family: 'dejavusans', sans-serif;
            direction: rtl;
            text-align: right;
        }

        .divider {
            border: none;
            border-top: 1px solid #000;
            margin-top:12px;
            margin-bottom:30px;
        }

        .titre-box {
            border: 1px solid #000;
            text-align: center;
            padding: 8px 20px;
            margin:45px auto;
            width:58%;
            padding:10px;
            width: 70%;
        }

        .titre-fr {
            font-size: 15px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .titre-ar {
            font-family: 'dejavusans', sans-serif;
            direction: rtl;
            font-size: 14px;
            margin-top: 4px;
        }

        .corps {
            font-size: 12px;
            line-height: 2.3;
            margin-bottom: 8px;
        }

        .info-table td {
            padding: 2px 6px;
            font-size: 12px;
            line-height: 2;
        }

        .note-bas {
            text-align: center;
            font-size: 10px;
            margin-top: 10px;
            font-style: italic;
            border-top: 1px solid #ccc;
            padding-top: 6px;
        }
    </style>
</head>
<body>

    {{-- ── Header ── --}}
    <table width="100%" style="margin-bottom:6px;">
        <tr>
            {{-- Gauche --}}
            <td width="33%" style="font-size:11px; line-height:1.7; vertical-align:middle; text-align:center;">
                <strong>UNIVERSITÉ CADI AYYAD</strong><br>
                Faculté des Sciences et Techniques<br>
                Marrakech
            </td>

            {{-- Centre : logo --}}
            <td width="34%" style="text-align:center; vertical-align:middle;">
                <img src="{{ public_path('logo_fst_nobg.png') }}"
                     alt="FST"
                     style="width:100px; height:80px;">
            </td>

            {{-- Droite : arabe --}}
            <td width="33%" style="vertical-align:middle; text-align:center;">
                <div class="ar" lang="ar" style="font-size:11px; line-height:1.7; text-align:center;">
                    جامعة القاضي عياض<br>
                    كلية العلوم والتقنيات<br>
                    مراكش
                </div>
            </td>
        </tr>
    </table>


    {{-- ── Titre encadré ── --}}
    <div class="titre-box">
        <div class="titre-fr">ATTESTATION DE RÉUSSITE</div>
        <div class="titre-ar" lang="ar">شهادة النجاح</div>
    </div>

    {{-- ── Introduction ── --}}
    <div class="corps" style="margin-bottom:16px;">
        Le Doyen de la Faculté des Sciences et Techniques de Marrakech atteste que l'étudiant(e) :
    </div>

    {{-- ── Infos étudiant (2 colonnes) ── --}}
    <table class="info-table" width="80%" align="center" style="margin-top:15px;">
        <tr>
            {{-- Colonne gauche FR --}}
            <td width="50%" style="vertical-align:top;">
                <table>
                    <tr>
                        <td style="width:70px; padding:2px 6px;">Nom</td>
                        <td style="padding:2px 4px;">:</td>
                        <td style="font-weight:bold; padding:2px 6px;">
                            {{ strtoupper($etudiant->NOM ?? '') }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:2px 6px;">Prénom</td>
                        <td style="padding:2px 4px;">:</td>
                        <td style="font-weight:bold; padding:2px 6px;">
                            {{ ucfirst(strtolower($etudiant->PRENOM ?? '')) }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:2px 6px;">CNE</td>
                        <td style="padding:2px 4px;">:</td>
                        <td style="padding:2px 6px;">{{ $etudiant->CNE ?? '' }}</td>
                    </tr>
                    <tr>
                        <td style="padding:2px 6px;">CIN</td>
                        <td style="padding:2px 4px;">:</td>
                        <td style="padding:2px 6px;">{{ $etudiant->CIN ?? '' }}</td>
                    </tr>
                    @if($etudiant->DATE_NAISSANCE ?? null)
                    <tr>
                        <td style="padding:2px 6px; vertical-align:top;">Née le</td>
                        <td style="padding:2px 4px; vertical-align:top;">:</td>
                        <td style="padding:2px 6px;">
                            {{ \Carbon\Carbon::parse($etudiant->DATE_NAISSANCE)->locale('fr')->isoFormat('D MMMM YYYY') }}
                            @if($etudiant->LIEU_NAISSANCE ?? null)
                                &nbsp; à {{ $etudiant->LIEU_NAISSANCE }}
                            @endif
                        </td>
                    </tr>
                    @endif
                </table>
            </td>

            {{-- Colonne droite AR --}}
            <td width="50%" style="vertical-align:top; text-align:right;">
                <table style="margin-left:auto;">
                    <tr>
                        <td style="font-family:'dejavusans'; direction:rtl; padding:2px 6px; font-weight:bold;">
                            <span class="ar" lang="ar">{{ $etudiant->NOM_AR ?? strtoupper($etudiant->NOM ?? '') }}</span>
                        </td>
                        <td style="font-family:'dejavusans'; padding:2px 4px;">:</td>
                        <td style="font-family:'dejavusans'; direction:rtl; padding:2px 6px;">
                            <span class="ar" lang="ar">اللقب</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-family:'dejavusans'; direction:rtl; padding:2px 6px; font-weight:bold;">
                            <span class="ar" lang="ar">{{ $etudiant->PRENOM_AR ?? ucfirst(strtolower($etudiant->PRENOM ?? '')) }}</span>
                        </td>
                        <td style="font-family:'dejavusans'; padding:2px 4px;">:</td>
                        <td style="font-family:'dejavusans'; direction:rtl; padding:2px 6px;">
                            <span class="ar" lang="ar">الاسم</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-family:'dejavusans'; direction:rtl; padding:2px 6px;">
                            {{ $etudiant->CNE ?? '' }}
                        </td>
                        <td style="font-family:'dejavusans'; padding:2px 4px;">:</td>
                        <td style="font-family:'dejavusans'; direction:rtl; padding:2px 6px;">
                            <span class="ar" lang="ar">ر.و.ط</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="font-family:'dejavusans'; direction:rtl; padding:2px 6px;">
                            {{ $etudiant->CIN ?? '' }}
                        </td>
                        <td style="font-family:'dejavusans'; padding:2px 4px;">:</td>
                        <td style="font-family:'dejavusans'; direction:rtl; padding:2px 6px;">
                            <span class="ar" lang="ar">ب.ت.و</span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- ── Corps ── --}}
    <div class="corps" style="margin-top:16px;">
        <strong>A été déclaré(e) admis(e) au le Diplôme d'Etudes Universitaires Scientifiques et Techniques</strong>
    </div>

    <div class="corps">
        Filière &nbsp;:
        &nbsp;&nbsp;&nbsp;&nbsp;{{ $filiere->NOM_FILIERE ?? $filiere->CODE_FILIERE ?? '' }}
    </div>

    <div class="corps">
        Option &nbsp;&nbsp;:
        &nbsp;&nbsp;&nbsp;&nbsp;
        <strong>{{ $filiere->NOM_FILIERE ?? '' }}
        @if(!empty($filiere->CODE_FILIERE))
            -( {{ $filiere->CODE_FILIERE }} )
        @endif
        </strong>
    </div>

    <div class="corps" style="margin-top:10px;">
        Au titre de l'année universitaire
        <strong>{{ $annee_universitaire }}</strong>
        avec la mention
        <strong>{{ $diplome->MENTION ?? '' }}</strong>
    </div>

    {{-- ── Formule de délivrance ── --}}
    <div style="margin-top:65px; text-align:center; font-size:12px; font-style:italic;
        border-bottom:1px solid #000; padding-bottom:4px; width:70%; margin-left:auto; margin-right:auto;">
        Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
    </div>

    {{-- ── Signature + Barcode ── --}}
    <table width="100%" style="margin-top:30px;">
        <tr>
            {{-- Barcode gauche --}}
            <td width="30%" style="vertical-align:bottom; text-align:left;">
                <img src="{{ $barcodeBase64 }}"
                     style="width:100px; height:35px; position:absolute; bottom: 20px; left: 30px;"
                     alt="Barcode"><br>
                <div style="font-size:10px; margin-top:2px;">
                    {{ $demande->code_apogee }}
                </div>
            </td>

            <div style="position:absolute; left:180px; bottom:180px; width:240px; border-top:1px solid black; transform:rotate(-45deg);"></div>

            {{-- Espace signature droite --}}
            <td width="70%" style="text-align:right; vertical-align:top; font-size:12px;">
                <div style="font-weight:bold;">Le Doyen</div>
                <div style="height:180px;"></div>
            </td>
        </tr>
    </table>

    {{-- ── Fait à Marrakech ── --}}
    <div style="text-align:right; font-size:12px; margin-top:70px;">
        Fait à Marrakech, le
        {{ \Carbon\Carbon::now()->locale('fr')->isoFormat('D MMMM YYYY') }}
    </div>

    {{-- ── Note de bas de page ── --}}
    <div class="note-bas">
        Avis important : Il ne peut être délivré qu'un seul exemplaire de cette attestation.
        Aucun duplicata ne sera fourni.
    </div>

</body>
</html>