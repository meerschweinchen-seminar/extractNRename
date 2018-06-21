const path = require('path');
const fs = require('fs');

const deleteFolderRecursive = function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

const checkPlatform = function checkPlatform() {
    const os = require('os');

    const platform = os.platform();
    const osSupported = ['win32', 'linux'];

    console.log('Instalando...');
    if (!osSupported.includes(platform))
        throw new Error('Plataforma nao suportada');

    return platform;
};

const returnPaths = function returnPaths(platform) {
    const file = `chrome-${platform}`;
    const tmp = path.join(__dirname, `./chrome/${file}/${file}.tmp`);
    const zip = tmp.replace('.tmp', '.zip');

    return [file, tmp, zip];
};

const syncFolders = function syncFolders(tmp, zip, fileName) {
    fs.copyFileSync(tmp, zip);

    const pathToSource = path.join(__dirname, `./chrome/${fileName}/source`);
    if (fs.existsSync(pathToSource))
        deleteFolderRecursive(pathToSource);
};

const extract = function extract(zip, sourceTmp) {
    const admZip = require('adm-zip');
    var zip = new admZip(zip);
    zip.extractAllTo(sourceTmp, true);
};

const renameNRemove = function renameNRemove(tmp, zip, fileName) {
    fs.renameSync(path.join(`${tmp}/${fileName}`), path.join(`${tmp}/source`));
    fs.unlinkSync(zip);
};

try {
    const platform = checkPlatform();
    const [fileName, pathToChromeTmp, pathToChromeZip] = returnPaths(platform);

    console.log('Gerando arquivo zipado e Criando diretorio...');
    syncFolders(pathToChromeTmp, pathToChromeZip, fileName);

    const pathToSourceTmp = path.join(__dirname, `./chrome/${fileName}`);
    console.log('Extraindo arquivos...');
    extract(pathToChromeZip, pathToSourceTmp);

    console.log('Renomeando diretorio e Removendo zip temporario...');
    renameNRemove(pathToSourceTmp, pathToChromeZip, fileName);

    console.log('Finalizada instalacao do Chrome');
} catch (err) {
    console.log(err);
}
