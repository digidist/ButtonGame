// components/Modals.tsx
'use client';
import { useState } from 'react';
import styles from './page.module.css'; // You'll need to create this CSS module

export function AboutModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <li onClick={() => setIsOpen(true)}>About</li>
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.aboutTitle}>About Last Click Wins</h2>
            <p className={styles.aboutText}>
              Last Click Wins is an exciting blockchain-based game built on the
              LUKSO network. Players compete to be the last person to press a
              virtual button within a 10-minute countdown period to win the
              accumulated pot.
            </p>
            <p className={styles.aboutText}>
              The game operates with a 0.1 LYX entry fee per press. When a
              winner is determined, the pot is distributed as follows:
            </p>

            <div className={styles.percentageExplanation}>
              <div className={styles.percentageItem}>
                • 70% goes to the winner
              </div>
              <div className={styles.percentageItem}>
                • 10% is donated to a designated charity
              </div>
              <div className={styles.percentageItem}>
                • 10% goes to the development team
              </div>
              <div className={styles.percentageItem}>
                • 10% is reserved for the next game&apos;s pot
              </div>
            </div>

            <p className={styles.aboutText}>
              The smart contract ensures fair play and transparent distribution
              of funds. The game continues indefinitely, with each button press
              resetting the 10-minute countdown timer until no one presses for
              the full duration, crowning the last presser as the winner. After
              the timer runs out and the winner is known,{' '}
              <b>
                the next press on the button will distribute the reward to the
                last winner.
              </b>
            </p>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function FAQModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <li onClick={() => setIsOpen(true)}>FAQ</li>
      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Frequently Asked Questions</h2>

            <div className={styles.faqItem}>
              <h3 className={styles.faqTitle}>What is Last Click Wins?</h3>
              <p className={styles.faqAnswer}>
                Last Click Wins is a decentralized game where players pay 0.1
                LYX to press a button. The last person to press the button
                before a 10-minute countdown expires wins 70% of the accumulated
                pot.
              </p>
            </div>

            <hr className={styles.faqDivider} />

            <div className={styles.faqItem}>
              <h3 className={styles.faqTitle}>How do I play?</h3>
              <p className={styles.faqAnswer}>
                Connect your Universal Profile wallet, ensure you have LYX, and
                click the PRESS button. Each press costs 0.1 LYX and resets the
                10-minute timer. Be the last to press before the timer runs out
                to win!
              </p>
            </div>

            <hr className={styles.faqDivider} />

            <div className={styles.faqItem}>
              <h3 className={styles.faqTitle}>Where does the money go?</h3>
              <p className={styles.faqAnswer}>
                When someone wins, the pot is split: 70% to the winner, 10% to
                charity, 10% to developers, and 10% seeds the next round&apos;s
                pot.
              </p>
            </div>

            <hr className={styles.faqDivider} />

            <div className={styles.faqItem}>
              <h3 className={styles.faqTitle}>Is the game fair?</h3>
              <p className={styles.faqAnswer}>
                Yes! The game runs on a transparent smart contract on the LUKSO
                blockchain. All rules and distributions are enforced
                automatically by code that anyone can verify.
              </p>
            </div>

            <hr className={styles.faqDivider} />

            <div className={styles.faqItem}>
              <h3 className={styles.faqTitle}>
                What happens if no one presses the button?
              </h3>
              <p className={styles.faqAnswer}>
                If the 10-minute countdown expires and there was at least one
                press in the round, the last presser wins. If no one has pressed
                yet, the game waits for the first press to start the timer.
              </p>
            </div>

            <hr className={styles.faqDivider} />

            <div className={styles.faqItem}>
              <h3 className={styles.faqTitle}>How do I claim the reward?</h3>
              <p className={styles.faqAnswer}>
                If you are the last presser, the smart contract will
                automatically distribute the funds to your wallet address as
                soon as the button is pressed again the next time.
              </p>
            </div>

            <hr className={styles.faqDivider} />

            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
