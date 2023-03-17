import { toNano, Address, Dictionary, DictionaryValue } from 'ton-core';
import { Dao } from '../wrappers/Dao';
import { Daos } from '../../DaoFactory/wrappers/Daos';
import { compile, NetworkProvider, sleep } from '@ton-community/blueprint';

const ListValue: DictionaryValue<string> = {
    serialize(src: string, builder) {
        builder.storeStringRefTail(src);
    },
    parse(src) {
        return src.loadStringRefTail();
    },
};

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const dao_name = args.length > 0 ? args[0] : await ui.input('Dao name');
    const dao_purpose = args.length > 0 ? args[0] : await ui.input('Dao purpose');
    const dao = provider.open(
        Dao.createFromConfig(
            {
                dao_name: dao_name,
                dao_purpose: dao_purpose,
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

    let factoryAddress = Address.parse('EQAig-Xu8d5ZBMLMvsKB8cyGM9DfpMt04VpoIjNxSWzElVoH');
    const factory = provider.open(Daos.createFromAddress(factoryAddress));
    const daosBefore = await factory.getDaosList();
    const position = daosBefore.toString().split('x{45514').length;
    await factory.sendNewDao(provider.sender(), {
        position: position,
        address: dao.address.toString(),
    });
    let daosAfter = await factory.getDaosList();
    while (daosAfter.equals(daosBefore)) {
        await sleep(2000);
        daosAfter = await factory.getDaosList();
    }

    console.log('✅ dao is deployed at address: ', dao.address);

    // run methods on `dao`
}
