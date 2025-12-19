<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Storage;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_id',
        'status',
        'medications',
        'instructions',
        'file_path',
        'generated_by_ai',
        'ai_prompt',
        'version',
        'parent_id',
        'validated_at',
    ];

    protected $casts = [
        'medications' => 'array',
        'generated_by_ai' => 'boolean',
        'validated_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Statuts possibles
     */
    const STATUS_DRAFT = 'draft';
    const STATUS_VALIDATED = 'validated';
    const STATUS_CANCELLED = 'cancelled';

    const STATUSES = [
        self::STATUS_DRAFT => 'Brouillon',
        self::STATUS_VALIDATED => 'Validée',
        self::STATUS_CANCELLED => 'Annulée',
    ];

    // ==================== RELATIONS ====================

    /**
     * Patient concerné
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Médecin prescripteur
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    /**
     * Rendez-vous associé (optionnel)
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    /**
     * Ordonnance parente (si c'est une correction)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Prescription::class, 'parent_id');
    }

    /**
     * Corrections/versions de cette ordonnance
     */
    public function corrections(): HasMany
    {
        return $this->hasMany(Prescription::class, 'parent_id');
    }

    /**
     * Logs d'accès
     */
    public function accessLogs(): MorphMany
    {
        return $this->morphMany(DocumentAccessLog::class, 'document');
    }

    // ==================== ACCESSORS ====================

    /**
     * URL du PDF
     */
    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::url($this->file_path) : null;
    }

    /**
     * Label du statut
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? 'Inconnu';
    }

    /**
     * Nombre de médicaments
     */
    public function getMedicationsCountAttribute(): int
    {
        return count($this->medications ?? []);
    }

    /**
     * Est validée ?
     */
    public function getIsValidatedAttribute(): bool
    {
        return $this->status === self::STATUS_VALIDATED;
    }

    /**
     * Est en brouillon ?
     */
    public function getIsDraftAttribute(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Est annulée ?
     */
    public function getIsCancelledAttribute(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * Référence unique (ex: ORD-2024-00123)
     */
    public function getReferenceAttribute(): string
    {
        return 'ORD-' . date('Y', strtotime($this->created_at)) . '-' . str_pad($this->id, 5, '0', STR_PAD_LEFT);
    }

    // ==================== SCOPES ====================

    /**
     * Ordonnances validées uniquement
     */
    public function scopeValidated($query)
    {
        return $query->where('status', self::STATUS_VALIDATED);
    }

    /**
     * Brouillons uniquement
     */
    public function scopeDrafts($query)
    {
        return $query->where('status', self::STATUS_DRAFT);
    }

    /**
     * Ordonnances d'un patient
     */
    public function scopeForPatient($query, int $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Ordonnances d'un médecin
     */
    public function scopeByDoctor($query, int $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Générées par IA
     */
    public function scopeGeneratedByAi($query)
    {
        return $query->where('generated_by_ai', true);
    }

    /**
     * Ordonnances récentes
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Dernière version d'une ordonnance (pas de corrections)
     */
    public function scopeLatestVersions($query)
    {
        return $query->whereNull('parent_id');
    }

    // ==================== MÉTHODES ====================

    /**
     * Valider l'ordonnance
     */
    public function validate(): bool
    {
        if ($this->status === self::STATUS_VALIDATED) {
            return false; // Déjà validée
        }

        return $this->update([
            'status' => self::STATUS_VALIDATED,
            'validated_at' => now(),
        ]);
    }

    /**
     * Annuler l'ordonnance
     */
    public function cancel(): bool
    {
        return $this->update([
            'status' => self::STATUS_CANCELLED,
        ]);
    }

    /**
     * Créer une correction/nouvelle version
     */
    public function createCorrection(array $data): Prescription
    {
        return self::create([
            'patient_id' => $this->patient_id,
            'doctor_id' => $this->doctor_id,
            'appointment_id' => $this->appointment_id,
            'medications' => $data['medications'] ?? $this->medications,
            'instructions' => $data['instructions'] ?? $this->instructions,
            'status' => self::STATUS_DRAFT,
            'version' => $this->version + 1,
            'parent_id' => $this->id,
        ]);
    }

    /**
     * Vérifier si un utilisateur peut voir cette ordonnance
     */
    public function canBeViewedBy(User $user): bool
    {
        // Admin peut tout voir
        if ($user->role === 'admin') {
            return true;
        }

        // Patient peut voir ses ordonnances validées
        if ($user->id === $this->patient_id) {
            return $this->is_validated;
        }

        // Médecin prescripteur peut tout voir
        if ($user->id === $this->doctor_id) {
            return true;
        }

        // Autres médecins peuvent voir les ordonnances validées de leurs patients
        if ($user->role === 'doctor') {
            // TODO: Vérifier si le médecin suit ce patient
            return $this->is_validated;
        }

        return false;
    }

    /**
     * Logger un accès
     */
    public function logAccess(User $user, string $action): void
    {
        DocumentAccessLog::create([
            'document_type' => 'prescription',
            'document_id' => $this->id,
            'user_id' => $user->id,
            'action' => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Supprimer avec le fichier PDF
     */
    public function deleteWithFile(): bool
    {
        if ($this->file_path && Storage::exists($this->file_path)) {
            Storage::delete($this->file_path);
        }

        return $this->delete();
    }

    /**
     * Formater les médicaments pour l'affichage
     */
    public function getFormattedMedications(): array
    {
        return array_map(function ($med) {
            return [
                'medication' => $med['medication'] ?? 'N/A',
                'dosage' => $med['dosage'] ?? 'N/A',
                'frequency' => $med['frequency'] ?? 'N/A',
                'duration' => $med['duration'] ?? 'N/A',
                'instructions' => $med['instructions'] ?? '',
            ];
        }, $this->medications ?? []);
    }
}
