'use strict';

const { Contract } = require('fabric-contract-api');

class SupplyChain extends Contract {

  async getMspId(ctx){
    return await ctx.stub.getMspID();
  }

  async addProduct(ctx, product) {
    console.info('============= START : Add asset ===========');
    await ctx.stub.putState(JSON.parse(product).id.toString(), Buffer.from(product));
    console.info('============= END : Add asset ===========');
    return ctx.stub.getTxID()
  }

  async addProcess(ctx, data) {
    console.info('============= START : New Process ===========');
    const _data = JSON.parse(data);
    const keyAsBytes = await ctx.stub.getState(_data.id); 
    if (!keyAsBytes || keyAsBytes.length === 0) {
      throw new Error(`${_data.id} does not exist`);
    }
    let key = JSON.parse(keyAsBytes.toString());
    key = {...key, ..._data}
    await ctx.stub.putState(_data.id, Buffer.from(JSON.stringify(key)));
    console.info('============= END : New Process ===========');
    return ctx.stub.getTxID();
  }

  async queryAsset(ctx, _data) {
    console.info('============= START : Query asset ===========');
    const productId = JSON.parse(_data).id.toString();
    const user = JSON.parse(_data).user.toString();

    const assetAsBytes = await ctx.stub.getState(productId.toString()); 
    if (!assetAsBytes || assetAsBytes.length === 0) {
      throw new Error(`${productId} does not exist`);
    }
    var _temp = JSON.parse(assetAsBytes.toString());
    if(user !== 'admin'){
      delete _temp['farm']
    }
    console.info('============= END : Query asset ===========');
    return _temp;
  }
  
  async setPosition(ctx, id, position, process) {
    console.info('============= START : Set position ===========');
    const keyAsBytes = await ctx.stub.getState(id); 
    if (!keyAsBytes || keyAsBytes.length === 0) {
      throw new Error(`${id} does not exist`);
    }
    let key = JSON.parse(keyAsBytes.toString());
    key = {...key, position:position, process:process}
    // key.position = position;
    // key.process = process;
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

module.exports = SupplyChain;

