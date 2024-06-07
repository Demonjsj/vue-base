#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import { parseArgs } from 'node:util'
import prompts from 'prompts'
import * as banners from './utils/banners.js'
import download from 'download-git-repo'
import ora from 'ora'
import chalk from 'chalk'

async function init() {
    console.log()
    console.log(
        process.stdout.isTTY && process.stdout.getColorDepth() > 8
            ? banners.gradientBanner
            : banners.defaultBanner
    )
    console.log()

    const cwd = process.cwd()

    const args = process.argv.slice(2)

    const options = {
        typescript: { type: 'boolean' },
        ts: { type: 'boolean' },
        'with-tests': { type: 'boolean' },
        tests: { type: 'boolean' },
        'vue-router': { type: 'boolean' },
        router: { type: 'boolean' },
        'vue-devtools': { type: 'boolean' },
        devtools: { type: 'boolean' }
    }

    const { values: argv, positionals } = parseArgs({
        args,
        options,
        strict: false
    })

    let targetDir = positionals[0]
    const defaultProjectName = !targetDir ? 'vue-project' : targetDir

    try {
        await prompts(
            [
                {
                    name: 'name',
                    type: targetDir ? null : 'text',
                    message: '请输入项目名称：',
                    initial: defaultProjectName,
                    onState: (state) => (targetDir = String(state.value).trim() || defaultProjectName)
                },
                {
                    name: 'version',
                    type: 'text',
                    message: '请输入版本号：',
                    initial: '1.0.0',
                },
                {
                    name: 'description',
                    type: 'text',
                    message: '项目描述',
                    initial: 'a web project template with vue3'
                }
            ]
        ).then(res => {
            const { name, version, description } = res
            const beginTime = new Date().getTime()
            const downloadPath = path.join(process.cwd(), name)
            const loading = ora('template downloading...')
            loading.start()
            download(`Demonjsj/vue-template`, downloadPath, err => {
                if (!err) {
                    loading.succeed()
                    const time = (new Date().getTime() - beginTime) / 1000
                    console.log(chalk.green(`create project finish in ${time}s`))
                    // 替换 package.json 信息
                    const packagePath = path.join(downloadPath, 'package.json')
                    const packageJson = JSON.parse(fs.readFileSync(packagePath).toString())
                    Object.assign(packageJson, { name, version, description })
                    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, '\t'))
                } else {
                    loading.stop()
                    console.error(err);
                }
            })
        })
    } catch (cancelled) {
        console.log(cancelled.message)
        process.exit(1)
    }
}

init().catch((e) => {
    console.error(e)
})