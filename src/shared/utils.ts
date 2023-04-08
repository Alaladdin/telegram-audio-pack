import * as _ from 'lodash';
import * as moment from 'moment';
import * as tmp from 'tmp-promise';
import * as crypto from 'node:crypto';
import * as Zip from 'adm-zip';
import { APP_NAME } from '@constants';
import _ms, { StringValue } from 'ms';

export const chain = _.chain;
export const clone = _.cloneDeep;
export const find = _.find;
export const map = _.map;
export const each = _.each;
export const filter = _.filter;
export const reject = _.reject;
export const some = _.some;
export const keys = _.keys;
export const sortBy = _.sortBy;
export const orderBy = _.orderBy;
export const flatten = _.flatten;
export const reduce = _.reduce;
export const debounce = _.debounce;
export const noop = _.noop;

export const sleep = (sec: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, sec * 1000);
    });
};

export const formatDate = (date: moment.MomentInput, format = 'HH:mm DD.MM.YYYY') => moment(date).format(format);
export const getSubtractedDate = (amount: moment.DurationInputArg1, unit: moment.unitOfTime.DurationConstructor) =>
    moment().subtract(amount, unit).toDate();

export const getBufferHash = (buffer: Buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

export const getTempDir = () => tmp.dir({ prefix: APP_NAME });
export const getTempFile = async () => {
    const dir = await getTempDir();

    return tmp
        .file({ dir: dir.path }) // prettier-ignore
        .then((file) => ({
            ...file,
            cleanup: async () => {
                await file.cleanup();
                await dir.cleanup();
            },
        }));
};

export const ms = (value: StringValue) => _ms(value);

export const getZip = () => new Zip();
