window.Buffer = window.Buffer || require("buffer").Buffer;
window.process = {
  nextTick: function () {
    return null;
  }
};

export default {};
