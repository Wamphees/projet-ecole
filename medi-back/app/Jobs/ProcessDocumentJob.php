<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

use App\Models\PatientDocument;
use App\Models\DocumentAccessLog;
use App\Services\OCRService;
use App\Services\DocumentClassificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ProcessDocumentJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(PatientDocument $document): void
    {
        try {
            $filePath = storage_path('app/public/' . $document->file_path);

            // 1. Extraire le texte avec OCR
            $extractedText = $this->ocrService->extractText($filePath, $document->mime_type);

            if (!$extractedText) {
                Log::warning('No text extracted from document', ['document_id' => $document->id]);
                return;
            }

            // 2. Classifier le document avec l'IA
            $classification = $this->classificationService->classify(
                $extractedText,
                $document->file_name
            );

            // 3. Mettre à jour le document
            $document->update([
                'extracted_text' => $extractedText,
                'document_type' => $classification['document_type'] ?? $document->document_type,
                'ai_tags' => $classification['tags'] ?? [],
            ]);

            Log::info('Document processed successfully', [
                'document_id' => $document->id,
                'type' => $classification['document_type'] ?? 'unknown',
                'tags' => $classification['tags'] ?? []
            ]);

        } catch (\Exception $e) {
            Log::error('Error processing document', [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
