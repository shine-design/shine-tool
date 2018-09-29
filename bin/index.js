#!/usr/bin/env node

const process = require('process');
const fs = require('fs');
const program = require('yargs');
const download = require('download-git-repo');
const inquirer = require('inquirer');
const ora = require('ora');
const shell = require('shelljs');
const log = require('tracer').colorConsole({
    format: "{{message}}",
    dateformat: "HH:MM:ss"
})

const spinner = ora({
    color: 'blue'
});

const defaultProjectName = 'shine-demo';
const argv = program
    .command({
        command: 'init [directory]',
        aliases: ['i'],
        desc: '创建新项目',
        builder: yargs => {
            yargs.positional(
                'directory',
                {
                    alias: 'i',
                    describe: '项目目录',
                    default: defaultProjectName
                })
        },
        handler: (argv) => {
            spinner.start(`正在校验目录...`);
            const directory = argv.directory;
            const isExist = fs.existsSync(directory);
            if (isExist) {
                // 当前目录已经存在
                if (fs.statSync(directory).isDirectory()) {
                    // 在当前目录下创建默认项目
                    spinner.stop();
                    inquirer.prompt([{
                        type: 'list',
                        choices: [
                            {name: '删除该目录并创建（该操作不可恢复）', value: 1},
                            {name: '取消创建', value: -1}],
                        name: 'pathChoose',
                        message: '当前目录已经存在，请选择操作:',
                        // default: defaultProjectName
                    }]).then((answers) => {
                        if (answers.pathChoose === 1) {
                            inquirer.prompt([{
                                type: 'confirm',
                                name: 'isChecked',
                                message: `确认清空目录${fs.realpathSync(directory)}?`,
                                default: true
                            }]).then((answers) => {
                                if (answers.isChecked) {
                                    spinner.start(`正在删除目录`);
                                    deleteFolderRecursive(directory);
                                    spinner.succeed(`目录删除成功`);
                                    spinner.start(`正在创建目录`);
                                    spinner.succeed(`目录创建成功`);
                                    downloadTemplate(directory, 'master');
                                } else process.exit();
                            })
                        } else process.exit();
                    })
                } else {
                    // 提示已存在
                    spinner.fail(`目录校验失败，${fs.realpathSync(directory)}不是有效的目录。`);
                }
            } else {
                // 不存在
                spinner.stop();
                inquirer.prompt([{
                    type: 'confirm',
                    name: 'isChecked',
                    message: `是否创建项目${directory.split('\/').pop()}?`,
                    default: true
                }]).then((answers) => {
                    if (answers.isChecked) {
                        spinner.succeed('目录校验成功');
                        spinner.start(`正在创建目录`);
                        spinner.succeed(`目录创建成功`);
                        downloadTemplate(directory, 'master');
                    } else process.exit();
                });
            }
        }
    })
    .help()
    .argv;


function deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}


function downloadTemplate(projectPath, version) {
    let spinner = ora({
        color: 'green'
    });
    spinner.start(`正在下载模板`);
    download('direct:https://github.com/shine-design/shine-template.git#' + version, projectPath, {
        clone: true
    }, (err) => {
        if (!err) {
            spinner.succeed('模板下载成功');
            spinner.start(`正在安装依赖\n`);
            if (shell.cd(projectPath).exec('npm install --progress false', {silent: true}).code !== 0) {
                spinner.fail(`依赖安装失败，请手动进入项目目录并执行'npm install'`);
            }
            spinner.succeed('依赖安装成功');
            spinner.succeed('项目构建完成');
            log.debug(finish(projectPath));
            process.exit(1);
        } else {
            console.log(err);
            //下载失败
            spinner.fail(`模板下载失败，请检查网络，或手动执行命令'git clone https://github.com/'shine-design/shine-template' ！`);
            process.exit(1);
        }
    })
}

function finish(path) {
    return `
开发环境：
cd ${path} && npm start

生产环境：
cd ${path} && npm run build
	`;
}