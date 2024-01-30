import * as fs from 'fs';
import path from 'path'
import { LogInterface } from './main'
import {execTerragrunt} from "./execTerragrunt"

const batchSize: number = 5;

export const prepareTerragrunt = (processCwd: string, workingDirectory: string , apply: boolean, log: LogInterface): boolean =>  {
const dirBatches: string[][] = getDirInBatches(workingDirectory, batchSize);

for (const batch of dirBatches) {
    console.log('Batch to work:', batch);
        addFileInDirs(workingDirectory, batch, "terragrunt.hcl");
        execTerragrunt(workingDirectory, apply, log);
        removeFileFromDir(workingDirectory, batch, "terragrunt.hcl");
}
    return true;
}

function addFileInDirs(workingDir: string, dirList: string[], fileName: string): void {
    for (const dir of dirList) {
        const dirPath = path.join(workingDir, dir);
        const dirFile = path.join(dirPath, fileName);
        fs.writeFileSync(dirFile, '');
        console.log(`File "${fileName}" was added in "${dirPath}"`);
    }
}

function removeFileFromDir(workingDir: string, dirList: string[], fileName: string): void {
    for (const dir of dirList) {
        const filePath = path.join(workingDir, dir, fileName);
        fs.unlinkSync(filePath);
        console.log(`File "${fileName}" was deleted from "${path.join(workingDir, dir)}"`);
    }
}

function getDirInBatches(dir: string, batchSize: number): string[][] {
    const dirList: string[] = fs.readdirSync(dir)
        .filter(item => fs.statSync(path.join(dir, item)).isDirectory());

    const filteredDirList: string[] = filterDirList(dirList);
    const batch: string[][] = [];
    for (let i = 0; i < filteredDirList.length; i += batchSize) {
        batch.push(filteredDirList.slice(i, i + batchSize));
    }
    return batch;
}

function filterDirList(dirList: string[]): string[] {
    return dirList.filter(dir => {
        return !/^\.(git|github|terraform)$|^000-module$|^010-awm$|^999-legacy-projects$/.test(dir);
    });
}