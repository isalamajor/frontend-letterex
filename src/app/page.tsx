"use client";
import Image from "next/image";
import styles from "./page.module.css";
import AnimatedForm from "@/components/animatedForm.js";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <AnimatedForm></AnimatedForm>
      </main>
      {/*<footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          About Letterex
        </a>
      </footer>*/}
    </div>
  );
}
