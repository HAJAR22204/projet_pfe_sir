<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page {
    margin: 5mm;
}
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            color: #000;
        }

        .ar {
            font-family: 'DejaVuSans', serif;
            direction: rtl;
            text-align: right;
            unicode-bidi: embed;
        }

        .titre-ar {
            font-family: 'DejaVuSans', serif;
            direction: rtl;
            text-align: center;
            font-size: 17px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .titre-fr {
            text-align: center;
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .divider {
            border: none;
            border-top: 1px solid #000;
            margin: 6px 0;
        }

        .texte-legal {
            font-size: 8px;
            line-height: 1.6;
            text-align: justify;
        }

        .note-bas {
            text-align: center;
            font-size: 9px;
            font-style: italic;
            margin-top: 8px;
            border-top: 1px solid #000;
            padding-top: 6px;
        }

        .serie-vertical {
            position: absolute;
            left: 0;
            top: 45%;
            font-size: 9px;
            font-weight: bold;
            letter-spacing: 1px;
            transform: rotate(90deg);
        }

        .header-uca-logo {
            text-align: center;
            vertical-align: middle;
        }

        .header-marrakech {
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 2px;
            text-align: center;
            margin-top: 3px;
        }

        .header-uca-nom-fr {
            font-size: 7px;
            letter-spacing: 0.4px;
            text-align: center;
            margin-top: 2px;
        }

        .header-inst-fr,
        .header-inst-ar {
            font-size: 10px;
            line-height: 1.65;
            text-align: center;
            vertical-align: middle;
            font-weight: bold;
        }

        .header-inst-ar {
            font-family: 'DejaVuSans', serif;
            direction: rtl;
        }

        .header-embleme {
            text-align: center;
            vertical-align: top;
        }

        .header-royaume-fr {
            font-size: 7px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-align: center;
            margin-top: 2px;
        }

        .header-tifinagh {
            font-family: 'dejavusans', sans-serif;
            font-size: 8px;
            text-align: center;
            margin-top: 2px;
            direction: ltr;
        }

        .texte-legal-ar {
    font-family: 'DejaVuSans', serif;
    direction: rtl;
    unicode-bidi: embed;
    font-size: 8px;
    line-height: 1.45;
    text-align: right;
    padding-right: 5px;
}

        .corps-ar {
            font-family: 'DejaVuSans', serif;
            direction: rtl;
            font-size: 10px;
            line-height: 2.15;
            text-align: right;
        }
    </style>
</head>
<body>

@php
    $nomComplet = strtoupper($etudiant->NOM ?? '') . ' ' . ucfirst(strtolower($etudiant->PRENOM ?? ''));
    $filiereLibelle = $filiere->NOM_FILIERE ?? $filiere->LIBELLE_FILIERE ?? $filiere->CODE_FILIERE ?? '';
    $filiereAffichage = $filiereLibelle;
    if (!empty($filiere->CODE_FILIERE) && $filiereLibelle !== ($filiere->CODE_FILIERE ?? '')) {
        $filiereAffichage = $filiereLibelle . ' -(' . $filiere->CODE_FILIERE . ')';
    }
    $dateNaissanceFr = $etudiant->DATE_NAISSANCE
        ? \Carbon\Carbon::parse($etudiant->DATE_NAISSANCE)->locale('fr')->isoFormat('D MMMM YYYY')
        : '';
    $dateNaissanceAr = $etudiant->DATE_NAISSANCE
        ? \Carbon\Carbon::parse($etudiant->DATE_NAISSANCE)->locale('ar')->isoFormat('D MMMM YYYY')
        : '';
    $dateDelibCourt = $diplome?->DATE_OBTENTION
        ? \Carbon\Carbon::parse($diplome->DATE_OBTENTION)->format('d/m/Y')
        : '';
@endphp


    {{-- En-tête officiel : 4 colonnes (UCA | FR | AR | Blason) --}}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:6px;">
        <tr>
            {{-- 1. Logo université --}}
            <td width="19%" class="header-uca-logo">
                <img src="{{ public_path('logo_fst_nobg.png') }}"
                     style="width:130px; height:auto;" ><br>
            </td>

            {{-- 2. Texte institutionnel français --}}
            <td width="27%" class="header-inst-fr">
                Royaume du Maroc<br>
                Ministère de l'Enseignement Supérieur,<br>
                de la Recherche Scientifique<br>
                et de l'Innovation<br>
                Université Cadi Ayyad - Marrakech<br>
                <span style="font-size:9px;"><strong>Faculté des Sciences et Techniques Gueliz - Marrakech</span></strong>
            </td>

            {{-- 3. Texte institutionnel arabe --}}
            <td width="27%" class="header-inst-ar" lang="ar">
                المملكة المغربية<br>
                وزارة التعليم العالي والبحث العلمي<br>
                والابتكار<br>
                جامعة القاضي عياض - مراكش<br>
                <strong><span style="font-size:9px;"></strong>كلية العلوم والتقنيات مراكش<strong></span></strong>
            </td>

            {{-- 4. Emblème du Royaume --}}
            <td width="19%" class="header-embleme">
                <img src="{{ public_path('royaume_maroc.png') }}"
                     style="width:105px; height:auto;"><br>
            </td>
        </tr>
    </table>


    {{-- Titre bilingue --}}
    <div style="margin: 14px 0 10px 0;">
        <div class="titre-ar" lang="ar">
            دبلوم الدراسات الجامعية في العلوم والتقنيات
        </div>
        <div class="titre-fr">
            Diplôme d'Etudes Universitaires Scientifiques et Techniques
        </div>
    </div>


    {{-- Texte légal (2 colonnes FR / AR) --}}
    <table width="100%" style="margin: 10px 0;">
        <tr>
            <td width="52%" style="vertical-align:top; padding-right:10px;">
                <div class="texte-legal">
                    Vu la loi n° 01-00 portant organisation de l'enseignement supérieur promulguée par
                    le dahir n°1-00-199 du 15 safar 1421 (19 mai 2000) notamment son article 3 ;<br>
                    Vu le décret n° 2.13.841 du 11 rabia I 1435 (13 janvier 2014), modifiant et complétant le
                    décret n°2-04-89 du 18 rabii II 1425 (7 juin 2004) fixant la vocation des établissements
                    universitaires, les cycles des études supérieures ainsi que les diplômes nationaux
                    correspondants.<br>
                    Vu l'arrêté du Ministère de l'Enseignement Supérieur, de la Recherche Scientifique et de la
                    Formation des Cadres n° 2084-14 du 5 hija 1435 (30 septembre 2014) approuvant le cahier
                    des normes pédagogiques nationales du cycle de la licence en sciences et techniques.<br>
                    Vu le procès-verbal de la commission des délibérations du : {{ $dateDelibCourt }}
                </div>
            </td>

            <td width="48%" style="vertical-align:top; padding-left:15px;">
                <div  class="texte-legal-ar" lang="ar">
                    بناء على القانون رقم 01.00 المتعلق بتنظيم التعليم العالي الصادر بتنفيذه الظهير الشريف رقم 1.00.199 بتاريخ 15 صفر 1421 (19 ماي 2000)،</div><br>
<div class="texte-legal-ar" lang="ar">ولاسيما المادة 3 منه؛<br></div>

وبناء على المرسوم رقم 2.13.841 الصادر في 11 ربيع الأول 1435 (13 يناير 2014)، القاضي بتغيير وتتميم المرسوم رقم 2.04.89 الصادر في 18 ربيع
الثاني 1425 (7 يونيو 2004)، المتعلق بتحديد اختصاص المؤسسات الجامعية وأسلاك الدراسات العليا وكذا الشهادات الوطنية المطابقة؛<br>

وبناء على قرار وزير التعليم العالي والبحث العلمي وتكوين الأطر رقم 2084.14 الصادر في 5 ذي الحجة 1435 (30 شتنبر 2014)، المتعلق بالمصادقة
على دفتر الضوابط البيداغوجية الوطنية لسلك الإجازة في العلوم والتقنيات؛<br>

وبعد الاطلاع على محضر لجنة المداولات بتاريخ :
                    {{ $dateDelibCourt }}
                </div>
            </td>
        </tr>
    </table>



    {{-- Corps du diplôme (2 colonnes) --}}
    <table width="100%" style="margin-top:10px;">
        <tr>
            <td width="52%" style="vertical-align:top; font-size:11px;
                line-height:2; padding-right:10px;">

                <strong>Le Président de l'Université Cadi Ayyad atteste</strong><br><br>

                que &nbsp;&nbsp;&nbsp;
                @if(($etudiant->GENRE ?? '') === 'F') Mademoiselle @else Monsieur @endif
                <strong>
                    {{ $nomComplet }}
                </strong><br>

                Né{{ ($etudiant->GENRE ?? '') === 'F' ? 'e' : '' }} le :
                {{ $dateNaissanceFr }}
                @if($etudiant->LIEU_NAISSANCE ?? null)
                    à {{ $etudiant->LIEU_NAISSANCE }}
                @endif
                <br>

                N° Carte d'identité nationale :
                <strong>{{ $etudiant->CIN ?? '' }}</strong><br>

                CNE : <strong>{{ $etudiant->CNE ?? '' }}</strong><br><br>

                a obtenu le
                <strong>DIPLÔME D'ÉTUDES UNIVERSITAIRES SCIENTIFIQUES ET TECHNIQUES</strong><br>

                Filière :
                <strong>{{ $filiereAffichage }}</strong><br>

                Mention :
                <strong>{{ $diplome?->MENTION ?? '' }}</strong>

            </td>

            <td width="48%" style="vertical-align:top; padding-left:10px;">
                <div class="ar corps-ar" lang="ar">

                    <strong>يشهد رئيس جامعة القاضي عياض</strong><br><br>

                    أن<br>

                    <strong>{{ $nomComplet }}</strong><br>

                    المولود{{ ($etudiant->GENRE ?? '') === 'F' ? 'ة' : '' }} في :
                    {{ $dateNaissanceAr }}
                    @if($etudiant->LIEU_NAISSANCE ?? null)
                        ب {{ $etudiant->LIEU_NAISSANCE }}
                    @endif
                    <br>

                    رقم بطاقة التعريف الوطنية :
                    <strong>{{ $etudiant->CIN ?? '' }}</strong><br>

                    الرقم الوطني للطالب :
                    <strong>{{ $etudiant->CNE ?? '' }}</strong><br><br>

                    أحرز{{ ($etudiant->GENRE ?? '') === 'F' ? 'ت' : '' }}
                    على دبلوم الدراسات الجامعية في العلوم والتقنيات<br>

                    مسلك :
                    <strong>{{ $filiereAffichage }}</strong><br>

                    بميزة :
                    <strong>{{ $mention_ar }}</strong>

                </div>
            </td>
        </tr>
    </table>

    {{-- Date de délivrance --}}
    <div style="text-align:center; margin-top:14px; font-size:11px;">
        Marrakech le :
        <strong>{{ $date_emission_fr }}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span class="ar" lang="ar" style="font-size:11px;">
            مراكش في : <strong>{{ $date_emission_ar }}</strong>
        </span>
    </div>

    {{-- Signatures --}}
    <table width="100%" style="margin-top:22px;">
        <tr>
            <td width="33%" style="text-align:center; font-size:11px; vertical-align:top;">
                Le Président &nbsp;&nbsp;
                <span class="ar" lang="ar" style="font-size:11px;">الرئيس</span>
                <div style="height:70px;"></div>
            </td>

            <td width="34%" style="text-align:center; vertical-align:top;">
                <div style="height:70px;"></div>
            </td>

            <td width="33%" style="text-align:center; font-size:11px; vertical-align:top;">
                Le Doyen &nbsp;&nbsp;
                <span class="ar" lang="ar" style="font-size:11px;">العميد</span>
                <div style="height:70px;"></div>
            </td>
        </tr>
    </table>

    {{-- Numéro diplôme --}}
    <table width="100%" style="margin-top:8px; font-size:10px;">
        <tr>
            <td width="50%">
                N° :
                <strong>{{ $annee_diplome }}/{{ $demande->code_apogee }}</strong>
            </td>
            <td width="50%" style="text-align:right;">
                <span class="ar" lang="ar">
                    : رقم
                    <strong>{{ $annee_diplome }}/{{ $demande->code_apogee }}</strong>
                </span>
            </td>
        </tr>
    </table>

    {{-- Note de bas de page --}}
    <div class="note-bas">
        <span class="ar" lang="ar" style="font-size:9px;">
            تنبيه : تسلم هذه الشهادة في نسخة واحدة، ويمكن عند الحاجة سحبها والمصادقة عليها من طرف السلطات المختصة
        </span>
    </div>

</body>
</html>
