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

export type DaoConfig = {
    dao_name: string;
    dao_purpose: string;
    creation_time: number;
    members: Dictionary<number, string>;
    proposals_list: Dictionary<number, string>;
};

const ListValue: DictionaryValue<string> = {
    serialize(src: string, builder) {
        builder.storeStringRefTail(src);
    },
    parse(src) {
        return src.loadStringRefTail();
    },
};

export function daoConfigToCell(config: DaoConfig): Cell {
    return beginCell()
        .storeStringRefTail(config.dao_name)
        .storeStringRefTail(config.dao_purpose)
        .storeUint(config.creation_time, 64)
        .storeDict(config.members)
        .storeDict(config.proposals_list)
        .endCell();
}

export function decodeConfig(cell: Cell): DaoConfig {
    let slice = cell.beginParse();
    return {
        dao_name: slice.loadStringTail(),
        dao_purpose: slice.loadStringTail(),
        creation_time: slice.loadUint(64),
        members: slice.loadDict(Dictionary.Keys.Uint(256), ListValue),
        proposals_list: slice.loadDict(Dictionary.Keys.Uint(256), ListValue),
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

    async sendNewMember(
        provider: ContractProvider,
        via: Sender,
        opts: {
            position: number;
            address: string;
        }
    ) {
        const messageBody = beginCell()
            .storeUint(crc32str('op::add_new_member'), 32)
            .storeUint(0, 64) // query id
            .storeUint(opts.position, 256)
            .storeStringRefTail(opts.address)
            .endCell();

        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: messageBody,
        });
    }

    async sendNewProposal(
        provider: ContractProvider,
        via: Sender,
        opts: {
            position: number;
            address: string;
        }
    ) {
        const messageBody = beginCell()
            .storeUint(crc32str('op::add_new_proposal'), 32)
            .storeUint(0, 64) // query id
            .storeUint(opts.position, 256)
            .storeStringRefTail(opts.address)
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

    async getDaoCreationTime(provider: ContractProvider) {
        return (await provider.get('get_dao_creation_time', [])).stack.readBigNumber();
    }

    async getMembersList(provider: ContractProvider) {
        return (await provider.get('get_dao_members', [])).stack.readCell();
    }

    async getProposalsList(provider: ContractProvider) {
        return (await provider.get('get_dao_proposals', [])).stack.readCell();
    }
}
