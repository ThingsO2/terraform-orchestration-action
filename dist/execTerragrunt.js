"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execTerragrunt = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const execTerragrunt = (processCwd, workspace, apply, log) => {
    process.chdir(path_1.default.join(processCwd));
    log.info('terragrunt run-all init');
    if (!spawnSyncTerragrunt(['run-all', 'init'], log)) {
        log.error('init failed');
        return false;
    }
    log.info('terragrunt run-all validate');
    if (!spawnSyncTerragrunt(['run-all', 'validate'], log)) {
        log.error('validate failed');
        return false;
    }
    log.info('terragrunt run-all plan');
    if (!spawnSyncTerragrunt(['run-all', 'plan', '-out=plan'], log)) {
        log.error('plan failed');
        return false;
    }
    if (apply === true) {
        log.info('terragrunt run-all apply');
        if (!spawnSyncTerragrunt(['run-all', 'apply', 'plan'], log)) {
            log.error('apply failed');
            return false;
        }
    }
    return true;
};
exports.execTerragrunt = execTerragrunt;
const spawnSyncTerragrunt = (options, log) => {
    const run = (0, child_process_1.spawnSync)('terragrunt', options);
    log.info(run.output[1].toString());
    log.info(run.output[2].toString());
    if (run.status !== 0) {
        const stderr = run.stderr;
        console.log('Salida de error:', stderr.toString());
        return false;
    }
    return true;
};
