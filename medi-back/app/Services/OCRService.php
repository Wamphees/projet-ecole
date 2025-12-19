<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use thiagoalessio\TesseractOCR\TesseractOCR;
use Smalot\PdfParser\Parser as PdfParser;

class OCRService
{
    /**
     * Extraire le texte d'un fichier (PDF ou image)
     */
    public function extractText(string $filePath, string $mimeType): ?string
    {
        try {
            // Si c'est un PDF, essayer d'abord d'extraire le texte natif
            if ($mimeType === 'application/pdf') {
                $text = $this->extractFromPdf($filePath);

                // Si le PDF contient du texte, on le retourne
                if ($text && strlen(trim($text)) > 50) {
                    return $this->cleanText($text);
                }

                // Sinon, c'est probablement un PDF scanné, on utilise OCR
                Log::info('PDF sans texte natif, utilisation de l\'OCR');
            }

            // Pour les images ou PDF scannés, utiliser Tesseract OCR
            if ($this->isImageOrScannedPdf($mimeType)) {
                return $this->extractWithOCR($filePath);
            }

            return null;

        } catch (\Exception $e) {
            Log::error('OCR Error', [
                'file' => $filePath,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Extraire le texte natif d'un PDF (sans OCR)
     */
    private function extractFromPdf(string $filePath): ?string
    {
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($filePath);
            $text = $pdf->getText();

            return $text ?: null;

        } catch (\Exception $e) {
            Log::warning('PDF parsing failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Extraire le texte avec Tesseract OCR
     */
    private function extractWithOCR(string $filePath): ?string
    {
        try {
            $ocr = new TesseractOCR($filePath);

            // Configurer Tesseract pour le français et l'anglais
            $ocr->lang('fra', 'eng');

            // Optimisations pour documents médicaux
            $ocr->psm(6); // Assume uniform block of text

            $text = $ocr->run();

            return $this->cleanText($text);

        } catch (\Exception $e) {
            Log::error('Tesseract OCR Error', [
                'file' => $filePath,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Nettoyer le texte extrait
     */
    private function cleanText(string $text): string
    {
        // Supprimer les espaces multiples
        $text = preg_replace('/\s+/', ' ', $text);

        // Supprimer les caractères spéciaux étranges
        $text = preg_replace('/[^\p{L}\p{N}\s\-.,;:!()?]/u', '', $text);

        // Trim
        $text = trim($text);

        return $text;
    }

    /**
     * Vérifier si le fichier est une image ou un PDF scanné
     */
    private function isImageOrScannedPdf(string $mimeType): bool
    {
        return in_array($mimeType, [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/pdf',
        ]);
    }

    /**
     * Extraire les informations structurées d'une ordonnance
     * (médicaments, posologie, etc.)
     */
    public function extractPrescriptionData(string $text): array
    {
        $data = [
            'medications' => [],
            'date' => null,
            'doctor_name' => null,
        ];

        // Extraire les médicaments (patterns communs)
        // Ex: "Paracétamol 1g" ou "Doliprane 500mg"
        preg_match_all(
            '/([A-Z][a-zéèêà]+)\s*(\d+\s*(mg|g|ml))/i',
            $text,
            $matches
        );

        if (!empty($matches[0])) {
            foreach ($matches[0] as $medication) {
                $data['medications'][] = trim($medication);
            }
        }

        // Extraire la date (format DD/MM/YYYY ou DD-MM-YYYY)
        preg_match('/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/', $text, $dateMatch);
        if (!empty($dateMatch[0])) {
            $data['date'] = $dateMatch[0];
        }

        return $data;
    }

    /**
     * Extraire les valeurs d'analyses médicales
     */
    public function extractLabResults(string $text): array
    {
        $results = [];

        // Patterns communs pour les analyses
        // Ex: "Glycémie: 1.2 g/L" ou "Cholestérol total : 2.5 g/L"
        preg_match_all(
            '/([A-Zéèêà][a-zéèêà\s]+)\s*[:=]\s*([\d.,]+)\s*([a-zA-Z\/]+)/i',
            $text,
            $matches,
            PREG_SET_ORDER
        );

        foreach ($matches as $match) {
            $results[] = [
                'name' => trim($match[1]),
                'value' => trim($match[2]),
                'unit' => trim($match[3]),
            ];
        }

        return $results;
    }

    /**
     * Détecter le type de document à partir du texte
     */
    public function detectDocumentType(string $text): string
    {
        $text = strtolower($text);

        // Mots-clés pour détecter le type
        if (
            str_contains($text, 'ordonnance') ||
            str_contains($text, 'prescription') ||
            str_contains($text, 'posologie')
        ) {
            return 'ordonnance';
        }

        if (
            str_contains($text, 'analyse') ||
            str_contains($text, 'laboratoire') ||
            str_contains($text, 'résultat') ||
            str_contains($text, 'glycémie') ||
            str_contains($text, 'cholestérol')
        ) {
            return 'analyse';
        }

        if (
            str_contains($text, 'radiographie') ||
            str_contains($text, 'scanner') ||
            str_contains($text, 'irm') ||
            str_contains($text, 'échographie')
        ) {
            return 'imagerie';
        }

        if (
            str_contains($text, 'consultation') ||
            str_contains($text, 'compte-rendu') ||
            str_contains($text, 'examen clinique')
        ) {
            return 'compte_rendu';
        }

        return 'autre';
    }
}
