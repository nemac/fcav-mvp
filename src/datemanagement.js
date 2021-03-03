function isLeapYear(year)
{
  return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
}

function toDate(julianDay, year) {
  // structure: YYYYMMDD
  julianDay = parseInt(julianDay);
  let monthIndex = 0;
  var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var dayCountLY = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
  if(isLeapYear(year)){
    dayCount = dayCountLY;
  }
  for (let i = 0; i < dayCount.length; i++) {
    if (julianDay > dayCount[i + 1]) {
      monthIndex = i + 1;
    }
  }
  let day = julianDay - dayCount[monthIndex];
  let dateObj = new Date(year, monthIndex, day);
  return dateObj;
}

function toWMSDate(dateObj, toHyphenate = false) {
  var year = String(dateObj.getFullYear());
  var month = String(dateObj.getMonth() + 1);
  var day = String(dateObj.getDate());
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  var wmsString = "";
  if (toHyphenate) {
    wmsString = year + "-" + month + "-" + day;
    return wmsString;
  }
  else {
    wmsString = year + month + day;
    return wmsString;
  }
}

export {isLeapYear, toDate, toWMSDate}
