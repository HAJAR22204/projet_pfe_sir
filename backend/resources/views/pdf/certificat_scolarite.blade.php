<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page {
            margin: 18mm 16mm 14mm 16mm;
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
            margin: 6px 0;
        }

        .titre {
            text-align: center;
            font-size: 17px;
            font-weight: bold;
            text-decoration: underline;
            margin: 45px 0 55px 0;
        }

        .corps {
            font-size: 12px;
            line-height: 2.5;
            margin-bottom: 10px;
        }

        .diplome-row {
            margin: 45px 0 10px 0;
            font-size: 12px;
            line-height: 2;
        }

        .diplome-row table { width: 80%; }
        .diplome-row td.dl { width: 80px; text-decoration: underline; }
        .diplome-row td.dv { padding-left: 20px; }

        .adresse-label { text-decoration: underline; }

        .anwan {
            font-family: 'dejavusans', sans-serif;
            direction: rtl;
            text-align: right;
            font-size: 11px;
            text-decoration: underline;
        }

        .note-bas {
            text-align: center;
            font-size: 9px;
            margin-top: 12px;
            font-style: italic;
        }
        .contenu-certificat {
    margin-left: 40px;
}
    </style>
</head>
<body>

@php
    $estEtranger = mb_strtolower(trim($etudiant->NATIONALITE ?? 'marocaine')) !== 'marocaine';
@endphp

    {{-- ── Header ── --}}
    <table width="100%" style="margin-bottom:4px;">
        <tr>
            {{-- Gauche : texte français --}}
            <td width="38%" style="font-size:10px; line-height:1.5; vertical-align:top;">
                ROYAUME DU MAROC<br>
                Université Cadi Ayyad<br>
                Faculté des Sciences et Techniques<br>
                Guéliz - Marrakech
            </td>

            {{-- Centre : logo --}}
            <td width="24%" style="text-align:center; vertical-align:middle;">
                <img src="{{ public_path('logo_fst_nobg.png') }}"
                     alt="FST"
                     style="width:75px; height:auto; margin-top:-5px;">
            </td>

            {{-- Droite : texte arabe aligné à droite --}}
            <td width="38%" style="font-size:10px; line-height:1.8; vertical-align:top; text-align:right;">
                <div class="ar" lang="ar">المملكة المغربية</div>
                <div class="ar" lang="ar">جامعة القاضي عياض</div>
                <div class="ar" lang="ar">كلية العلوم والتقنيات مراكش</div>
            </td>
        </tr>
    </table>


    {{-- ── Service ── --}}
    <table width="100%" style="margin-top:4px; margin-bottom:10px;">
        <tr>
            <td width="50%" style="font-size:11px; text-decoration:underline; vertical-align:top;">
                Service des Affaires Estudiantines
            </td>
            <td width="50%" style="text-align:right; font-size:11px; vertical-align:top;">
                <div class="ar" lang="ar" style="text-decoration:underline;">
                    مصلحة الشؤون الطلابية
                </div>
            </td>
        </tr>
    </table>

    {{-- ── Titre ── --}}
    <div class="titre">Certificat de scolarité</div>

    {{-- ── Corps ── --}}
<div class="contenu-certificat">
<div class="corps">
    Le Doyen de la Faculté des Sciences et Techniques de Marrakech atteste que l'étudiant(e) :
</div>

<div class="corps">
    @if(($etudiant->GENRE ?? '') === 'F') Mademoiselle @else Monsieur @endif
    <strong>
        {{ strtoupper($etudiant->NOM) }} {{ ucfirst(strtolower($etudiant->PRENOM)) }}
    </strong>
</div>

<div class="corps">
    @if($estEtranger)
        N° de passeport :
    @else
        Numéro de la carte d'identité nationale :
    @endif
    {{ $etudiant->CIN ?? '' }}
</div>

<div class="corps">
    Code national de l'étudiant(e) :
    {{ $etudiant->CNE }}
</div>

@if($etudiant->DATE_NAISSANCE ?? null)
<div class="corps">
    @if(($etudiant->GENRE ?? '') === 'F') née @else né @endif
    le {{ \Carbon\Carbon::parse($etudiant->DATE_NAISSANCE)->locale('fr')->isoFormat('D MMMM YYYY') }}
    @if($etudiant->LIEU_NAISSANCE ?? null)
        à {{ $etudiant->LIEU_NAISSANCE }}
        @if(!$estEtranger)
            ( MAROC )
        @endif
    @endif
</div>
@endif

<div class="corps">
    est régulièrement inscrit(e) à la Faculté des Sciences et Techniques
    Guéliz - Marrakech pour l'année universitaire
    {{ $annee_universitaire }}.
</div>

{{-- ── Diplôme + Filière / Année ── --}}
<div class="diplome-row">
    <table>
        <tr>
            <td class="dl">Diplôme :</td>
            <td class="dv">
                {{ $filiere->DIPLOME ?? '' }}
                {{ $filiere->NOM_FILIERE ?? $filiere->CODE_FILIERE ?? '' }}
            </td>
        </tr>
        <br>
        <tr>
            <td class="dl">Année :</td>
            <td class="dv">
                @php
                    $n = intval($etudiant->NBR_INSCRIPTIONS ?? 1);
                    $niveaux = [
                        1 => '1ère année',
                        2 => '2ème année',
                        3 => '3ème année',
                        4 => '4ème année',
                        5 => '5ème année',
                    ];
                    echo $niveaux[$n] ?? '1ère année';
                @endphp
            </td>
        </tr>
    </table>
</div>
</div>
{{-- ── Signature ── --}}
<table width="100%" style="margin-top:60px;">
    <tr>
        <td width="50%"></td>
        <td width="50%" style="text-align:right; font-size:12px;">

            {{-- "Fait à" au dessus --}}
            Fait à Marrakech, le
            {{ \Carbon\Carbon::now()->locale('fr')->isoFormat('D MMMM YYYY') }}

        </td>
    </tr>
</table>

{{-- Espace vide pour cachet et signature --}}
<div style="height:120px;"></div>

{{-- Code Apogée juste en dessous de l'espace --}}
<table width="100%">
    <tr>
        <td width="50%"></td>
        <td width="50%" style="text-align:right; font-size:11px;">
            {{ $demande->code_apogee }}
        </td>
    </tr>
</table>

    {{-- ── Bas de page ── --}}
    <div style="margin-top:10px; border-top:1px solid #000; padding-top:8px; font-size:10px;">
        <table width="100%">
            <tr>
                <td style="vertical-align:top; line-height:1.7;">
                    <span class="adresse-label">Adresse :</span>
                    B.P 549, Av. Abdelkarim Elkhattabi<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Guéliz - Marrakech<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    Tél : +212 524 43 34 04

                </td>
                <td style="text-align:right; vertical-align:top; line-height:1.7;">
                    <div class="anwan" lang="ar">: العنوان</div><br>
                    Fax : +212 524 43 31 70<br><br>
                </td>
            </tr>
        </table>
    </div>

    <div style="margin-top:10px; border-top:1px solid #000; padding-top:8px; font-size:10px;" class="note-bas">
        Le présent document n'est délivré qu'en un seul exemplaire.
    </div>

</body>
</html>