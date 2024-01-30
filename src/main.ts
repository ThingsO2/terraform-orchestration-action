import { getGitModifiedDirectories } from './getGitModifiedDirectories'
import { getDirectoriesToRun } from './getDirectories'
import { checkMainGitPath } from './checkMainGitPath'
import {execTerraform} from "./execTerraform"
import {prepareTerragrunt} from "./prepareTerragrunt"
import {execTerragrunt} from "./execTerragrunt"

interface Input {
    workingDirectory: string
    baseRef: string
    headRef: string
    excludeDirectories: Array<string>
    commonModules: Array<string>
    workspace: string | undefined
    apply: boolean
}

export interface LogInterface {
    info: (message: string) => void
    error: (message: string) => void
}

export const main = (input: Input, log: LogInterface): void => {
    log.info('Running...')
    log.info(`Working directory: ${input.workingDirectory}`)
    log.info(`Base ref: ${input.baseRef}`)
    log.info(`Head ref: ${input.headRef}`)
    log.info(`Exclude directories: ${input.excludeDirectories}`)
    log.info(`Common modules: ${input.commonModules}`)
    log.info(`Workspace: ${input.workspace}`)
    log.info(`Apply: ${input.apply}`)
    const processCwd = process.cwd() //pwd
    checkMainGitPath(log).then(() => {
      log.info("******** geGitModifiedDirs")
        getGitModifiedDirectories(input.workingDirectory, input.baseRef, input.headRef, input.excludeDirectories, log)
            .then(components => {
              log.info("******** check runAll")
              // components.push("000-module"); // Only for test
              
              const runAll = components.some(componentPath => {
                return componentPath.includes(input.commonModules);
            });

            if (runAll) {
              log.info("Running for all modules using Terragrunt . . . .");
              console.log("workingDir --> " , input.workingDirectory)
              console.log("processCwd --> " , processCwd)
              prepareTerragrunt(processCwd, input.workingDirectory, input.apply, log);
              // execTerragrunt(processCwd, input.apply, log);

            } else {
              log.info("Using Terraform for modules");
              const componentsToRun = getDirectoriesToRun(components, input.workingDirectory, input.commonModules, input.excludeDirectories, log)
              componentsToRun.map(componentPath => {
                execTerraform( processCwd, componentPath, input.workspace, input.apply, log)
              });
            }
    }).catch(e => {
        log.error(e.message)
        throw e
    })
  })
}