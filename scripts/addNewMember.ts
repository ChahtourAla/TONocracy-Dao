import { Address, toNano } from 'ton-core';
import { NetworkProvider, sleep } from '@ton-community/blueprint';
import { Dao } from '../wrappers/Dao';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Dao address'));
    const optAddress = args.length > 0 ? args[0] : await ui.input('Member address to add');

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const dao = provider.open(Dao.createFromAddress(address));

    const membersBefore = await dao.getMembersList();
    const position = membersBefore.asSlice.length + 1;
    await dao.sendNewMember(provider.sender(), {
        position: position,
        address: optAddress,
    });

    ui.write('Waiting for address to be added...');

    let membersAfter = await dao.getMembersList();

    let attempt = 1;
    while (membersAfter?.equals(membersBefore)) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        membersAfter = await dao.getMembersList();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('member added successfully!');
}
