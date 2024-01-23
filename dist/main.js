"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const getGitModifiedDirectories_1 = require("./getGitModifiedDirectories");
const checkMainGitPath_1 = require("./checkMainGitPath");
const main = (input, log) => {
    log.info('Running...');
    log.info(`Working directory: ${input.workingDirectory}`);
    log.info(`Base ref: ${input.baseRef}`);
    log.info(`Head ref: ${input.headRef}`);
    log.info(`Exclude directories: ${input.excludeDirectories}`);
    log.info(`Common modules: ${input.commonModules}`);
    log.info(`Workspace: ${input.workspace}`);
    log.info(`Apply: ${input.apply}`);
    log.info("******** some changed here");
    const processCwd = process.cwd();
    (0, checkMainGitPath_1.checkMainGitPath)(log).then(() => {
        log.info("******** geGitModifiedDirs");
        (0, getGitModifiedDirectories_1.getGitModifiedDirectories)(input.workingDirectory, input.baseRef, input.headRef, input.excludeDirectories, log)
            .then(components => {
            log.info("******** check runAll");
            const runAll = components.some(componentPath => {
                // check if root path was update
                console.log("********componentPath --> ", componentPath);
                const filtered = componentPath.filter((x) => x.includes(input.commonModules.toString()));
                return componentPath.includes(input.commonModules);
            });
            if (runAll) {
                log.info("Running for all modules using Terragrunt . . . .");
                // execTerragrunt(processCwd,input.workspace, input.apply, log);
            }
            else {
                log.info("Using Terraform for modules");
                // const componentsToRun = getDirectoriesToRun(components, input.workingDirectory, input.commonModules, input.excludeDirectories, log)
                // componentsToRun.map(componentPath => {
                //   execTerraform( processCwd, componentPath, input.workspace, input.apply, log)
                // });
            }
        }).catch(e => {
            log.error(e.message);
            throw e;
        });
    });
};
exports.main = main;
