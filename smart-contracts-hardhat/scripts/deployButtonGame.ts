// bun hardhat compile
// bun hardhat run ./scripts/deployButtonGame.ts --network luksoMainnet
const hre = require('hardhat');
const { ethers } = require('hardhat');
require('dotenv').config();

async function deployButtonGame() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying from:', deployer.address);

  const charity = '0xb84364bD0AbF5D6b640461ee12d41cd154431fd6';
  let buttonGame;

  // Deploy ButtonGame
  try {
    const ButtonGame = await ethers.getContractFactory('ButtonGame');
    console.log('Deploying ButtonGame...');
    buttonGame = await ButtonGame.deploy(deployer.address, charity, {
      gasLimit: 6000000,
    });
    await buttonGame.waitForDeployment();
    console.log('ButtonGame deployed at:', buttonGame.target);
  } catch (error) {
    console.error('Error deploying ButtonGame:', error);
    process.exit(1);
  }

  // Verify (optional)
  try {
    await hre.run('verify:verify', {
      address: buttonGame.target,
      constructorArguments: [deployer.address, charity],
    });
    console.log('ButtonGame verified on Blockscout');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

deployButtonGame()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
