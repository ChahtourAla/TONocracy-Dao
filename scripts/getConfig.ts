import { getHttpEndpoint } from '@orbs-network/ton-access';
import { TonClient, Address } from 'ton';
import { Dao } from '../wrappers/Dao';

export async function run() {
    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });

    // open Dao instance by address
    const daoAddress = Address.parse('EQArDrMEoQZdsxtxby1lLnP7qv0rLRPBOP4OihBmrmbpbrPt'); // replace with dao address
    const dao = new Dao(daoAddress);
    const daoContract = client.open(dao);

    // call the getter on chain
    const dao_name = await daoContract.getDaoName();
    const dao_purpose = await daoContract.getDaoPurpose();
    const creation_time = await daoContract.getDaoCreationTime();
    const members = await daoContract.getMembersList();
    const proposals_list = await daoContract.getProposalsList();

    const config = {
        dao_name: dao_name,
        dao_purpose: dao_purpose,
        creation_time: creation_time,
        members: members,
        proposals_list: proposals_list,
    };

    console.log(config);
}
