import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { vi } from "vitest";
import AdminPage from "../AdminPage";
import { jwtDecode } from "jwt-decode";

// Мокаем axios
vi.mock("axios");

// Мокаем jwt-decode
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(() => ({ role: "ADMIN", exp: Date.now() / 1000 + 3600 })),
}));

// Мокаем localStorage
const localStorageMock = {
  getItem: vi.fn(() => "fake-token"),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Мокаем console.error
const consoleErrorSpy = vi.spyOn(console, "error");

// Вспомогательная функция для рендеринга с Router
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("AdminPage - Загрузка изображений", () => {
  beforeEach(() => {
    // Сбрасываем все моки перед каждым тестом
    vi.clearAllMocks();

    // Мокаем успешные ответы для начальной загрузки данных
    axios.get.mockImplementation((url) => {
      switch (url) {
        case "http://localhost:5000/products":
          return Promise.resolve({ data: [] });
        case "http://localhost:5000/materials":
          return Promise.resolve({ data: [{ id: 1, name: "Материал 1" }] });
        case "http://localhost:5000/product-types":
          return Promise.resolve({ data: [{ id: 1, name: "Тип 1" }] });
        case "http://localhost:5000/orders":
          return Promise.resolve({ data: [] });
        default:
          return Promise.resolve({ data: [] });
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("должен успешно загрузить изображение при добавлении нового продукта", async () => {
    // Мокаем успешную загрузку изображения и добавление продукта
    const uploadResponse = { data: { url: "test-url.jpg" } };
    const productResponse = {
      data: {
        id: 1,
        name: "Тестовый продукт",
        type: "Тип 1",
        materialName: "Материал 1",
        price: "100",
        image: "test-url.jpg",
      },
    };

    axios.post.mockImplementation((url) => {
      if (url === "http://localhost:5000/upload") {
        return Promise.resolve(uploadResponse);
      }
      if (url === "http://localhost:5000/products") {
        return Promise.resolve(productResponse);
      }
      return Promise.resolve({ data: {} });
    });

    renderWithRouter(<AdminPage />);

    // Ждем загрузки компонента
    await waitFor(() => {
      expect(screen.getByLabelText(/название/i)).toBeInTheDocument();
    });

    // Находим поля формы
    const nameInput = screen.getByTestId("name-input");
    const typeSelect = screen.getByTestId("type-select");
    const materialSelect = screen.getByTestId("material-select");
    const priceInput = screen.getByTestId("price-input");
    const fileInput = screen.getByTestId("image-input");

    // Заполняем форму
    await userEvent.type(nameInput, "Тестовый продукт");
    await userEvent.selectOptions(typeSelect, "Тип 1");
    await userEvent.selectOptions(materialSelect, "Материал 1");
    await userEvent.type(priceInput, "100");

    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    await userEvent.upload(fileInput, file);

    // Находим форму и отправляем её
    const form = screen.getByRole("form");
    fireEvent.submit(form);

    // Проверяем, что API вызывается с правильными данными
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5000/upload",
        expect.any(FormData),
        expect.any(Object)
      );
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5000/products",
        expect.objectContaining({
          name: "Тестовый продукт",
          type: "Тип 1",
          materialName: "Материал 1",
          price: "100",
          image: "test-url.jpg",
        })
      );
    });
  });

  test("должен показать ошибку при неудачной загрузке изображения", async () => {
    const error = new Error("Ошибка загрузки");
    // Мокаем ошибку при загрузке изображения
    axios.post.mockRejectedValueOnce(error);

    renderWithRouter(<AdminPage />);

    // Ждем загрузки компонента
    await waitFor(() => {
      expect(screen.getByLabelText(/название/i)).toBeInTheDocument();
    });

    // Находим поля формы
    const nameInput = screen.getByTestId("name-input");
    const typeSelect = screen.getByTestId("type-select");
    const materialSelect = screen.getByTestId("material-select");
    const priceInput = screen.getByTestId("price-input");
    const fileInput = screen.getByTestId("image-input");

    // Заполняем форму
    await userEvent.type(nameInput, "Тестовый продукт");
    await userEvent.selectOptions(typeSelect, "Тип 1");
    await userEvent.selectOptions(materialSelect, "Материал 1");
    await userEvent.type(priceInput, "100");

    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    await userEvent.upload(fileInput, file);

    // Находим форму и отправляем её
    const form = screen.getByRole("form");
    fireEvent.submit(form);

    // Проверяем, что ошибка обработана
    await waitFor(() => {
      expect(
        screen.getByText(/не удалось добавить товар/i, {
          selector: ".grid .col-span-3",
        })
      ).toBeInTheDocument();
    });
  });
});

// Кастомный матчер для поиска input[type="file"] с accept="image/*"
function getByAcceptingImage() {
  return screen.getByRole("textbox", { type: "file", accept: "image/*" });
}
