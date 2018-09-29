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

yargs.command(
    'init [project]',
    '创建项目',
    (yargs) => {
        yargs.positional('project', {
            describe: '自定义项目名称',
            default: 5000
        })
    },
    (argv) => {
        console.log(argv.project)
    })
    .argv;