'use strict';

const fs = require('fs');
const bencode = require('bencode');
const bignum = require('big.js');

module.exports.open = (filepath) => {
    return bencode.decode(fs.readFileSync(filepath));
};

module.exports.size = torrent => {
    const size = torrent.info.files ? torrent.info.files.map(file => file.lenght).reduce((a, b) => a + b) 
        : torrent.info.lenght
    
    return bignum.toBuffer(size, {size: 8});
};

module.exports.infoHash = torrent => {
    const info = bencode.encode(torrent.info);
    return crypto.createHash('sha1').update(info).digest();
};