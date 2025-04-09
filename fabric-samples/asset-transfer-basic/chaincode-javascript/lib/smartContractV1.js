/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

// define struct for medical record

const record = [
    {
        id: '',
        userId: '',
        createdBy: '',
        title: '',
        details: '',
        requestClaim: false,
        approveClaim: false,
    },
];

class smartContract extends Contract {
    async initLedger(ctx) {
        return { success: true, message: 'Chaincode init Success...!' };
    }

    // check user role
    async CheckRole(ctx) {
        // get user role
        let cid = new ClientIdentity(ctx.stub);
        const userId = await cid.getAttributeValue('userId'); // get role from cert of registered user.
        const role = await cid.getAttributeValue('role'); // get role from cert of registered user.

        return { userId, role };
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, id, createdBy, title, details) {
        // check role only doctor can write txn -  create record
        const { userId, role } = await this.CheckRole(ctx);

        if (role !== 'doctor') {
            return {
                success: false,
                message:
                    'User is not Authorized to create record, only doctor can create record.',
            };
        }

        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            // throw new Error(`The asset ${id} already exists`);
            return {
                success: false,
                message: `The asset ${id} already exists...Try with new id.`,
            };
        }

        const asset = {
            id: id,
            userId: userId,
            title: title,
            details: details,
            createdBy: createdBy,
            requestClaim: false,
            approveClaim: false,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        const response = await ctx.stub.putState(
            id,
            Buffer.from(stringify(sortKeysRecursive(asset)))
        );
        return {
            success: true,
            data: JSON.stringify(asset),
            response: response,
        };
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            // throw new Error(`The asset ${id} does not exist`);
            return {
                success: false,
                message: `The asset ${id} does not exist`,
            };
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, createdBy, title, details) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            // throw new Error(`The asset ${id} does not exist`);
            return {
                success: false,
                message: `The asset ${id} does not exist`,
            };
        }

        // check role only doctor can write txn -  create record
        const { userId, role } = await this.CheckRole(ctx);

        if (role !== 'doctor') {
            return {
                success: false,
                message:
                    'User is not Authorized to create record, only doctor can create record.',
            };
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            id: id,
            userId: userId,
            title: title,
            details: details,
            createdBy: createdBy,
            requestClaim: false,
            approveClaim: false,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        const response = await ctx.stub.putState(
            id,
            Buffer.from(stringify(sortKeysRecursive(updatedAsset)))
        );
        return {
            success: true,
            data: JSON.stringify(asset),
            response: response,
        };
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            // throw new Error(`The asset ${id} does not exist`);
            return {
                success: false,
                message: `The asset ${id} does not exist`,
            };
        }
        return { success: true, data: ctx.stub.deleteState(id) };
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // // queryAllAssets on ledger
    // async queryAllAssets(ctx) {

    // const startKey = '';
    // const endKey = '';
    // const allResults = [];
    // for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
    //     const strValue = Buffer.from(value).toString('utf8');
    //     let record;
    //     try {
    //         record = JSON.parse(strValue);
    //     } catch (err) {
    //         console.log(err);
    //         record = strValue;
    //     }
    //     allResults.push({ Key: key, Record: record });
    // }

    // console.info(allResults);
    // if (!allResults || allResults.length === 0)
    //     {
    //         return {success:false, error: `No assets exist on ledger`};
    //     } else {
    //         return {success:true, data:JSON.stringify(allResults)};
    //     }
    // }

    //get history of project
    async queryHistoryOfAsset(ctx, id) {
        // args = JSON.parse(args);
        // const assetId = assetId;
        for await (const { key, value } of ctx.stub.getHistoryForKey(id)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);

        if (!allResults || allResults.length === 0) {
            return { success: false, error: `${id} does not exist` };
        } else {
            return { success: true, data: JSON.stringify(allResults) };
        }
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const { userId, role } = await this.CheckRole(ctx);

        if (role !== 'gov') {
            return { success: false, message: 'only gov can do this action' };
        }

        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(
                result.value.value.toString()
            ).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return { success: true, data: JSON.stringify(allResults) };
    }
}

module.exports = smartContract;
