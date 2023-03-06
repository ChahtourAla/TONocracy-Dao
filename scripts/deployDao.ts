import { toNano } from 'ton-core';
import { Dao } from '../wrappers/Dao';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const dao = provider.open(Dao.createFromConfig({}, await compile('Dao')));

    await dao.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(dao.address);

    // run methods on `dao`
}
