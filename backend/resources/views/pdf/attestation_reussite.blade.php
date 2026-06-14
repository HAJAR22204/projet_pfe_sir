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
            border:1px solid #000;
            text-align:center;
            width:62%;
            padding:5px 12px;
            margin-top:80px;
            margin-bottom:30px;
            margin-left:auto;
            margin-right:auto;
        }

        .titre-fr {
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .titre-ar {
            font-family: 'dejavusans', sans-serif;
            direction: rtl;
            font-size: 16px;
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
            margin-top: 5px;
            font-style: italic;
            border-top: 3px solid #000000;
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
                     style="width:130px; height:100px;">
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

    {{-- ── Infos étudiant ── --}}
<table width="70%" align="center" style="font-size:12px;">

    <tr>
        <td width="70"><strong>Nom</strong></td>
        <td width="10">:</td>
        <td width="120"><strong>{{ strtoupper($etudiant->NOM) }}</strong></td>

        <td width="90" class="ar">
            <strong>{{ $etudiant->NOM_AR }}</strong>
        </td>
        <td width="10">:</td>
        <td width="60" class="ar"><strong>اللقب</strong></td>
    </tr>

    <tr>
        <td><strong>Prénom</strong></td>
        <td>:</td>
        <td><strong>{{ $etudiant->PRENOM }}</strong></td>

        <td class="ar">
            <strong>{{ $etudiant->PRENOM_AR }}</strong>
        </td>
        <td>:</td>
        <td class="ar"><strong>الاسم</strong></td>
    </tr>

</table>

{{-- Bloc CNE / CIN centré --}}
<table width="40%" align="center" style="font-size:12px; margin-top:4px;">

    <tr>
        <td width="45"><strong>CNE</strong></td>
        <td width="10">:</td>

        <td width="100" align="center">
            <strong>{{ $etudiant->CNE }}</strong>
        </td>

        <td width="10">:</td>

        <td width="45" class="ar">
            <strong>ر.و.ط</strong>
        </td>
    </tr>

    <tr>
        <td><strong>CIN</strong></td>
        <td>:</td>

        <td align="center">
            <strong>{{ $etudiant->CIN }}</strong>
        </td>

        <td>:</td>

        <td class="ar">
            <strong>ب.ت.و</strong>
        </td>
    </tr>

</table>

{{-- Date de naissance --}}
<table width="70%" align="center" style="font-size:12px; margin-top:4px;">

    <tr>
        <td width="70"><strong>Née le</strong></td>
        <td width="10">:</td>

        <td>
            <strong>{{ \Carbon\Carbon::parse($etudiant->DATE_NAISSANCE)->locale('fr')->isoFormat('D MMMM YYYY') }}</strong>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <strong>à</strong>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <strong>{{ $etudiant->LIEU_NAISSANCE }}</strong>
        </td>
    </tr>

</table>

    {{-- ── Corps ── --}}
    <div class="corps" style="margin-top:16px;">
        <strong>A été déclaré(e) admis(e) au le Diplôme d'Etudes Universitaires Scientifiques et Techniques</strong>
    </div>

    <table width="70%" align="center" style="font-size:12px; margin-top:4px;">

    <tr>
        <td width="80"><strong>Filière   :</strong></td>
    </tr>
    </table>
    <table width="70%" align="center" style="font-size:12px; margin-top:0px;">
        <tr>
        <td align="center"><strong>{{ $filiere->NOM_FILIERE ?? '' }}
        @if(!empty($filiere->CODE_FILIERE))
            -( {{ $filiere->CODE_FILIERE }} )
        @endif</strong>
        </td></tr>
    </table>
    <table width="70%" align="center" style="font-size:12px; margin-top:0px;">
    <tr>
        <td width="80"><strong>Option   :</strong></td>
    </tr>
    </table>

    <div class="corps" style="margin-top:10px;">
        Au titre de l'année universitaire
        <strong>{{ $annee_universitaire }}</strong>
        avec la mention
        <strong>{{ $diplome->MENTION ?? '' }}</strong>
    </div>

    {{-- ── Formule de délivrance ── --}}
    <div style="margin-top:50px; text-align:center; font-size:12px; font-style:italic;
        border-bottom:2px solid #000; padding-bottom:4px; width:80%; margin-left:auto; margin-right:auto;">
        Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.
    </div>

    
    {{-- ── Fait à Marrakech ── --}}
    <div style="text-align:right; font-size:12px; margin-top:250px;">
        Fait à Marrakech, le
        {{ \Carbon\Carbon::now()->locale('fr')->isoFormat('D MMMM YYYY') }}
    </div>

    {{-- ── Barcode ── --}}
    <table width="100%" style="margin-top:15px;">
        <tr>
            {{-- Barcode gauche --}}
            <td width="30%" style="vertical-align:bottom; text-align:left;">
                <img src="{{ $barcodeBase64 }}"
                     style="width:100px; height:35px; position:absolute; bottom: 20px; left: 30px;"
                     alt="Barcode"><br>
                <div align="center" style="font-size:10px; margin-top:2px;">
                    {{ $demande->code_apogee }}
                </div>
            </td>
        </tr>
    </table>

    {{-- ── Note de bas de page ── --}}
    <div class="note-bas">
        Avis important : Il ne peut être délivré qu'un seul exemplaire de cette attestation.
        Aucun duplicata ne sera fourni.
    </div>

</body>
</html>