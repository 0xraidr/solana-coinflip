import { FC } from "react";
import styles from "../styles/Home.module.css";

const Footer: FC = () => {
  return (
    <footer className={styles.footer}>
      <a
        href="https://github.com/0xraidr"
        target="_blank"
        rel="noopener noreferrer"
      >
        Built by <span className={styles.logo}>0xraidr</span>
      </a>
    </footer>
  );
};

export default Footer;
