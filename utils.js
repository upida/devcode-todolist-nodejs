function dateformat_current() {
  var d = new Date(),
    dformat =
      [d.getFullYear(), d.getMonth() + 1, d.getDate()].join("-") +
      " " +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");

  return dformat;
}

module.exports = { dateformat_current };
