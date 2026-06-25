import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.brand}>
        <p className={styles.eyebrow}>AutoCult</p>
        <h1 className={styles.title}>
          YANGON<br /><span className={styles.accent}>NATION</span>
        </h1>
        <p className={styles.tagline}>Yangon&apos;s premier car community.</p>
      </div>

      <div className={styles.cards}>
        <Link href="/register" className={styles.card}>
          <span className={styles.cardNum}>01</span>
          <h2 className={styles.cardTitle}>New Member</h2>
          <p className={styles.cardDesc}>
            Apply to join Yangon Nation for the first time.
          </p>
          <span className={styles.cardCta}>Register Now →</span>
        </Link>

        <div className={styles.divider} />

        <div className={`${styles.card} ${styles.cardPassive}`}>
          <span className={styles.cardNum}>02</span>
          <h2 className={styles.cardTitle}>Returning Member</h2>
          <p className={styles.cardDesc}>
            Check your email for your personal invite link to re-register.
          </p>
          <span className={styles.cardNote}>Invite only — link sent to your registered email.</span>
        </div>
      </div>

      <footer className={styles.footer}>
        YANGON NATION &bull; AUTOCULT &bull; 2025
      </footer>
    </main>
  );
}
