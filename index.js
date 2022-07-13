'use strict';
const fs = require('fs');
const benconde = require('bencode');
const tracker = require('./tracker');

const torrent = benconde.decode(fs.readFileSync('puppy.torrent'));

tracker.getPeers(torrent, peers => {
    console.log('list of peers: ', peers)
});

