// src/components/Dashboard.js
import styles from "../styles/Dashboard.module.css";
import SignOutButton from "./SignOutButton";
import StatsCard from "./StatsCard";

export default function Dashboard({ user, fragments, children }) {
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1>📄 CloudDocs Dashboard</h1>
            </div>
            <div className="col-md-4">
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div>{user.username}</div>
                  <div>{user.email}</div>
                </div>
                <SignOutButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row mb-4">
          <div className="col-lg-4">
            <StatsCard
              icon="📊"
              count={fragments.length}
              label="Total Fragments"
            />
          </div>
          <div className="col-lg-4">
            <StatsCard
              icon="📝"
              count={fragments.filter((f) => f.type?.startsWith("text")).length}
              label="Text Fragments"
            />
          </div>
          <div className="col-lg-4">
            <StatsCard
              icon="🖼️"
              count={
                fragments.filter((f) => f.type?.startsWith("image")).length
              }
              label="Image Fragments"
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
