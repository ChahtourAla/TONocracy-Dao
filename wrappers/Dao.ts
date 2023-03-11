import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    crc32c,
    Dictionary,
    DictionaryValue,
    Sender,
    SendMode,
    Slice,
    toNano,
} from 'ton-core';
import { crc32, crc32str } from '../utils/crc32';
export type List = {
    address: Address;
};

export type DaoConfig = {
    dao_name: string;
    dao_purpose: string;
    members: List[];
    proposals_list: List[];
};

const ListValue: DictionaryValue<List> = {
    serialize(src: List, builder) {
        builder.storeAddress(src.address);
    },
    parse(src) {
        return {
            address: src.loadAddress(),
        };
    },
};

export function daoConfigToCell(config: DaoConfig): Cell {
    const members_list = Dictionary.empty(Dictionary.Keys.Uint(32), ListValue);
    for (let i = 0; i < config.members.length; i++) {
        members_list.set(i, config.members[i]);
    }
    const proposal_list = Dictionary.empty(Dictionary.Keys.Uint(32), ListValue);
    for (let i = 0; i < config.proposals_list.length; i++) {
        proposal_list.set(i, config.proposals_list[i]);
    }
    return beginCell()
        .storeStringRefTail(config.dao_name)
        .storeStringRefTail(config.dao_purpose)
        .storeDict(members_list)
        .storeDict(proposal_list)
        .endCell();
}

export function decodeConfig(cell: Cell): DaoConfig {
    let slice = cell.beginParse();
    return {
        dao_name: slice.loadStringTail(),
        dao_purpose: slice.loadStringTail(),
        members: slice.loadDict(Dictionary.Keys.Uint(32), ListValue).values(),
        proposals_list: slice.loadDict(Dictionary.Keys.Uint(32), ListValue).values(),
    };
}

export class Dao implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Dao(address);
    }

    static createFromConfig(config: DaoConfig, code: Cell, workchain = 0) {
        const data = daoConfigToCell(config);
        const init = { code, data };
        return new Dao(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendNewMember(provider: ContractProvider, via: Sender) {
        const messageBody = beginCell()
            .storeUint(crc32str('op::add_new_member'), 32)
            .storeUint(0, 64) // query id
            .endCell();

        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: messageBody,
        });
    }

    async getDaoName(provider: ContractProvider) {
        return (await provider.get('get_dao_name', [])).stack.readString();
    }

    async getDaoPurpose(provider: ContractProvider) {
        return (await provider.get('get_dao_purpose', [])).stack.readString();
    }

    async getMembersList(provider: ContractProvider) {
        return (await provider.get('get_dao_members', [])).stack.readCell();
    }

    async getProposalsList(provider: ContractProvider) {
        return (await provider.get('get_dao_proposals', [])).stack.readCell();
    }

    async getConfig(provider: ContractProvider) {
        let config = (await provider.get('get_dao_proposals', [])).stack.readCell();
        return decodeConfig(config);
    }
}
