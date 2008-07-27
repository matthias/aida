/*
 * Helma License Notice
 *
 * The contents of this file are subject to the Helma License
 * Version 2.0 (the "License"). You may not use this file except in
 * compliance with the License. A copy of the License is available at
 * http://adele.helma.org/download/helma/license.txt
 *
 * Copyright 1998-2006 Helma Software. All Rights Reserved.
 *
 * $RCSfile: String.js,v $
 * $Author: matthias.platzer AT knallgrau.at $
 * $Revision: 8714 $
 * $Date: 2007-12-13 13:21:48 +0100 (Don, 13 Dez 2007) $
 */
 
importModule("core.date")
__shared__ = true;

/**
 * @fileoverview Ruby on Rails (ActiveSupport) style helper functions 
 */ 
 
/**
 * Functions for calculating with Byte values based on Numbers.
 *
 * @example
 *   if (size > (12).kilobytes) { ... } 
 *
 * @Author Matthias.Platzer@knallgrau.at
 */


/**
 * Returns the number of bytes for (Number) * bit(s).
 * That means it returns 1/8th for 1 byte.
 *
 * @return Number
 */
Number.prototype.getBit =
Number.prototype.getBits = function() {
  return this / 8;
}
Number.prototype.__defineGetter__("bit", Number.prototype.getBit);
Number.prototype.__defineGetter__("bits", Number.prototype.getBits);


/**
 * Returns the number of bytes for (Number) * byte(s).
 * This is the same as the number itself - i know.
 *
 * @return Number
 */
Number.prototype.getByte =
Number.prototype.getBytes = function() {
  return this;
}
Number.prototype.__defineGetter__("byte", Number.prototype.getByte);
Number.prototype.__defineGetter__("bytes", Number.prototype.getBytes);


/**
 * Returns the number of bytes for (Number) * kilobyte(s).
 *
 * @return Number
 */
Number.prototype.getKiloByte =
Number.prototype.getKiloBytes = function() {
  return this * 1024;
}
Number.prototype.__defineGetter__("kilobyte", Number.prototype.getKiloByte);
Number.prototype.__defineGetter__("kilobytes", Number.prototype.getKiloBytes);


/**
 * Returns the number of bytes for (Number) * megabyte(s).
 *
 * @return Number
 */
Number.prototype.getMegaByte =
Number.prototype.getMegaBytes = function() {
  return this * 1024 * 1024;
}
Number.prototype.__defineGetter__("megabyte", Number.prototype.getMegaByte);
Number.prototype.__defineGetter__("megabytes", Number.prototype.getMegaBytes);


/**
 * Returns the number of bytes for (Number) * gigabyte(s).
 *
 * @return Number
 */
Number.prototype.getGigaByte =
Number.prototype.getGigaBytes = function() {
  return this * 1024 * 1024 * 1024;
}
Number.prototype.__defineGetter__("gigabyte", Number.prototype.getGigaByte);
Number.prototype.__defineGetter__("gigabytes", Number.prototype.getGigaBytes);


/**
 * Returns the number of bytes for (Number) * terabyte(s).
 *
 * @return Number
 */
Number.prototype.getTeraByte =
Number.prototype.getTeraBytes = function() {
  return this * 1024 * 1024 * 1024 * 1024;
}
Number.prototype.__defineGetter__("terabyte", Number.prototype.getTeraByte);
Number.prototype.__defineGetter__("terabytes", Number.prototype.getTeraBytes);


/**
 * Returns the number of bytes for (Number) * petabyte(s).
 *
 * @return Number
 */
Number.prototype.getPetaByte =
Number.prototype.getPetaBytes = function() {
  return this * 1024 * 1024 * 1024 * 1024 * 1024;
}
Number.prototype.__defineGetter__("petabyte", Number.prototype.getPetaByte);
Number.prototype.__defineGetter__("petabytes", Number.prototype.getPetaBytes);


/**
 * Returns the number of bytes for (Number) * exabyte(s).
 *
 * @return Number
 */
Number.prototype.getExaByte =
Number.prototype.getExaBytes = function() {
  return this * 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
}
Number.prototype.__defineGetter__("exabyte", Number.prototype.getExaByte);
Number.prototype.__defineGetter__("exabytes", Number.prototype.getExaBytes);


/**
 * Returns the number rounded
 *
 * @param fractionDigits number of decimal points
 * @return Number
 */
Number.prototype.round = function(fractionDigits) {
   if (!fractionDigits) fractionDigits = 0;
   var pow = Math.pow(10, fractionDigits)
   return Math.round(this * pow) / pow;
}
Number.prototype.__defineGetter__("megabyte", Number.prototype.getMegaByte);
Number.prototype.__defineGetter__("megabytes", Number.prototype.getMegaBytes);


/**
 * Functions for calculating with Time values based in Numbers.
 * based in RoR library, but it is using milliseconds instead of seconds,
 * because this is the basic unit in Javascript for time values.
 *
 * @example
 *   ( (2).hours + (45).minutes ).ago().format("dd.MM.yyyy HH:mm:ss");
 *   ( (10).minutes ).since( (1).hour.ago() );
 *
 * @Author Matthias.Platzer@knallgrau.at
 */


/**
 * Returns a Date that is n milliseconds from dateTime.
 *
 * @param dateTime   Date, base of calculation.
 * @return Date
 */
Number.prototype.until =  function(dateTime) {
  return new Date(dateTime - this);
}


/**
 * Returns a Date that is n milliseconds ago.
 *
 * @param now   optional date for base of calculation.
 * @return Date
 */
Number.prototype.getAgo = function() {
  return new Date((Date.now - 0) - this);
}
Number.prototype.__defineGetter__("ago", Number.prototype.getAgo);


/**
 * Returns a Date that is n milliseconds in the future from now.
 *
 * @param now   optional date for base of calculation.
 * @return Date
 */
Number.prototype.fromNow = function() {
   return new Date(Date.now + this);
}


/**
 * Returns a Date that is n milliseconds in the future from dateTime.
 *
 * @param dateTime   Date, base of calculation.
 * @return Date
 */
Number.prototype.since = function(dateTime) {
  return new Date(dateTime + this);
}


/**
 * Returns this number as Date.
 *
 * @return Date
 */
Number.prototype.getAsDate =
Number.prototype.convertToDate = function() {
  return new Date(this);
}


/**
 * Returns the time in milliseconds for (Number).
 *
 * @return Number
 */
Number.prototype.getMilliSecond =
Number.prototype.getMilliSeconds = function() {
  return this;
}
Number.prototype.__defineGetter__("millisecond", Number.prototype.getMilliSecond);
Number.prototype.__defineGetter__("milliseconds", Number.prototype.getMilliSeconds);


/**
 * Returns the time in milliseconds for (Number) * second(s).
 *
 * @return Number
 */
Number.prototype.getSecond =
Number.prototype.getSeconds = function() {
  return this * 1000;
}
Number.prototype.__defineGetter__("second", Number.prototype.getSecond);
Number.prototype.__defineGetter__("seconds", Number.prototype.getSeconds);


/**
 * Returns the time in milliseconds for (Number) * minute(s).
 *
 * @return Number
 */
Number.prototype.getMinute =
Number.prototype.getMinutes = function() {
  return this * (60 * 1000);
}
Number.prototype.__defineGetter__("minute", Number.prototype.getMinute);
Number.prototype.__defineGetter__("minutes", Number.prototype.getMinutes);


/**
 * Returns the time in milliseconds for (Number) * hour(s).
 *
 * @return Number
 */
Number.prototype.getHour =
Number.prototype.getHours = function() {
  return this * (60 * 60 * 1000); // an hour has 60 minutes by 60 seconds
}
Number.prototype.__defineGetter__("hour", Number.prototype.getHour);
Number.prototype.__defineGetter__("hours", Number.prototype.getHours);


/**
 * Returns the time in milliseconds for (Number) * day(s).
 *
 * @return Number
 */
Number.prototype.getDay =
Number.prototype.getDays = function() {
  return this * (24 * 3600 * 1000); // a day has 24 hours by 3600 seconds
}
Number.prototype.__defineGetter__("day", Number.prototype.getDay);
Number.prototype.__defineGetter__("days", Number.prototype.getDays);


/**
 * Returns the time in milliseconds for (Number) * week(s).
 *
 * @return Number
 */
Number.prototype.getWeek =
Number.prototype.getWeeks = function() {
  return this * (7).days();
}
Number.prototype.__defineGetter__("week", Number.prototype.getWeek);
Number.prototype.__defineGetter__("weeks", Number.prototype.getWeeks);


/**
 * Returns the time in milliseconds for (Number) * 14 day(s).
 *
 * @return Number
 */
Number.prototype.getFortNight =
Number.prototype.getFortNights = function() {
  return this * (2).weeks();
}
Number.prototype.__defineGetter__("fortnight", Number.prototype.getFortNight);
Number.prototype.__defineGetter__("fortnights", Number.prototype.getFortNights);


/**
 * Returns the time in milliseconds for (Number) month(s) (from now).
 * If you don't want to use now as the base time, you may pass an optional
 * date value as the first parameter.
 *
 * @param time   optional Date, used as base to calculate the year.
 * @return Number
 */
Number.prototype.getMonth =
Number.prototype.getMonths = function(time) {
  var time = time || new Date();
  var now = new Date();
  return (time.setMonth(time.getMonth() + this) - now);
}
Number.prototype.__defineGetter__("month", Number.prototype.getMonth);
Number.prototype.__defineGetter__("months", Number.prototype.getMonths);


/**
 * Returns the time in milliseconds for (Number) year(s) (from now).
 * If you don't want to use now as the base time, you may pass an optional
 * date value as the first parameter.
 *
 * @param time   optional Date, used as base to calculate the year.
 * @return Number
 */
Number.prototype.getYear =
Number.prototype.getYears = function(time) {
  var time = time || new Date();
  var now = new Date();
  return (time.setFullYear(time.getFullYear() + this) - now);
}
Number.prototype.__defineGetter__("year", Number.prototype.getYear);
Number.prototype.__defineGetter__("years", Number.prototype.getYears);


/**
 * Returns if this Number is a multiple of number.
 * @param number   Number
 * @return Boolean
 */
Number.prototype.isMultipleOf = function(number) {
   return (this % number == 0);
}


/**
 * Returns if this Number is even.
 * @return Boolean
 */
Number.prototype.isEven = function() {
   return (this % 2 == 0);
}


/**
 * Returns if this Number is odd.
 * @return Boolean
 */
Number.prototype.isOdd = function() {
   return (this % 2 != 0);
}


/**
 * format a Number to a String
 * @param String Format pattern
 * @param java.util.Locale An optional Locale instance
 * @return String Number formatted to a String
 */
Number.prototype.format = function(fmt, locale) {
    var symbols;
    if (locale != null) {
        symbols = new java.text.DecimalFormatSymbols(locale);
    } else {
        symbols = new java.text.DecimalFormatSymbols();
    }
    var df = new java.text.DecimalFormat(fmt || "###,##0.##", symbols);
    return df.format(0 + this); // addition with 0 prevents exception
};


/** 
 * return the percentage of a Number
 * according to a given total Number
 * @param Int Total
 * @param String Format Pattern
 * @param java.util.Locale An optional Locale instance
 * @return Int Percentage
 */
Number.prototype.toPercent = function(total, fmt, locale) {
    if (!total)
        return (0).format(fmt, locale);
    var p = this / (total / 100);
    return p.format(fmt, locale);
};


/**
 * factory to create functions for sorting objects in an array
 * @param String name of the field each object is compared with
 * @param Number order (ascending or descending)
 * @return Function ready for use in Array.prototype.sort
 */
Number.Sorter = function(field, order) {
    if (!order)
        order = 1;
    return function(a, b) {
        return (a[field] - b[field]) * order;
    };
};

Number.Sorter.ASC = 1;
Number.Sorter.DESC = -1;

// prevent any newly added properties from being enumerated
/*
for (var i in Number)
   Number.dontEnum(i);
for (var i in Number.prototype)
   Number.prototype.dontEnum(i);
*/
