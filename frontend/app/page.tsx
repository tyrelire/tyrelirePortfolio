import styles from "./home-hero.module.css";

export default function Home() {
  return (
    <main className={styles.heroContainer}>
      <h1 className={styles.heroTitle}>
        Building bridges between design and code
      </h1>
      <p className={styles.heroSubtitle}>
        I'm Selene, a design engineer at ONCE UI, where I craft intuitive user
        experiences.
        <br />
        After hours, I build my own projects.
      </p>
    </main>
  );
}
