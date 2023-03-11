import { Address, toNano } from 'ton-core';
import { NetworkProvider, sleep } from '@ton-community/blueprint';
import { Dao } from '../wrappers/Dao';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dao address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const dao = provider.open(Dao.createFromAddress(address));

    const membersBefore = await dao.getMembersList();
    const position = (await dao.getMembersList.length) + 1;
    console.log(position);
    await dao.sendNewMember(provider.sender(), {
        position: position,
        address: Address.parse('EQAnDvMFcIqcI5E-awT6h5Xlh9Kn0x0-JbBlS_Fca0DV3-xv'),
    });

    ui.write('Waiting for address to be added...');

    let membersAfter = await dao.getMembersList();
    let attempt = 1;
    while (membersAfter === membersBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        membersAfter = await dao.getMembersList();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('member added successfully!');
}
