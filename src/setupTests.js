// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

if (typeof window !== 'undefined') {
  window.scrollTo = jest.fn();
}

jest.mock('three', () => ({
  WebGLRenderer: function () {
    throw new Error('WebGL not supported in jsdom');
  },
}));
