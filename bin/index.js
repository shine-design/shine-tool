#!/usr/bin/env node

const yargs = require('yargs');

// Commands:
/*
 shine-tool init my-project
    1.选择模板:
        1): 基础模板
                1) 不带Router
                2) 带Router
        3）：带 Shine Design 整体框架模板
 shine-tool init my-project -simple (-s)
 shine-tool init my-project -template (-t)
shine-tool update 更新当前模板


 */


const argv = yargs
    .command({
        command: 'init [projectName]',
        aliases: ['i'],
        desc: '创建项目',
        builder: yargs => {
            yargs.positional(
                'projectName',
                {
                    alias: 'i',
                    describe: '项目名称',
                    default: 'demo'
                })
        },
        handler: (argv) => {
            const projectName = argv.projectName;
            console.log(projectName);
        }
    })
    .help()
    .argv;