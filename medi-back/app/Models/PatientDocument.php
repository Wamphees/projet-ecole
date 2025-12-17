<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use \App\Models\DocumentAccessLog;

class PatientDocument extends Model
{
    /**
     * Table associée
     */
    protected $table = 'patient_documents';

    /**
     * Champs fillable
     */
    protected $fillable = [
        'patient_id',
        'document_type',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'extracted_text',
        'ai_tags',
        'uploaded_by',
        'is_visible_to_patient',
        'uploaded_at',
    ];

    /**
     * Casts
     */
    protected $casts = [
        'ai_tags' => 'array',
        'is_visible_to_patient' => 'boolean',
        'uploaded_at' => 'datetime',
    ];

    /**
     * Relations
     */

    // Le patient propriétaire du document
    public function patient()
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    // L'utilisateur qui a uploadé le document
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // Logs d'accès
    public function accessLogs()
    {
        return $this->morphMany(DocumentAccessLog::class, 'document');
    }

    /**
     * Méthodes utiles
     */

    // Obtenir l'URL complète du fichier
    public function getFileUrl(): string
    {
        return Storage::url($this->file_path);
    }

    // Vérifier si c'est un PDF
    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    // Vérifier si c'est une image
    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    // Obtenir la taille formatée
    public function getFormattedSize(): string
    {
        $size = $this->file_size;

        if ($size < 1024) {
            return $size . ' B';
        } elseif ($size < 1048576) {
            return round($size / 1024, 2) . ' KB';
        } else {
            return round($size / 1048576, 2) . ' MB';
        }
    }

    // Logger un accès au document
    public function logAccess(int $userId, string $action): void
    {
        DocumentAccessLog::create([
            'document_type' => 'patient_document',
            'document_id' => $this->id,
            'user_id' => $userId,
            'action' => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Scopes
     */

    // Documents d'un patient spécifique
    public function scopeForPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    // Documents visibles par le patient
    public function scopeVisibleToPatient($query)
    {
        return $query->where('is_visible_to_patient', true);
    }

    // Documents par type
    public function scopeOfType($query, string $type)
    {
        return $query->where('document_type', $type);
    }

    // Recherche dans le texte extrait
    public function scopeSearch($query, string $searchTerm)
    {
        return $query->whereRaw('MATCH(extracted_text) AGAINST(? IN BOOLEAN MODE)', [$searchTerm]);
    }
}
