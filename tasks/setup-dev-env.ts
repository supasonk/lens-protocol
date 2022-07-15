import { task } from 'hardhat/config';
import { LensHub__factory } from '../typechain-types';
import { ProtocolState, waitForTx, initEnv, getAddrs, ZERO_ADDRESS } from './helpers/utils';
import { CreateProfileDataStruct } from '../typechain-types/LensHub';

task('setup', 'setup dev enviroment').setAction(async ({}, hre) => {
  const [governance, , user] = await initEnv(hre);
  const addrs = getAddrs();
  const lensHub = LensHub__factory.connect(addrs['lensHub proxy'], governance);

  console.log('UNPAUSING THE PROTOCOL');
  await waitForTx(lensHub.setState(ProtocolState.Unpaused));
  console.log('UNPAUSING COMPLETED');
  console.log(await lensHub.getState());

  console.log('WHITELISTING ADDRESS');
  await waitForTx(lensHub.whitelistProfileCreator(user.address, true));
  console.log('WHITELISTING COMPLETED');
  const inputStruct: CreateProfileDataStruct = {
    to: user.address,
    handle: 'zer0dot',
    imageURI: 'https://ipfs.io/ipfs/QmY9dUwYu67puaWBMxRKW98LPbXCznPwHUbhX5NeWnCJbX',
    followModule: ZERO_ADDRESS,
    followModuleInitData: [],
    followNFTURI: 'https://ipfs.io/ipfs/QmTFLSXdEQ6qsSzaXaCSNtiv6wA56qq87ytXJ182dXDQJS',
  };

  console.log('CREATING PROFILE');
  await waitForTx(lensHub.connect(user).createProfile(inputStruct));
  console.log('CREATING PROFILE COMPLETED');

  console.log(`Total supply (should be 1): ${await lensHub.totalSupply()}`);
  console.log(
    `Profile owner: ${await lensHub.ownerOf(1)}, user address (should be the same): ${user.address}`
  );
  console.log(`Profile ID by handle: ${await lensHub.getProfileIdByHandle('zer0dot')}`);
});
