// src/components/FeatureCard.js
import styles from "../styles/FeatureCard.module.css";

export default function FeatureCard({ icon, title, description }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <h5 className="text-white mb-2">{title}</h5>
      <p className="text-white-50 mb-0 small">{description}</p>
    </div>
  );
}
