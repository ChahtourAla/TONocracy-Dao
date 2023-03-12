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

    const proposalsBefore = await dao.getProposalsList();
    const position = proposalsBefore.asSlice.length + 1;
    await dao.sendNewProposal(provider.sender(), {
        position: position,
        address: optAddress,
    });

    ui.write('Waiting for proposal to be added...');

    let proposalsAfter = await await dao.getProposalsList();

    let attempt = 1;
    while (proposalsAfter?.equals(proposalsBefore)) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        proposalsAfter = await dao.getProposalsList();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('proposal added successfully!');
}
