import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type DaoConfig = {};

export function daoConfigToCell(config: DaoConfig): Cell {
    return beginCell().endCell();
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
}
