import "./attente.css";

export default function Attente() {
  return (
    <div className="app">

      {/* Main card */}
      <main className="container">
        <div className="card">
          <div className="video-icon">📹</div>

          <h2 className="title">
            En attente de <strong>Dr. Sarah Martin</strong>
          </h2>

          <div className="info-grid">
            <div className="info-box">
              <h3>3</h3>
              <p>Position dans la file</p>
            </div>

            <div className="info-box">
              <h3>8 min</h3>
              <p>Temps d'attente estimé</p>
            </div>
          </div>

          <button className="join-btn">Rejoindre l'appel</button>
        </div>

        {/* Connection test */}
        <div className="card">
          <h3 className="section-title">Test de connexion</h3>

          <div className="test-item">
            <span>🎥 Qualité vidéo</span>
            <span className="status good">Bonne</span>
          </div>

          <div className="test-item">
            <span>🎤 Qualité audio</span>
            <span className="status excellent">Excellente</span>
          </div>

          <div className="test-item">
            <span>📶 Connexion réseau</span>
            <span className="status good">Bonne</span>
          </div>
        </div>
      </main>
    </div>
  );
}
