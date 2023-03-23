import * as _ from 'lodash';
import * as moment from 'moment';
import * as crypto from 'node:crypto';

export const chain = _.chain;
export const clone = _.cloneDeep;
export const map = _.map;
export const each = _.each;
export const filter = _.filter;
export const reject = _.reject;
export const keys = _.keys;
export const flatten = _.flatten;

export const formatDate = (date: moment.MomentInput, format = 'HH:mm DD.MM.YYYY') => moment(date).format(format);

export const getBufferHash = (buffer: Buffer) => {
    return crypto.createHash('sha256').update(buffer).digest('hex');
};
