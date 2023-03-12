import { toNano, Address, Dictionary, DictionaryValue } from 'ton-core';
import { Dao } from '../wrappers/Dao';
import { compile, NetworkProvider } from '@ton-community/blueprint';

const ListValue: DictionaryValue<string> = {
    serialize(src: string, builder) {
        builder.storeStringRefTail(src);
    },
    parse(src) {
        return src.loadStringRefTail();
    },
};

export async function run(provider: NetworkProvider) {
    const dao = provider.open(
        Dao.createFromConfig(
            {
                dao_name: 'Lightency',
                dao_purpose: 'For test',
                creation_time: Date.now(),
                members: Dictionary.empty(Dictionary.Keys.Uint(256), ListValue).set(
                    0,
                    'EQBr0J1v2e5-Wnv1Heerjsv4WlOccTpHBhjklHkNvF-F2nxB'
                ),
                proposals_list: Dictionary.empty(Dictionary.Keys.Uint(256), ListValue).set(
                    0,
                    'EQBr0J1v2e5-Wnv1Heerjsv4WlOccTpHBhjklHkNvF-F2nxB'
                ),
            },
            await compile('Dao')
        )
    );

    await dao.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(dao.address);

    console.log('✅ dao is deployed at address: ', dao.address);

    // run methods on `dao`
}
