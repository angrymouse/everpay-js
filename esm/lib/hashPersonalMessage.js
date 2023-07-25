import createKeccakHash from 'keccak';
function createHashFunction(hashConstructor) {
    return msg => {
        const hash = hashConstructor();
        hash.update(msg);
        return Buffer.from(hash.digest());
    };
}
const keccak256 = createHashFunction(() => {
    return createKeccakHash('keccak256');
});
// cp from: https://github.com/ethereumjs/ethereumjs-util/blob/ebf40a0fba8b00ba9acae58405bca4415e383a0d/src/signature.ts#L168
const hashPersonalMessage = function (message) {
    const prefix = Buffer.from(`\u0019Ethereum Signed Message:\n${message.length.toString()}`, 'utf-8');
    return keccak256(Buffer.concat([prefix, message]));
};
export default hashPersonalMessage;
