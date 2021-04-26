//按需引入
const { override, fixBabelImports } = require('customize-cra');

module.exports = override(
    //按需引入
    fixBabelImports('import', {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: "css",
    }),

);

