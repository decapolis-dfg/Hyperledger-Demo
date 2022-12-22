'use strict';

const { Contract } = require('fabric-contract-api');

class DecapolisChain extends Contract {

    prettyJSONString(inputString) {
        return JSON.stringify(JSON.parse(inputString), null, 2);
    }

    async CreateProduct(ctx, id, name, company, number, lot, block) {
		const exists = await this.ProductExists(ctx, id);
		if (exists) {
			throw new Error(`The asset ${id} already exists`);
		}

		// ==== Create product object and marshal to JSON ====
		let product = {
			docType: 'product',
			id: id,
			name: name,
			company: company,
			number: number,
            lot:lot,
            block:block
		};

		// === Save asset to state ===
		await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));

        return ctx.stub.getTxID();
	}

    async ProductExists(ctx, productName) {
		// ==== Check if product already exists ====
		let productState = await ctx.stub.getState(productName);
		return productState && productState.length > 0;
	}

    async ReadProduct(ctx, id) {
		const productJSON = await ctx.stub.getState(id); // get the asset from chaincode state
		if (!productJSON || productJSON.length === 0) {
			throw new Error(`Product ${id} does not exist`);
		}

		return productJSON.toString();
	}


    async InitLedger(ctx) {
		const products = [
			{
                id:"1",
                name:"first",
                product:"1",
                number:"",
                lot:"1",
                block:"1",
                latitude:"",
                longitude:"",
            }
		];

		for (const product of products) {
			await this.CreateAsset(
				ctx,
				product.id,
				product.name,
				product.product,
				product.number,
				product.lot,
                product.block
			);
		}
	};

    async setLocation(ctx, id, latitude, longitude) {
        console.info('============= START : Set position ===========');
        const keyAsBytes = await ctx.stub.getState(id); 
        if (!keyAsBytes || keyAsBytes.length === 0) {
          throw new Error(`${id} does not exist`);
        }
        let key = JSON.parse(keyAsBytes.toString());
        key.latitude = latitude;
        key.longitude = longitude;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(key)));
        console.info('============= END : Set position ===========');
        return ctx.stub.getTxID();
      }

      async getHistory(ctx, id) {
        console.info('============= START : Query History ===========');
        let iterator = await ctx.stub.getHistoryForKey(id);
        let result = [];
        let res = await iterator.next();
        while (!res.done) {
          if (res.value) {
            console.info(`found state update with value: ${res.value.value.toString('utf8')}`);
            const obj = JSON.parse(res.value.value.toString('utf8'));
            result.push(obj);
          }
          res = await iterator.next();
        }
        await iterator.close();
        console.info('============= END : Query History ===========');
        return result;  
      }

}

module.exports = DecapolisChain;