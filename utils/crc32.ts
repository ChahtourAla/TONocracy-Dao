const POLYNOMIAL = -306674912;

let crc32_table: Int32Array | undefined = undefined;

function calcTable() {
    crc32_table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
        let r = i;
        for (let bit = 8; bit > 0; --bit) r = r & 1 ? (r >>> 1) ^ POLYNOMIAL : r >>> 1;
        crc32_table[i] = r;
    }
}

export function crc32(bytes: Buffer) {
    let crc = 0xffffffff;
    if (crc32_table === undefined) {
        calcTable();
    }
    for (let i = 0; i < bytes.length; ++i) crc = crc32_table![(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ -1) >>> 0;
}

export function crc32str(src: string) {
    return crc32(Buffer.from(src));
}
