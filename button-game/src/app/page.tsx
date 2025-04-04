/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { createClientUPProvider } from '@lukso/up-provider';
import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  PublicClient,
  WalletClient,
} from 'viem';
import { lukso } from 'viem/chains';
import styles from './page.module.css';
import { Address } from 'viem';
import { useClockSound } from './useClockSound';
import { AboutModal, FAQModal } from '@/app/AboutModal';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [potBalance, setPotBalance] = useState('0');
  const [lastPresser, setLastPresser] = useState('');
  const [lastWinner, setLastWinner] = useState('');
  const [lastPrize, setLastPrize] = useState('0');
  const [gameActive, setGameActive] = useState(true);
  const [gameEndTime, setGameEndTime] = useState<bigint>(BigInt(0));
  const [lastPressTime, setLastPressTime] = useState<bigint>(BigInt(0));
  const [lastWinTime, setLastWinTime] = useState<bigint>(BigInt(0));
  const [accounts, setAccounts] = useState<string[]>([]);
  const [entryFee] = useState('0.1');
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);

  const { timeRemaining } = useClockSound(gameActive, gameEndTime);

  const contractAddress = '0xa517Ad3C4Af60033E375A3eb6B2c560aD91Cee8A' as const;

  const contractABI = [
    {
      inputs: [],
      name: 'pressButton',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getAllGameData',
      outputs: [
        { name: '_gameEndTime', type: 'uint256' },
        { name: '_lastPresser', type: 'address' },
        { name: '_potBalance', type: 'uint256' },
        { name: '_gameActive', type: 'bool' },
        { name: '_lastPressTime', type: 'uint256' },
        { name: '_lastWinner', type: 'address' },
        { name: '_lastPrize', type: 'uint256' },
        { name: '_lastWinTime', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'entryFee',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'winner', type: 'address' },
        { indexed: false, name: 'amountWon', type: 'uint256' },
      ],
      name: 'GameEnded',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        { indexed: true, name: 'presser', type: 'address' },
        { indexed: false, name: 'timestamp', type: 'uint256' },
      ],
      name: 'ButtonPressed',
      type: 'event',
    },
  ] as const;

  async function updateFullGameState(client: PublicClient) {
    if (!client) return;
    try {
      const [
        endTime,
        lastPresserAddr,
        pot,
        active,
        pressTime,
        winnerAddr,
        prize,
        winTime,
      ] = (await client.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'getAllGameData',
      })) as [
        bigint,
        Address,
        bigint,
        boolean,
        bigint,
        Address,
        bigint,
        bigint,
      ];

      setPotBalance((Number(pot) / 1e18).toFixed(2));
      setLastPresser(lastPresserAddr);
      setGameActive(active);
      setGameEndTime(endTime);
      setLastWinner(winnerAddr);
      setLastPrize((Number(prize) / 1e18).toFixed(2));
      setLastPressTime(pressTime);
      setLastWinTime(winTime);
    } catch (error) {
      console.error('Error updating full game state:', error);
    }
  }

  async function updateCountdownState(client: PublicClient) {
    if (!client) return;
    try {
      const [endTime, , , active] = (await client.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'getAllGameData',
      })) as [
        bigint,
        Address,
        bigint,
        boolean,
        bigint,
        Address,
        bigint,
        bigint,
      ];

      setGameActive(active);
      setGameEndTime(endTime);
    } catch (error) {
      console.error('Error updating countdown state:', error);
    }
  }

  useEffect(() => {
    let provider: ReturnType<typeof createClientUPProvider>;

    async function initialize() {
      provider = createClientUPProvider();
      const pubClient = createPublicClient({
        chain: lukso,
        transport: http(),
      });
      const walClient = createWalletClient({
        chain: lukso,
        transport: custom(provider),
      });

      setPublicClient(pubClient);
      setWalletClient(walClient);

      try {
        const initialAccounts = (await provider.request(
          'eth_accounts',
        )) as string[];
        setAccounts(initialAccounts);
        setWalletConnected(initialAccounts.length > 0);

        await updateFullGameState(pubClient);

        provider.on('accountsChanged', (newAccounts: string[]) => {
          setAccounts(newAccounts);
          setWalletConnected(newAccounts.length > 0);
        });

        const unwatchPress = pubClient.watchContractEvent({
          address: contractAddress,
          abi: contractABI,
          eventName: 'ButtonPressed',
          onLogs: () => updateFullGameState(pubClient),
        });

        const unwatchGameEnd = pubClient.watchContractEvent({
          address: contractAddress,
          abi: contractABI,
          eventName: 'GameEnded',
          onLogs: () => updateFullGameState(pubClient),
        });

        const interval = setInterval(
          () => updateCountdownState(pubClient),
          8000,
        );

        return () => {
          unwatchPress();
          unwatchGameEnd();
          clearInterval(interval);
          provider.removeAllListeners();
        };
      } catch (error) {
        console.error('Initialization error:', error);
      }
    }

    initialize();

    return () => {
      if (provider) provider.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressButton = async () => {
    if (
      !walletConnected ||
      !walletClient ||
      !publicClient ||
      accounts.length === 0
    ) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const chainId = await walletClient.getChainId();
      console.log('Wallet chain ID before transaction:', chainId);

      if (chainId !== 42) {
        console.log('Attempting to switch to LUKSO Mainnet...');
        try {
          await walletClient.switchChain({ id: 42 });
          console.log('Successfully switched to LUKSO Mainnet');
        } catch (switchError) {
          if (
            (typeof switchError === 'object' &&
              switchError !== null &&
              'code' in switchError &&
              (switchError as { code: number }).code === 4902) ||
            (switchError instanceof Error &&
              switchError.message.includes('chain not added'))
          ) {
            await walletClient.addChain({
              chain: {
                id: 42,
                name: 'LUKSO Mainnet',
                nativeCurrency: { name: 'LYX', symbol: 'LYX', decimals: 18 },
                rpcUrls: {
                  default: {
                    http: [
                      'https://rpc.mainnet.lukso.network',
                      'https://42.rpc.thirdweb.com',
                    ],
                  },
                },
                blockExplorers: {
                  default: {
                    name: 'LUKSO Explorer',
                    url: 'https://explorer.execution.mainnet.lukso.network',
                  },
                },
              },
            });
            console.log('LUKSO Mainnet added to wallet');
            await walletClient.switchChain({ id: 42 });
          } else {
            throw switchError;
          }
        }
      }

      console.log('Sending transaction to press button...');
      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'pressButton',
        account: accounts[0] as Address,
        value: BigInt(0.1 * 1e18), // 0.1 LYX
        chain: lukso,
        gas: BigInt(250000),
      });

      console.log('Transaction hash:', tx);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      console.log('Transaction confirmed:', receipt);
      await updateFullGameState(publicClient);
      console.log('Game state updated successfully');
    } catch (error) {
      console.error('Error pressing button:', error);
      let errorMessage = 'Failed to press button';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        if (error.message.includes('insufficient funds')) {
          errorMessage =
            'Failed to press button: Insufficient funds in your wallet';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Failed to press button: Transaction rejected by user';
        } else if (error.message.includes('chain')) {
          errorMessage =
            'Failed to press button: Network issue - please ensure you’re on LUKSO Mainnet';
        }
      }
      alert(errorMessage);
    }
  };

  const formatTimeAgo = (timestamp: bigint): string => {
    if (timestamp === BigInt(0)) return '';
    const now = Math.floor(Date.now() / 1000);
    const secondsAgo = now - Number(timestamp);

    if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
    const minutesAgo = Math.floor(secondsAgo / 60);
    if (minutesAgo < 60)
      return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24)
      return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <nav className={styles['top-nav']}>
          <ul>
            <AboutModal />
            <FAQModal />
          </ul>
        </nav>

        <div className={styles['site-title']}>LAST CLICK WINS</div>

        <p className={styles.subtitle}>
          Press the button and be the last person to press it for 10 consecutive
          minutes to win!
        </p>

        <button
          className={styles['press-button']}
          onClick={handlePressButton}
          disabled={!walletConnected || !gameActive}
        >
          PRESS
        </button>

        <p className={styles['wallet-status']}>
          {walletConnected && accounts.length > 0
            ? `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
            : 'Connect your Universal Profile to play'}
        </p>

        <div className={styles['info-row']}>
          <div className={styles['info-box']}>
            <div className={styles.label}>CURRENT POT</div>
            <div className={styles.content}>
              <div>{potBalance} LYX</div>
            </div>
          </div>
          <div className={styles['info-box']}>
            <div className={styles.label}>ENTRY FEE</div>
            <div className={styles.content}>
              <div>{entryFee} LYX</div>
            </div>
          </div>
        </div>

        <div className={styles['info-box']}>
          <div className={styles.label}>TIME REMAINING</div>
          <div className={styles.content}>
            <div className={styles['time-remaining-container']}>
              <span>{timeRemaining}</span>
            </div>
            <div className={'alarmClock'} style={{ position: 'relative' }}>
              <img
                src="/alarm-clock.png"
                className={styles['clock-icon']}
                width={'64px'}
                style={{
                  animation: 'moveAndShake 2s infinite',
                }}
              />
            </div>
            <style jsx>{`
              @keyframes moveAndShake {
                0% {
                  transform: translateX(0) rotate(0deg);
                }
                25% {
                  transform: translateX(10px) rotate(5deg);
                }
                50% {
                  transform: translateX(0) rotate(0deg);
                }
                75% {
                  transform: translateX(-10px) rotate(-5deg);
                }
                100% {
                  transform: translateX(0) rotate(0deg);
                }
              }
            `}</style>
          </div>
        </div>

        {timeRemaining === '0:00' && (
          <p className={styles['timer-message']}>
            Press the button to start the game!
          </p>
        )}

        <div className={styles['info-box']}>
          <div className={styles.label}>LAST WINNER</div>
          <div className={styles.content}>
            <div>
              {lastWinner &&
              lastWinner !== '0x0000000000000000000000000000000000000000'
                ? `${lastWinner.slice(0, 6)}...${lastWinner.slice(-4)} won ${lastPrize} LYX (${formatTimeAgo(lastWinTime)})`
                : 'No winners yet'}
            </div>
          </div>
        </div>
        <div className={styles['info-row']}>
          <div className={styles['info-box']}>
            <div className={styles.label}>LAST PRESSER</div>
            <div className={styles.content}>
              <div>
                {lastPresser &&
                lastPresser !== '0x0000000000000000000000000000000000000000'
                  ? `${lastPresser.slice(0, 6)}...${lastPresser.slice(-4)} (${formatTimeAgo(lastPressTime)})`
                  : 'No presses yet'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
