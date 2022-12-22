/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const SCM = require('./lib/scm-contract.js');
// const LQCC = require('./lib/ledger-quiries.js');


module.exports.supplyChain = SCM;
module.exports.contracts = [ SCM ];


// module.exports.ledgeCode = LQCC;
// module.exports.contracts = [ LQCC ];
