
var url = process.env.NODE_ENV === 'production' ? process.env.MONGO_URI : process.env.MODULUS_IO_URI;

module.exports = {
    'url': url
};
