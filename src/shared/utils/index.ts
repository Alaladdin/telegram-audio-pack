import * as moment from 'moment';

export const formatDate = (date: moment.MomentInput, format?: 'HH:mm DD.MM.YYYY') => moment(date).format(format);
