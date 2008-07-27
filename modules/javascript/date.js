/**
 *
 */

__shared__ = true;
 
importModule("core.object");


/**
 * Returns a copy of this date (not a reference).
 *
 * @return Date
 */
Date.prototype.clone = function() {
  return new Date(this - 0);
}


/**
 * Returns a number representing the date.
 * Milliseconds ellapsed since Jan 1, 1970.
 *
 * @return Date
 */
Date.prototype.toNumber =
Date.prototype.asNumber = function() {
  return (this - 0);
}


/**
 * Returns the week-number within the current year according to the Gregorian Calendar.
 *
 * @return Number
 */
Date.prototype.getWeek = function() {
   // code taken from http://www.codeproject.com/csharp/gregorianwknum.asp
   var year = this.getFullYear();
   var month = this.getMonth() + 1;
   var day = this.getDate();
   var a = Math.floor((14-(month))/12);
   var y = year + 4800 - a;
   var m = month + (12*a) - 3;
   // (gregorian calendar)
   var jd = day + Math.floor(((153*m)+2)/5) + (365*y) + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400) - 32045;
   //now calc weeknumber according to JD
   var d4 = (jd + 31741 - (jd%7)) % 146097 % 36524 % 1461;
   var L = Math.floor(d4/1460);
   var d1 = ((d4-L)%365)+L;
   return Math.floor(d1/7) + 1;
}
Date.prototype.__defineGetter__("week", Date.prototype.getWeek);


/**
 * Returns a date, representing now.
 *
 * @return Date
 */
Date.getNow = function() {
  return new Date();
}
Date.__defineGetter__("now", Date.getNow);


/**
 * Returns a date, representing today (at midnight).
 *
 * @return Date
 */
Date.getToday = function() {
  return new Date( new Date().setHours(0, 0, 0, 0) );
}
Date.__defineGetter__("today", Date.getToday);


/**
 * Returns a date, representing yesterday (at midnight).
 *
 * @return Date
 */
Date.getYesterday = function() {
  return new Date(today() - (1).day());
}
Date.__defineGetter__("yesterday", Date.getYesterday);


/**
 * Returns a date, representing tomorrow (at midnight).
 *
 * @return Date
 */
Date.getTomorrow = function() {
  return new Date((today() - 0) + (1).day());
}
Date.__defineGetter__("tomorrow", Date.getTomorrow);


/**
 * Returns a Date representing the start of the day (0:00).
 * @return Date
 */
Date.prototype.getMidnight =
Date.prototype.getBeginningOfDay = function() {
   return new Date(this.setHours(0,0,0,0));
}
Date.prototype.__defineGetter__("midnight", Date.prototype.getMidnight);
Date.prototype.__defineGetter__("beginningOfDay", Date.prototype.getBeginningOfDay);


/**
 * Returns a Date representing the start of the week Monday(0:00).
 * @return Date
 */
Date.prototype.getMonday =
Date.prototype.getBeginningOfWeek = function(firstDayInWeek) {
   var firstDayInWeek = (firstDayInWeek != null) ? firstDayInWeek : 1; // Monday=1; Sunday=0;
   return new Date( this.setDate( this.getDate() - (this.getDay() + 7 - firstDayInWeek) % 7 ) ).beginningOfDay();
}
Date.prototype.__defineGetter__("monday", Date.prototype.getMonday);
Date.prototype.__defineGetter__("beginningOfWeek", Date.prototype.getBeginningOfWeek);


/**
 * Returns a Date representing the start of the year 1st jan. of month(0:00).
 * @return Date
 */
Date.prototype.getBeginningOfMonth = function() {
  return new Date(this.setDate(1)).beginningOfDay();
}
Date.prototype.__defineGetter__("beginningOfMonth", Date.prototype.getBeginningOfMonth);


/**
 * Returns a Date representing the start of the year 1st jan. of month(0:00).
 * @return Date
 */
Date.prototype.getEndOfMonth = function() {
  // go to the 1st of this month, than add 1 month,
  // and set the day to 0, which is the day of the last month
  return new Date( new Date( new Date(this.setDate(1)).setMonth(this.getMonth() + 1) ).setDate(0) ).beginningOfDay();
}
Date.prototype.__defineGetter__("endOfMonth", Date.prototype.getEndOfMonth);


/**
 * Returns a Date representing the start of the year 1st jan. of month(0:00).
 * @return Date
 */
Date.prototype.getBeginningOfYear = function() {
   return new Date(this.getFullYear(), 0, 1);
}
Date.prototype.__defineGetter__("beginningOfYear", Date.prototype.getBeginningOfYear);


/**
 * Returns a date exactly (months) months ago.
 * Will return the last day of the previous month, if the previous
 * month is shorter. (31st Jan.).monthSince(2) -> 30th Nov.
 * @return Date
 */
Date.prototype.getMonthsAgo = function(months) {
  var originalDate = this.clone();
  var result = new Date( this.setMonth(this.getMonth() - months) );
  if (result.getDate() != originalDate.getDate())  {
     result = new Date(result.setDate(0));
  }
  return result;
}
Date.prototype.__defineGetter__("monthsAgo", Date.prototype.getMonthsAgo);


/**
 * Returns a date exactly (months) months ahead.
 * Will return the last day of the next month, if the next
 * month is shorter. (31st Jan.).monthSince(1) -> 28th Feb.
 *
 * @param month   Number of months to add
 * @return Date
 */
Date.prototype.getMonthsSince = function(months) {
  var originalDate = this.clone();
  var result = new Date( this.setMonth(this.getMonth() + months) );
  if (result.getDate() != originalDate.getDate())  {
     result = new Date(result.setDate(0));
  }
  return result;
}
Date.prototype.__defineGetter__("monthsSince", Date.prototype.getMonthsSince);


/**
 * Returns a date exactly 1 month ahead.
 * @return Date
 */
Date.prototype.getNextMonth = function() {
  return this.monthsSince(1);
}
Date.prototype.__defineGetter__("nextMonth", Date.prototype.getNextMonth);


/**
 * Returns a date exactly 1 month ago
 * @ return Date
 */
Date.prototype.getLastMonth = function() {
  return this.monthsAgo(1);
}
Date.prototype.__defineGetter__("lastMonth", Date.prototype.getLastMonth);


/**
 * Returns the difference between 2 dates as a Date Object
 * @param date, the date to compare to
 * @retun Date
 */
Date.prototype.diff = function(date) {
   if (this > date) {
      var diff = this - date;
   } else {
      var diff = date - this;
   }
   return new Date(0, 0, Math.floor(diff / (1).day()), Math.floor((diff % (1).day()) / (1).hour()), Math.floor((diff % (1).hour()) / (1).minute()));
}
