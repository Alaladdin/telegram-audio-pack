import { Injectable, Logger } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { Metadata } from './interfaces';
import * as stream from 'stream';
import { flatten } from 'lodash';

ffmpeg.setFfmpegPath(ffmpegPath);

@Injectable()
export class FfmpegService {
    private logger = new Logger(FfmpegService.name);

    async getOggFile(readable: stream.Readable, metadata: Metadata): Promise<Buffer> {
        return new Promise(async (resolve) => {
            const fileStream = await this.getOggBufferStream(readable, metadata);
            const buffer: Buffer[] = [];

            fileStream.on('data', function (chunk: Buffer) {
                buffer.push(chunk);
            });

            fileStream.on('end', function () {
                resolve(Buffer.concat(buffer));
            });
        });
    }

    private async getOggBufferStream(readable: stream.Readable, metadata: Metadata): Promise<stream.PassThrough> {
        const bufferStream = new stream.PassThrough();
        const outputOptions = flatten([
            ['-map_metadata', '-1'],
            ['-metadata', `title="${metadata.title}"`],
        ]);

        return new Promise((resolve, reject) => {
            ffmpeg(readable)
                .audioCodec('opus')
                // .format('ogg')
                .outputFormat('ogg')
                .outputOptions(outputOptions)
                .on('start', (command: string) => {
                    this.logger.log(`Command executed: ${command}`);
                })
                .on('progress', (progress) => {
                    this.logger.verbose('Progress: ', progress);
                })
                .on('end', () => {
                    this.logger.log('Done');
                    resolve(bufferStream);
                })
                .on('error', (e) => {
                    this.logger.error(`Error: ${e}`);
                    reject(e);
                })
                .writeToStream(bufferStream, { end: true });
        });
    }
}
