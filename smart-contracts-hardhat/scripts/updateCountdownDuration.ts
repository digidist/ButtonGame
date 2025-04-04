//bun hardhat run ./scripts/updateCountdownDuration.ts --network luksoMainnet
// scripts/updateCountdownDuration.ts
const hre = require('hardhat');
const { ethers } = require('hardhat');
require('dotenv').config();

async function updateCountdownDuration() {
  const [signer] = await ethers.getSigners();
  console.log('Updating from:', signer.address);

  // The deployed contract address from your previous deployment
  const contractAddress = '0x6F39ff8df7E5C85D277fc2f7B2DADcF7E4386252';

  // 10 minutes in seconds
  const newCountdownDuration = 10 * 60; // 600 seconds

  try {
    // Get the contract instance
    const ButtonGame = await ethers.getContractFactory('ButtonGame');
    const buttonGame = await ButtonGame.attach(contractAddress).connect(signer);

    console.log('Updating countdown duration to 10 minutes...');
    const tx = await buttonGame.updateCountdownDuration(newCountdownDuration, {
      gasLimit: 300000,
    });

    // Wait for the transaction to be mined
    await tx.wait();
    console.log('Transaction hash:', tx.hash);
    console.log('Countdown duration updated successfully');

    // Verify the update
    const updatedDuration = await buttonGame.countdownDuration();
    console.log('New countdown duration:', updatedDuration.toString(), 'seconds');
  } catch (error) {
    console.error('Error updating countdown duration:', error);
    process.exit(1);
  }
}

updateCountdownDuration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Update failed:', error);
    process.exit(1);
  });
