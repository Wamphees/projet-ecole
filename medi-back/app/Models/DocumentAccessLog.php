<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DocumentAccessLog extends Model
{
    use HasFactory;

    /**
     * Pas de timestamps automatiques (on utilise accessed_at)
     */
    public $timestamps = false;

    protected $fillable = [
        'document_type',
        'document_id',
        'user_id',
        'action',
        'ip_address',
        'user_agent',
        'accessed_at',
    ];

    protected $casts = [
        'accessed_at' => 'datetime',
    ];

    /**
     * Actions possibles
     */
    const ACTION_VIEW = 'view';
    const ACTION_DOWNLOAD = 'download';
    const ACTION_DELETE = 'delete';
    const ACTION_CREATE = 'create';
    const ACTION_UPDATE = 'update';

    const ACTIONS = [
        self::ACTION_VIEW => 'Consultation',
        self::ACTION_DOWNLOAD => 'Téléchargement',
        self::ACTION_DELETE => 'Suppression',
        self::ACTION_CREATE => 'Création',
        self::ACTION_UPDATE => 'Modification',
    ];

    // ==================== RELATIONS ====================

    /**
     * Utilisateur qui a effectué l'action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Document concerné (polymorphic)
     * Peut être soit PatientDocument soit Prescription
     */
    public function document(): MorphTo
    {
        return $this->morphTo('document', 'document_type', 'document_id');
    }

    // ==================== ACCESSORS ====================

    /**
     * Label de l'action
     */
    public function getActionLabelAttribute(): string
    {
        return self::ACTIONS[$this->action] ?? 'Inconnue';
    }

    /**
     * Nom du modèle de document
     */
    public function getDocumentModelAttribute(): string
    {
        return match($this->document_type) {
            'patient_document' => 'Document patient',
            'prescription' => 'Ordonnance',
            default => 'Inconnu',
        };
    }

    // ==================== SCOPES ====================

    /**
     * Logs d'un utilisateur spécifique
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Logs d'un document spécifique
     */
    public function scopeForDocument($query, string $documentType, int $documentId)
    {
        return $query->where('document_type', $documentType)
                     ->where('document_id', $documentId);
    }

    /**
     * Logs d'une action spécifique
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Logs récents
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('accessed_at', '>=', now()->subDays($days));
    }

    /**
     * Logs d'aujourd'hui
     */
    public function scopeToday($query)
    {
        return $query->whereDate('accessed_at', today());
    }

    /**
     * Logs par IP
     */
    public function scopeFromIp($query, string $ip)
    {
        return $query->where('ip_address', $ip);
    }

    // ==================== MÉTHODES STATIQUES ====================

    /**
     * Logger une action sur un PatientDocument
     */
    public static function logPatientDocument(
        PatientDocument $document,
        User $user,
        string $action
    ): self {
        return self::create([
            'document_type' => 'patient_document',
            'document_id' => $document->id,
            'user_id' => $user->id,
            'action' => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Logger une action sur une Prescription
     */
    public static function logPrescription(
        Prescription $prescription,
        User $user,
        string $action
    ): self {
        return self::create([
            'document_type' => 'prescription',
            'document_id' => $prescription->id,
            'user_id' => $user->id,
            'action' => $action,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Obtenir les statistiques d'accès pour un document
     */
    public static function getDocumentStats(string $documentType, int $documentId): array
    {
        $logs = self::forDocument($documentType, $documentId)->get();

        return [
            'total_accesses' => $logs->count(),
            'unique_users' => $logs->pluck('user_id')->unique()->count(),
            'by_action' => $logs->groupBy('action')->map->count(),
            'last_accessed' => $logs->max('accessed_at'),
            'most_active_user' => $logs->groupBy('user_id')
                                      ->map->count()
                                    //   ->keys()
                                    //   ->first(),
                                      //   ->sortDesc()
        ];
    }

    /**
     * Obtenir l'activité d'un utilisateur
     */
    public static function getUserActivity(int $userId, int $days = 30): array
    {
        $logs = self::forUser($userId)->recent($days)->get();

        return [
            'total_actions' => $logs->count(),
            'documents_accessed' => $logs->pluck('document_id')->unique()->count(),
            'by_action' => $logs->groupBy('action')->map->count(),
            'by_document_type' => $logs->groupBy('document_type')->map->count(),
            'last_activity' => $logs->max('accessed_at'),
        ];
    }

    /**
     * Détecter les activités suspectes
     * (ex: trop d'accès en peu de temps)
     */
    public static function detectSuspiciousActivity(int $userId, int $minutes = 5): bool
    {
        $recentLogs = self::forUser($userId)
            ->where('accessed_at', '>=', now()->subMinutes($minutes))
            ->count();

        // Plus de 50 accès en 5 minutes = suspect
        return $recentLogs > 50;
    }
}
