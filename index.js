#!/usr/bin/env node

import * as fs from 'node:fs'
import * as path from 'node:path'
import prompts from 'prompts'
import * as banners from './utils/banners.js'
import download from 'download-git-repo'
import ora from 'ora'
import chalk from 'chalk'

async function init() {
    /**
     * 确定 Node.js 是否在终端上下文中运行的首选方法是检查 process.stdout.isTTY 属性的值是否为 true
     * 判断终端环境是否能支持渐变色相关的能力，支持则输出一个渐变色的炫酷的 banner 提示，否则输出一个默认的朴素的 banner 提示
     */
    console.log()
    console.log(
        process.stdout.isTTY && process.stdout.getColorDepth() > 8
            ? banners.gradientBanner
            : banners.defaultBanner
    )
    console.log()

    // 获取当前 Node.js 进程正在执行时的工作目录的路径
    const cwd = process.cwd()

    // 默认的项目名称
    const defaultProjectName = 'vue-project'

    try {
        await prompts(
            [
                {
                    name: 'name',
                    type: 'text',
                    message: '请输入项目名称：',
                    initial: defaultProjectName,
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
                    message: '项目描述：',
                    initial: 'a web project template with vue3'
                }
            ]
        ).then(res => {
            // 解构获取参数
            const { name, version, description } = res

            // 开始时间
            const beginTime = new Date().getTime()

            // 下载路径
            const downloadPath = path.join(cwd, name)

            // 模板下载
            const loading = ora('template downloading...')

            loading.start()

            download(`Demonjsj/vue-template`, downloadPath, err => {
                if (!err) {
                    // 下载成功
                    loading.succeed()

                    // 记录下载时间
                    const time = (new Date().getTime() - beginTime) / 1000

                    // 打印下载时间
                    console.log(chalk.green(`create project finish in ${time}s`))

                    // 替换 package.json 信息
                    const packagePath = path.join(downloadPath, 'package.json')

                    // 读取 package.json 信息
                    const packageJson = JSON.parse(fs.readFileSync(packagePath).toString())

                    // 将 name、version、description 赋值给 package.json
                    Object.assign(packageJson, { name, version, description })

                    // 写入文件
                    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, '\t'))
                } else {
                    loading.stop()
                    console.error(err)
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