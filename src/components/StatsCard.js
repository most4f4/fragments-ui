// src/components/StatsCard.js
import styles from "../styles/Dashboard.module.css";

export default function StatsCard({ icon, count, label }) {
  return (
    <div className={styles.statsCard}>
      <div className="text-center">
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
          {count}
        </div>
        <div className="text-muted small">{label}</div>
      </div>
    </div>
  );
}
