/**
 * Test setup and utilities for Sip&Link
 * Uses Jest and React Testing Library
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that includes providers
 * Can be extended to include Router, Redux, etc.
 */
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  return render(ui, { ...options });
};

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react';
export { customRender as render };

/**
 * Mock window.matchMedia for testing
 */
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });
};

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    })
  };
};

/**
 * Mock fetch for testing API calls
 */
export const mockFetch = (response: any, ok: boolean = true) => {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: () => Promise.resolve(response)
    })
  );
};

/**
 * Wait for async operations in tests
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));
