<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
    margin: 8mm;}
    body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #000;
    margin: 0;
    padding: 3px;
}
        .ar {
            font-family: 'dejavusans', sans-serif;
            direction: rtl;
            text-align: right;
        }
        .divider {
            border: none;
            border-top: 1px solid #000;
            margin: 4px 0 10px 0;
        }
        .titre {
            text-align: center;
            font-size: 15px;
            font-weight: bold;
            text-decoration: underline;
            margin: 14px 0 14px 0;
        }
        table.notes td{
    padding:2px 6px;
    font-size:11px;
}
        table.notes th {
            border: 1px solid #000;
            padding: 5px 8px;
            text-align: center;
            font-weight: normal;
        }
        table.notes td {
            border: 1px solid #000;
            padding: 4px 8px;
        }
        table.notes td.note   { text-align: center; }
        table.notes td.result { text-align: center; }
        table.notes td.pts    { text-align: center; }
        .resultat-row td { font-weight: bold; }
        .note-bas {
            text-align: center;
            font-size: 10px;
            margin-top: 16px;
            font-style: italic;
        }
    </style>
</head>
<body>

    {{-- ── Header ── --}}
    <table width="100%" style="border:2px solid #000; margin-bottom:0px; font-size:11px; font-weight:bold;">
        <tr>
            <td width="50%" style="padding:4px 6px; vertical-align:top;">
                <strong>Université Cadi Ayyad.</strong>
            </td>
            <td width="50%" style="padding:4px 6px; vertical-align:top; text-align:right;">
                <strong><span class="ar" lang="ar">جامعة القاضي عياض</span></strong>
            </td>
        </tr>
        <tr>
            <td colspan="2" style="text-align:center; padding:3px 6px; font-weight:normal;">
                Année universitaire &nbsp;&nbsp;&nbsp; {{ $annee_universitaire }} &nbsp;&nbsp;&nbsp; <span class="ar" lang="ar">السنة الجامعية</span>
            </td>
        </tr>
    </table>

    <table width="100%" style="margin-bottom:6px; font-size:11px;">
        <tr>
            <td width="55%" style="padding:3px 0; vertical-align:top;">
                <strong>Faculté des Sciences et Techniques &nbsp;&nbsp; Guéliz - Marrakech</strong>
            </td>
            <td width="45%" style="padding:3px 0; vertical-align:top; text-align:right;">
                <strong><span class="ar" lang="ar">كلية العلوم والتقنيات مراكش</span></strong>
            </td>
        </tr>
    </table>


    {{-- ── Titre ── --}}
<div style="text-align:center; font-size:16px; font-weight:bold; margin:10px 0 15px 0;">
    Relevé de Notes
</div>
    {{-- ── Infos étudiant ── --}}
    <div style="font-size:12px; line-height:1.9; margin-bottom:8px;">
        <div>
            Nom Prénom : &nbsp;&nbsp;
            <strong>{{ strtoupper($etudiant->NOM) }} {{ ucfirst(strtolower($etudiant->PRENOM)) }}</strong>
        </div>
        <div>
            N° : &nbsp;&nbsp;
            {{ $demande->code_apogee }}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            CNE : {{ $etudiant->CNE }}
        </div>
        <div>
            Né(e) le
            &nbsp; {{ $etudiant->DATE_NAISSANCE ? \Carbon\Carbon::parse($etudiant->DATE_NAISSANCE)->locale('fr')->isoFormat('D MMMM YYYY') : '' }}
            &nbsp;&nbsp; à : {{ $etudiant->LIEU_NAISSANCE ?? '' }}
        </div>
        <div>
            Inscrit(e) en &nbsp;&nbsp;
            <span style="font-size:13px;">Semestre {{ $demande->semestre }} {{ $filiere->NOM_FILIERE ?? $filiere->LIBELLE_FILIERE ?? $filiere->CODE_FILIERE ?? '' }}</span>
        </div>
    </div>

    <div style="font-size:12px; margin-bottom:6px;">a obtenu les notes suivantes :</div>

    {{-- ── Tableau des notes ── --}}
    <div style="height:10px;"></div>
    <table width="100%" style="border-collapse:collapse; font-size:12px; margin:6px 0; border-left:1px solid #000; border-right:1px solid #000;">
        <thead>
            <tr>
                <th style="border-top:1px solid #000; border-bottom:1px solid #000; padding:5px 8px; text-align:left; font-weight:normal; width:52%;"></th>
                <th style="border-top:1px solid #000; border-bottom:1px solid #000; padding:5px 8px; text-align:center; font-weight:normal; width:18%;">Note/Barème</th>
                <th style="border-top:1px solid #000; border-bottom:1px solid #000; padding:5px 8px; text-align:center; font-weight:normal; width:17%;">Résultat</th>
                <th style="border-top:1px solid #000; border-bottom:1px solid #000; padding:5px 8px; text-align:center; font-weight:normal; width:13%;">Pts jury</th>
            </tr>
        </thead>
        <tbody>
            @foreach($notes as $note)
            <tr>
                <td style="border-bottom:1px solid #000; padding:4px 8px;">{{ $note->NOM_MODULE ?? $note->CODE_MODULE }}</td>
                <td style="border-bottom:1px solid #000; padding:4px 8px; text-align:center;">
                    @php
                        $n = $note->NOTE;
                        $formatted = (floor($n) == $n) ? number_format($n, 0) : rtrim(number_format($n, 3, '.', ''), '0');
                    @endphp
                    {{ $formatted }} / 20
                </td>
                <td style="border-bottom:1px solid #000; padding:4px 8px; text-align:center;">
                    {{ $note->RESULTAT ?? ($note->NOTE >= 10 ? 'Validé' : 'Non Validé') }}
                </td>
                <td style="border-bottom:1px solid #000; padding:4px 8px;"></td>
            </tr>
            @endforeach
        </tbody>
    </table>
    {{-- ── Résultat hors tableau ── --}}
    <table width="100%" style="border-collapse:collapse; font-size:12px; margin:0;"> 
        <tr> 
            <td style="padding:4px 8px; width:52%;">
                <strong>Résultat</strong>
            </td> 
            <td style="padding:4px 8px; text-align:center; width:18%;"> 
                @php $moy = $moyenne ? $moyenne->MOYENNE : null; $formattedMoy = $moy !== null ? ((floor($moy) == $moy) ? number_format($moy, 0) : rtrim(number_format($moy, 3, '.', ''), '0')) : ''; @endphp 
                <strong>{{ $formattedMoy }} / 20</strong> 
            </td>
             <td style="padding:4px 8px; text-align:center; width:17%;"> 
                <strong>{{ $moyenne ? ($moyenne->MOYENNE >= 10 ? 'Validé' : 'Non Validé') : '' }}</strong> 
            </td> 
            <td style="width:13%;"></td> 
        </tr> 
    </table>
<br>
    {{-- ── au dessous du tab ── --}}
    <table width="100%" style="margin-top:15px;">
    <tr>
        <td width="60%"></td>

        <td width="40%" style="text-align:center;">

            {{-- Barcode --}}
            <img src="{{ $barcodeBase64 }}"
                 style="width:120px;height:35px;"
                 alt="Barcode">

            <br>

            <div style="
                display:inline-block;
                border:1px solid #000;
                padding:1px 10px;
                margin-top:2px;
                font-size:14px;">
                {{ $anneeReleve }}
            </div>

            <br><br>

            <table width="100%">
                <tr>

                    {{-- Logo Marrakech --}}
                    <td width="40%" style="text-align:center; vertical-align:top;">

                        <img src="{{ public_path('logo_univ_fst.png') }}"
                             style="width:90px; height:auto;">

                    </td>

                    {{-- Convention --}}
                    <td width="85%" style="text-align:left; vertical-align:top; font-size:11px;">

                        <strong>Convention :</strong><br>

                        <strong>V</strong> &nbsp;&nbsp;&nbsp; : Validé<br>

                        <strong>VAR</strong> : Validé Après Rattrapage<br>

                        <strong>VPC</strong> : Validé par Compensation<br>

                        <strong>NV</strong> &nbsp;&nbsp; : Non Validé

                    </td>

                </tr>
            </table>

        </td>
    </tr>
</table>
<div style="height: 280px;"></div>

    {{-- ── Pied de page ── --}}
<div style="text-align:left;">
<div style="text-align:center;">
    Fait à Marrakech, le {{ \Carbon\Carbon::now()->locale('fr')->isoFormat('D MMMM YYYY') }}<br>
    Le Doyen de la Faculté des Sciences et Techniques de Marrakech
</div></div>
<br><br>
<div style="text-align:center; font-size:10px; margin-top:8px; font-style:italic;">
    Avis important : Il ne peut être délivré qu'un seul exemplaire du présent relevé de note.
    Aucun duplicata ne sera fourni.
</div>

</body>
</html>