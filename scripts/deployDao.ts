import { Address, toNano } from 'ton-core';
import { Dao } from '../wrappers/Dao';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    let myAddress = Address.parse('kQBr0J1v2e5-Wnv1Heerjsv4WlOccTpHBhjklHkNvF-F2sfL');
    const dao = provider.open(
        Dao.createFromConfig(
            {
                dao_name: 'Lightency',
                dao_purpose: 'For test',
                members: [{ address: myAddress }],
                proposals_list: [{ address: myAddress }],
            },
            await compile('Dao')
        )
    );

    await dao.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(dao.address);

    console.log('✅ dao is deployed at address: ', dao.address);

    // run methods on `dao`
}
