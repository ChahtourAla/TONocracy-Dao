import { DaoConfig } from './../wrappers/Dao';
import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano, Dictionary, DictionaryValue } from 'ton-core';
import { Dao } from '../wrappers/Dao';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

const ListValue: DictionaryValue<string> = {
    serialize(src: string, builder) {
        builder.storeStringRefTail(src);
    },
    parse(src) {
        return src.loadStringRefTail();
    },
};

let membersDict: Dictionary<number, string> = Dictionary.empty(Dictionary.Keys.Uint(256), ListValue);
let proposalDict: Dictionary<number, string> = Dictionary.empty(Dictionary.Keys.Uint(256));

membersDict.set(1, 'kQCwlqJG250ThRWZSet1IWZoXTOA3kgBH9pSWhKp2OwXRfFZ');

let daoConfig = {
    dao_name: 'dao test name',
    dao_purpose: 'dao test purpose',
    creation_time: Date.now(),
    members: membersDict,
    proposals_list: proposalDict,
};

describe('Dao', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Dao');
    });

    let blockchain: Blockchain;
    let dao: SandboxContract<Dao>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        dao = blockchain.openContract(Dao.createFromConfig(daoConfig, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await dao.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: dao.address,
            deploy: true,
        });
    });

    it('get dao name', async () => {
        let name = await dao.getDaoName();
        expect(name).toEqual('dao test name');
    });

    it('get dao members', async () => {
        let members = await dao.getMembersList();
        let slice = members.beginParse();
        let list = slice.loadDictDirect(Dictionary.Keys.Uint(256), ListValue).values();
        slice.endParse();

        console.log(list);
    });
});
