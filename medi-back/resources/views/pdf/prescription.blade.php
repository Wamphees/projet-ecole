<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ordonnance - {{ $reference }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #333;
            padding: 40px;
        }

        .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .doctor-info {
            text-align: right;
            margin-bottom: 15px;
        }

        .doctor-info h2 {
            color: #2563eb;
            font-size: 18pt;
            margin-bottom: 5px;
        }

        .doctor-info p {
            font-size: 10pt;
            color: #666;
            margin: 2px 0;
        }

        .prescription-title {
            text-align: center;
            font-size: 20pt;
            font-weight: bold;
            color: #2563eb;
            margin: 20px 0;
            text-transform: uppercase;
        }

        .patient-section {
            background-color: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin-bottom: 30px;
        }

        .patient-section h3 {
            color: #2563eb;
            font-size: 14pt;
            margin-bottom: 10px;
        }

        .patient-section p {
            margin: 5px 0;
            font-size: 11pt;
        }

        .medications-section {
            margin-bottom: 30px;
        }

        .medications-section h3 {
            background-color: #2563eb;
            color: white;
            padding: 10px 15px;
            font-size: 14pt;
            margin-bottom: 15px;
        }

        .medication {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #fafafa;
        }

        .medication-name {
            font-size: 14pt;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
        }

        .medication-details {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }

        .medication-row {
            display: table-row;
        }

        .medication-label {
            display: table-cell;
            width: 30%;
            font-weight: 600;
            color: #666;
            padding: 3px 0;
        }

        .medication-value {
            display: table-cell;
            color: #333;
            padding: 3px 0;
        }

        .medication-instructions {
            margin-top: 8px;
            padding: 8px;
            background-color: #fff3cd;
            border-left: 3px solid #ffc107;
            font-style: italic;
            font-size: 10pt;
        }

        .instructions-section {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 30px;
        }

        .instructions-section h3 {
            color: #0369a1;
            font-size: 13pt;
            margin-bottom: 10px;
        }

        .instructions-section p {
            font-size: 11pt;
            line-height: 1.8;
        }

        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
        }

        .signature-section {
            text-align: right;
            margin-top: 40px;
        }

        .signature-section p {
            margin: 5px 0;
            font-size: 10pt;
        }

        .signature-line {
            margin-top: 50px;
            border-top: 1px solid #333;
            width: 200px;
            display: inline-block;
        }

        .metadata {
            font-size: 9pt;
            color: #999;
            text-align: center;
            margin-top: 30px;
        }

        .reference {
            font-weight: bold;
            color: #2563eb;
        }

        @page {
            margin: 2cm;
        }
    </style>
</head>
<body>
    <!-- En-tête avec informations du médecin -->
    <div class="header">
        <div class="doctor-info">
            <h2>Dr {{ $doctor->name }}</h2>
            <p><strong>Spécialité :</strong> {{ $doctor->specialty ?? 'Médecine Générale' }}</p>
            @if(isset($doctor->email))
            <p><strong>Email :</strong> {{ $doctor->email }}</p>
            @endif
            @if(isset($doctor->phone))
            <p><strong>Tél :</strong> {{ $doctor->phone }}</p>
            @endif
        </div>
    </div>

    <!-- Titre de l'ordonnance -->
    <div class="prescription-title">
        Ordonnance Médicale
    </div>

    <!-- Informations du patient -->
    <div class="patient-section">
        <h3>Patient</h3>
        <p><strong>Nom :</strong> {{ $patient->name }}</p>
        @if(isset($patient->date_of_birth))
        <p><strong>Date de naissance :</strong> {{ \Carbon\Carbon::parse($patient->date_of_birth)->format('d/m/Y') }}</p>
        @endif
        <p><strong>Date de consultation :</strong> {{ $date }}</p>
    </div>

    <!-- Liste des médicaments -->
    <div class="medications-section">
        <h3>Prescription</h3>

        @foreach($medications as $index => $med)
        <div class="medication">
            <div class="medication-name">
                {{ $index + 1 }}. {{ $med['medication'] }}
            </div>

            <div class="medication-details">
                <div class="medication-row">
                    <div class="medication-label">Posologie :</div>
                    <div class="medication-value">{{ $med['dosage'] }}</div>
                </div>
                <div class="medication-row">
                    <div class="medication-label">Fréquence :</div>
                    <div class="medication-value">{{ $med['frequency'] }}</div>
                </div>
                <div class="medication-row">
                    <div class="medication-label">Durée :</div>
                    <div class="medication-value">{{ $med['duration'] }}</div>
                </div>
            </div>

            @if(!empty($med['instructions']))
            <div class="medication-instructions">
                <strong>⚠️ Instructions :</strong> {{ $med['instructions'] }}
            </div>
            @endif
        </div>
        @endforeach
    </div>

    <!-- Instructions générales -->
    @if(!empty($prescription->instructions))
    <div class="instructions-section">
        <h3>Instructions générales</h3>
        <p>{{ $prescription->instructions }}</p>
    </div>
    @endif

    <!-- Pied de page et signature -->
    <div class="footer">
        <div class="signature-section">
            <p>Fait à {{ config('app.city', 'Ville') }}, le {{ $date }}</p>
            <p style="margin-top: 60px;">
                <span class="signature-line"></span>
            </p>
            <p><strong>Dr {{ $doctor->name }}</strong></p>
        </div>

        <div class="metadata">
            <p>Référence : <span class="reference">{{ $reference }}</span></p>
            <p>Document généré le {{ now()->format('d/m/Y à H:i') }}</p>
            @if($prescription->generated_by_ai)
            <p style="font-size: 8pt; color: #999;">Ordonnance assistée par IA</p>
            @endif
        </div>
    </div>
</body>
</html>
