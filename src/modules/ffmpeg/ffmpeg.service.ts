import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { getCleanAudioOptions } from './ffmpeg.interface';
import { flatten, getTempFile } from '@utils';
import * as fs from 'fs/promises';
import { FileResult } from 'tmp-promise';

ffmpeg.setFfmpegPath(ffmpegPath);

@Injectable()
export class FfmpegService {
    private logger = new Logger(FfmpegService.name);

    async getCleanAudio(options: getCleanAudioOptions): Promise<Buffer> {
        const file = await this.getCleanAudioPath(options);

        return fs
            .readFile(file.path) // prettier-ignore
            .finally(() => {
                return file.cleanup();
            });
    }

    private async getCleanAudioPath({ url, title }: getCleanAudioOptions): Promise<FileResult> {
        const tempFile = await getTempFile();
        const audioTitle = this.getFileName(title);
        const outputOptions = flatten([
            ['-safe', '0'],
            ['-map_metadata', '-1'],
            ['-metadata', `title="${audioTitle}"`],
        ]);

        return new Promise((resolve, reject) => {
            ffmpeg(url)
                .audioCodec('opus')
                .outputFormat('ogg')
                .outputOptions(outputOptions)
                .on('start', (command: string) => {
                    this.logger.log(`Executed command: ${command}`);
                })
                .on('progress', (progress) => {
                    this.logger.debug('Progress: ', progress);
                })
                .on('stderr', (stderrLine) => {
                    this.logger.debug('Stderr output: ' + stderrLine);
                })
                .on('error', (e) => {
                    this.logger.error(`Command execution error: ${e}`);
                    reject(e);
                })
                .on('end', () => {
                    this.logger.log('Command executed successfully');
                    resolve(tempFile);
                })
                .save(tempFile.path);
        });
    }

    private getFileName(name: string) {
        return name.replace(/[\/\\'":*?<>]/g, '').replace(/\s/g, '_');
    }
}
