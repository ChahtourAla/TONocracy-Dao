import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { Dao } from '../wrappers/Dao';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('Dao', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Dao');
    });

    let blockchain: Blockchain;
    let dao: SandboxContract<Dao>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        dao = blockchain.openContract(Dao.createFromConfig({}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await dao.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: dao.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and dao are ready to use
    });
});
