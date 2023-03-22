import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { getCleanAudioOptions } from './interfaces';
import * as stream from 'stream';
import { flatten } from 'lodash';

ffmpeg.setFfmpegPath(ffmpegPath);

@Injectable()
export class FfmpegService {
    private logger = new Logger(FfmpegService.name);

    async getCleanAudio(options: getCleanAudioOptions): Promise<Buffer> {
        return new Promise(async (resolve) => {
            const fileStream = await this.getAudioBufferStream(options);
            const buffer: Buffer[] = [];

            fileStream.on('data', function (chunk: Buffer) {
                buffer.push(chunk);
            });

            fileStream.on('end', function () {
                resolve(Buffer.concat(buffer));
            });
        });
    }

    private async getAudioBufferStream({ readable, title }: getCleanAudioOptions): Promise<stream.PassThrough> {
        const bufferStream = new stream.PassThrough();
        const outputOptions = flatten([
            ['-map_metadata', '-1'],
            ['-metadata', `title="${title}"`],
        ]);

        return new Promise((resolve, reject) => {
            ffmpeg(readable)
                .audioCodec('opus')
                .outputFormat('ogg')
                .outputOptions(outputOptions)
                .on('start', (command: string) => {
                    this.logger.log(`Executed command: ${command}`);
                })
                .on('progress', (progress) => {
                    this.logger.debug('Progress: ', progress);
                })
                .on('end', () => {
                    this.logger.log('Command executed successful');
                    resolve(bufferStream);
                })
                .on('error', (e) => {
                    this.logger.error(`Command execution error: ${e}`);
                    reject(e);
                })
                .writeToStream(bufferStream, { end: true });
        });
    }
}
