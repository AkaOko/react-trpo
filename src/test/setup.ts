import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Расширяем expect с матчерами из @testing-library/jest-dom
expect.extend(matchers);

// Очищаем DOM после каждого теста
afterEach(() => {
  cleanup();
});
