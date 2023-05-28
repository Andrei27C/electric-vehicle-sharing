function epochSecondsToDateTime(secs) {
  let t = new Date(1970, 0, 1); // Epoch
  t.setSeconds(secs);
  return t;
}

module.exports.epochSecondsToDateTime = epochSecondsToDateTime;
