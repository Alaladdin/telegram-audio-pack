import stream from 'stream';

export interface getCleanAudioOptions {
    readable: stream.Readable;
    title: string;
}
