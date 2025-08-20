// src/components/LandingPage.js
import styles from "../styles/LandingPage.module.css";
import FeatureCard from "./FeatureCard";
import LoginButton from "./LoginButton";

export default function LandingPage() {
  return (
    <div className={styles.landingPage}>
      <div className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>📄 CloudDocs</h1>
            <p className={styles.heroSubtitle}>
              Securely store, manage, and convert your fragments
            </p>
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <FeatureCard
                  icon="🔒"
                  title="Secure Storage"
                  description="AWS-powered authentication"
                />
              </div>
              <div className="col-md-4">
                <FeatureCard
                  icon="🔄"
                  title="Real-time Conversion"
                  description="Convert with instant previews"
                />
              </div>
              <div className="col-md-4">
                <FeatureCard
                  icon="☁️"
                  title="Cloud-Native"
                  description="Scalable microservice architecture"
                />
              </div>
            </div>
            <LoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}
