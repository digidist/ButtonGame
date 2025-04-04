async function main() {
  // Hardcode your deployed contract addresses and constructor arguments:
  const buttonGameAddress = '0x6F39ff8df7E5C85D277fc2f7B2DADcF7E4386252';
  const deployerAddress = '0xb84364bD0AbF5D6b640461ee12d41cd154431fd6';
  const charityAddress = '0xb84364bD0AbF5D6b640461ee12d41cd154431fd6';
  const buttonBadgeAddress = '0x221c0815613319074F958E498ee2637A2403D126';

  // Verify the ButtonGame contract:
  try {
    console.log('Verifying ButtonGame at address:', buttonGameAddress);
    await hre.run('verify:verify', {
      address: buttonGameAddress,
      constructorArguments: [deployerAddress, charityAddress, buttonBadgeAddress],
    });
    console.log('ButtonGame verified successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  }

  // Verify ButtonBadge
  try {
    console.log('Verifying ButtonBadge at:', buttonBadgeAddress);
    await hre.run('verify:verify', {
      address: buttonBadgeAddress,
      constructorArguments: ['ButtonBadge', 'BB', deployerAddress],
    });
    console.log('ButtonBadge verified successfully!');
  } catch (error) {
    console.error('Verification for ButtonBadge failed:', error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Verification script failed:', error);
    process.exit(1);
  });
