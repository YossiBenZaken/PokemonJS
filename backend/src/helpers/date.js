import moment from 'moment';

var formatMap = {
    // Day
    d: 'DD',
    D: 'ddd',
    j: 'D',
    l: 'dddd',
    N: 'E',
  
    /**
     * Gets the ordinal suffix.
     *
     * @param {moment} momentDate Moment instance.
     *
     * @return {string} Formatted date.
     */
    S: function S(momentDate) {
      // Do - D
      var num = momentDate.format('D');
      var withOrdinal = momentDate.format('Do');
      return withOrdinal.replace(num, '');
    },
    w: 'd',
  
    /**
     * Gets the day of the year (zero-indexed).
     *
     * @param {moment} momentDate Moment instance.
     *
     * @return {string} Formatted date.
     */
    z: function z(momentDate) {
      // DDD - 1
      return '' + parseInt(momentDate.format('DDD'), 10) - 1;
    },
    // Week
    W: 'W',
    // Month
    F: 'MMMM',
    m: 'MM',
    M: 'MMM',
    n: 'M',
  
    /**
     * Gets the days in the month.
     *
     * @param {moment} momentDate Moment instance.
     *
     * @return {string} Formatted date.
     */
    t: function t(momentDate) {
      return momentDate.daysInMonth();
    },
    // Year
  
    /**
     * Gets whether the current year is a leap year.
     *
     * @param {moment} momentDate Moment instance.
     *
     * @return {string} Formatted date.
     */
    L: function L(momentDate) {
      return momentDate.isLeapYear() ? '1' : '0';
    },
    o: 'GGGG',
    Y: 'YYYY',
    y: 'YY',
    // Time
    a: 'a',
    A: 'A',
  
    /**
     * Gets the current time in Swatch Internet Time (.beats).
     *
     * @param {moment} momentDate Moment instance.
     *
     * @return {string} Formatted date.
     */
    B: function B(momentDate) {
      var timezoned = moment__WEBPACK_IMPORTED_MODULE_0___default()(momentDate).utcOffset(60);
      var seconds = parseInt(timezoned.format('s'), 10),
          minutes = parseInt(timezoned.format('m'), 10),
          hours = parseInt(timezoned.format('H'), 10);
      return parseInt((seconds + minutes * MINUTE_IN_SECONDS + hours * HOUR_IN_SECONDS) / 86.4, 10);
    },
    g: 'h',
    G: 'H',
    h: 'hh',
    H: 'HH',
    i: 'mm',
    s: 'ss',
    u: 'SSSSSS',
    v: 'SSS',
    // Timezone
    e: 'zz',
  
    /**
     * Gets whether the timezone is in DST currently.
     *
     * @param {moment} momentDate Moment instance.
     *
     * @return {string} Formatted date.
     */
    I: function I(momentDate) {
      return momentDate.isDST() ? '1' : '0';
    },
    O: 'ZZ',
    P: 'Z',
    T: 'z',
  
    /**
     * Gets the timezone offset in seconds.
     *
     * @param {moment} momentDate Moment instance.
     *
     * @return {string} Formatted date.
     */
    Z: function Z(momentDate) {
      // Timezone offset in seconds.
      var offset = momentDate.format('Z');
      var sign = offset[0] === '-' ? -1 : 1;
      var parts = offset.substring(1).split(':');
      return sign * (parts[0] * HOUR_IN_MINUTES + parts[1]) * MINUTE_IN_SECONDS;
    },
    // Full date/time
    c: 'YYYY-MM-DDTHH:mm:ssZ',
    // .toISOString
    r: 'ddd, D MMM YYYY HH:mm:ss ZZ',
    U: 'X'
  };
  
  export function date(dateFormat) {
    var dateValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date();
    var newFormat = [];
    var i, char;
    var offset = 2 * 60;
    var dateMoment = moment(dateValue).utcOffset(offset, true);
  
    for (i = 0; i < dateFormat.length; i++) {
      char = dateFormat[i]; // Is this an escape?
  
      if ('\\' === char) {
        // Add next character, then move on.
        i++;
        newFormat.push('[' + dateFormat[i] + ']');
        continue;
      }
  
      if (char in formatMap) {
        if (typeof formatMap[char] !== 'string') {
          // If the format is a function, call it.
          newFormat.push('[' + formatMap[char](momentDate) + ']');
        } else {
          // Otherwise, add as a formatting string.
          newFormat.push(formatMap[char]);
        }
      } else {
        newFormat.push('[' + char + ']');
      }
    } // Join with [] between to separate characters, and replace
    // unneeded separators with static text.
  
  
    newFormat = newFormat.join('[]');
    return dateMoment.format(newFormat);
  }