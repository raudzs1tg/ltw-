module.exports = {
  WebGLRenderer: function () {
    throw new Error('WebGL not supported in jsdom');
  },
};
