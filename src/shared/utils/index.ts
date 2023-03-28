import * as _ from 'lodash';
import * as moment from 'moment';
import * as tmp from 'tmp-promise';
import * as crypto from 'node:crypto';
import { APP_NAME } from '@constants';

export const chain = _.chain;
export const clone = _.cloneDeep;
export const map = _.map;
export const each = _.each;
export const filter = _.filter;
export const reject = _.reject;
export const some = _.some;
export const keys = _.keys;
export const flatten = _.flatten;

export const formatDate = (date: moment.MomentInput, format = 'HH:mm DD.MM.YYYY') => moment(date).format(format);
export const getSubtractedDate = (amount: moment.DurationInputArg1, unit: moment.unitOfTime.DurationConstructor) =>
    moment().subtract(amount, unit).toDate();

export const getBufferHash = (buffer: Buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};

export const getTempDir = (): Promise<string> => tmp.dir({ prefix: APP_NAME }).then((result) => result.path);
export const getTempFile = async (): Promise<string> => {
    const dir = await getTempDir();

    return tmp.file({ dir }).then((result) => result.path);
};
