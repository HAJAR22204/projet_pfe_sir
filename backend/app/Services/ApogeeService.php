<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ApogeeService
{
    protected $connection = 'apogee';

    public function verifierEtudiant($cne, $codeApogee, $nom, $prenom)
    {
        return DB::connection($this->connection)
            ->table('ETUDIANTS')
            ->where('CNE', $cne)
            ->where('CODE_APOGEE', $codeApogee)
            ->where('NOM', $nom)
            ->where('PRENOM', $prenom)
            ->first();
    }

    public function getInfosEtudiant($codeApogee)
    {
        return DB::connection($this->connection)
            ->table('ETUDIANTS')
            ->where('CODE_APOGEE', $codeApogee)
            ->first();
    }

    public function getFiliere($codeFiliere)
    {
        return DB::connection($this->connection)
            ->table('FILIERES')
            ->where('CODE_FILIERE', $codeFiliere)
            ->first();
    }

    public function getNotesParSemestre($codeApogee, $semestre)
    {
        return DB::connection($this->connection)
            ->table('NOTES')
            ->join('MODULES', 'NOTES.CODE_MODULE', '=', 'MODULES.CODE_MODULE')
            ->where('NOTES.CODE_APOGEE', $codeApogee)
            ->where('MODULES.SEMESTRE', $semestre)
            ->select('MODULES.NOM_MODULE', 'NOTES.NOTE', 'MODULES.CODE_MODULE')
            ->get();
    }

    public function getMoyenneSemestre($codeApogee, $semestre)
    {
        return DB::connection($this->connection)
            ->table('MOYENNES_SEMESTRES')
            ->where('CODE_APOGEE', $codeApogee)
            ->where('SEMESTRE', $semestre)
            ->first();
    }

    public function getMoyenneGenerale($codeApogee)
    {
        return DB::connection($this->connection)
            ->table('MOYENNE_GENERALE')
            ->where('CODE_APOGEE', $codeApogee)
            ->first();
    }

    public function getToutesLesNotes($codeApogee)
    {
        return DB::connection($this->connection)
            ->table('NOTES')
            ->join('MODULES', 'NOTES.CODE_MODULE', '=', 'MODULES.CODE_MODULE')
            ->where('NOTES.CODE_APOGEE', $codeApogee)
            ->select('MODULES.NOM_MODULE', 'MODULES.SEMESTRE', 'NOTES.NOTE', 'MODULES.CODE_MODULE')
            ->orderBy('MODULES.SEMESTRE')
            ->orderBy('MODULES.CODE_MODULE')
            ->get();
    }

    public function getToutesMoyennesSemestres($codeApogee)
    {
        return DB::connection($this->connection)
            ->table('MOYENNES_SEMESTRES')
            ->where('CODE_APOGEE', $codeApogee)
            ->orderBy('SEMESTRE')
            ->get();
    }

    public function getDiplome($codeApogee)
    {
        return DB::connection($this->connection)
            ->table('DIPLOMES')
            ->where('CODE_APOGEE', $codeApogee)
            ->first();
    }

    public function getAnneeUniversitaireActuelle()
    {
        $annee = date('Y');
        $mois = date('m');
        
        if ($mois >= 9) {
            return $annee . '-' . ($annee + 1);
        } else {
            return ($annee - 1) . '-' . $annee;
        }
    }
    public function getAnneeUniversitaireParSemestre($codeApogee, $semestre)
{
    $inscription = DB::connection('apogee')
        ->table('INSCRIPTIONS')
        ->where('CODE_APOGEE', $codeApogee)
        ->where('SEMESTRE', intval($semestre))
        ->first();

    return $inscription->ANNEE_UNIVERSITAIRE ?? null;
}
    public function getAnneeUniversitaireEtudiant($codeApogee)
{
    $inscription = DB::connection($this->connection)
        ->table('INSCRIPTIONS')
        ->where('CODE_APOGEE', $codeApogee)
        ->where('STATUT', 'VALIDE')
        ->orderBy('ANNEE_UNIVERSITAIRE', 'desc')
        ->first();

    return $inscription->ANNEE_UNIVERSITAIRE ?? null;
}
}
