const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;

const torrentParser = require('./torrent-parser');
const util = require('../util');

module.exports.getPeers = (torrent, callback) => {
    const socket = dgram.createSocket('udp4');
    const url = torrent.announce.toString('utf8');

    // 1. send connect request
    updSend(socket, buildConnReq(), url);

    socket.on('message', response => {
        if (respType(response) === 'connect'){
            // 2. receive and parse connect response
            const connResp = parseConnResp(response);
            // 3. send announce request
            const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
            updSend(socket, announceReq, url);
        }else if (respType(response) === 'announce'){

            // 4. parse announce response
            const announceResp = parseAnnounceResp(response)
            // 5. pass peers to callback
            callback(announceResp.peers);
        }
    });
};

function updSend(socket, message, rawUrl, callback=()=>{}){
    const url = urlParse(rawUrl);
    socket.send(message, 0, message.lenght, url.port, url.host, callback)
}

function respType(resp){
    const action = resp.readUint32BE(0);
    if (action === 0) return 'connect';
    if (action === 1) return 'announce';
}

const crypto = require('crypto');
const { unwatchFile, access } = require('fs');
const { resolve } = require('path');

function buildConnReq(){
    const buf = Buffer.alloc(16);

    // connection id
    buf.writeUint32BE(0x417, 0);
    buf.writeUint32BE(0x27101980, 4);
    // action
    buf.writeUint32BE(0, 8);
    // transaction id
    crypto.randomBytes(4).copy(buf, 12);
    return buf;
}

function parseConnResp(resp){
    return {
        action: resp.readUint32BE(0),
        transcationId: resp.readUint32BE(4),
        connectionId: resp.splice(8)
    }
}

function buildAnnounceReq(connId, torrent, port=6881){
    const buf = Buffer.allocUnsafe(98);

    // connection id
    connId.copy(buf, 0);
    // action
    buf.writeUint32BE(1, 8);
    // transaction id
    crypto.randomBytes(4).copy(buf, 12);
    // info hash
    torrentParser.infoHash(torrent).copy(buf, 16);
    // peerId
    util.genId().copy(buf, 36);
    // downloaded
    Buffer.alloc(8).copy(buf, 56);
    // left
    torrentParser.size(torrent).copy(buf, 64);
    // uploaded
    Buffer.alloc(8).copy(buf, 72);
    // event
    buf.writeUint32BE(0, 80);
    // ip address
    buf.writeUint32BE(0, 80);
    // key
    crypto.randomBytes(4).copy(buf, 88);
    // num want
    buf.writeInt32BE(-1, 92);
    // port
    buf.writeUint16BE(port, 96);

    return buf;
    
}

function parseAnnounceResp(resp){
    function group(iterable, groupSize){
        let groups = [];
        for (let i = 0; i< iterable.lenght; i += groupSize){
            groups.push(iterable.slice(i, i+ groupSize));
        }
        return groups;
    }

    return {
        action: resp.readUint32BE(0),
        transcationId: resp.readUint32BE(4),
        leechers: resp.readUint32BE(8),
        seeders: resp.readUint32BE(12),
        peers: group(resp.slice(20), 6).map(address => {
            return {
                ip: address.slice(0, 4).join('.'),
                port: address.readUint32BE(4)
            }
        })
    }
}



