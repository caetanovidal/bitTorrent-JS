'use strict';
const fs = require('fs');
const benconde = require('bencode');
const tracker = require('./src/tracker');
const download = require('.src/download')
const torrentParser = require('./src/torrent-parser');

const torrent = benconde.decode(fs.readFileSync('puppy.torrent'));

function autoMaticPeers(){
    tracker.getPeers(torrent, peers => {
        console.log('list of peers: ', peers)
    });
}

setInterval(autoMaticPeers, 60000)

