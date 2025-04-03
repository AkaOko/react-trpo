describe("Тесты рабочего процесса", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/login");
    // Очищаем localStorage перед каждым тестом
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it("Вход под мастером и создание заявки", () => {
    // Перехватываем запрос входа до его выполнения
    cy.intercept("POST", "http://localhost:5000/login").as("loginRequest");

    // Вход под мастером
    cy.get('input[type="email"]').type("worker@gmail.com");
    cy.get('input[type="password"]').type("worker");
    cy.get("button").contains("Войти").click();

    // Ждем ответа от сервера и сохранения токена
    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.token).to.exist;
    });

    // Переход на страницу мастера
    cy.visit("http://localhost:5173/worker");

    // Создание заявки на пополнение материалов
    cy.contains("Создать заявку на пополнение").should("exist");
    cy.get("select").select(1); // Выбираем первый материал из списка
    cy.get('input[type="number"]').type("10");

    // Перехватываем запрос создания заявки
    cy.intercept("POST", "http://localhost:5000/material-requests").as(
      "createRequest"
    );

    cy.get("button").contains("Создать заявку").click();

    // Проверяем успешное создание заявки через ответ сервера
    cy.wait("@createRequest").then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
    });

    // Проверяем, что заявка появилась в списке
    cy.contains("Текущие заявки").should("exist");
    cy.contains("10").should("exist"); // Проверяем количество
  });

  it("Редактирование номера телефона в профиле мастера", () => {
    // Перехватываем запрос входа до его выполнения
    cy.intercept("POST", "http://localhost:5000/login").as("loginRequest");

    // Вход под мастером
    cy.get('input[type="email"]').type("worker@gmail.com");
    cy.get('input[type="password"]').type("worker");
    cy.get("button").contains("Войти").click();

    // Ждем ответа от сервера и сохранения токена
    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.token).to.exist;
    });

    // Переход в профиль
    cy.visit("http://localhost:5173/profile");

    // Редактирование данных профиля
    cy.get('input[type="email"]').clear().type("worker@gmail.com");
    cy.get('input[type="tel"]').clear().type("79991234567");

    // Перехватываем запрос обновления профиля
    cy.intercept("PUT", "http://localhost:5000/update-profile").as(
      "updateProfile"
    );

    cy.get("button").contains("Сохранить изменения").click();

    // Проверяем успешное обновление профиля
    cy.wait("@updateProfile").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    // Проверяем, что данные обновились в полях ввода
    cy.get('input[type="email"]').should("have.value", "worker@gmail.com");
    cy.get('input[type="tel"]').should("have.value", "79991234567");
  });

  it("Вход под админом и одобрение заявки", () => {
    // Перехватываем запрос входа до его выполнения
    cy.intercept("POST", "http://localhost:5000/login").as("loginRequest");

    // Вход под админом
    cy.get('input[type="email"]').type("admin@gmail.com");
    cy.get('input[type="password"]').type("admin");
    cy.get("button").contains("Войти").click();

    // Ждем ответа от сервера и сохранения токена
    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.token).to.exist;
    });

    // Переход на страницу админа
    cy.visit("http://localhost:5173/admin");

    // Перехватываем запрос обновления статуса заявки
    cy.intercept("PUT", "http://localhost:5000/material-requests/*").as(
      "updateRequest"
    );

    // Находим строку таблицы со статусом "Ожидает"
    cy.contains("tr", "Ожидает").within(() => {
      // Находим и нажимаем кнопку "Одобрить" в этой строке
      cy.get("button").contains("Одобрить").click();
    });

    // Проверяем успешное обновление статуса заявки
    cy.wait("@updateRequest").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    // Проверяем, что статус заявки изменился на "Одобрено"
    cy.contains("Одобрено").should("exist");
  });

  it("Создание нового товара админом", () => {
    // Перехватываем запрос входа до его выполнения
    cy.intercept("POST", "http://localhost:5000/login").as("loginRequest");

    // Вход под админом
    cy.get('input[type="email"]').type("admin@gmail.com");
    cy.get('input[type="password"]').type("admin");
    cy.get("button").contains("Войти").click();

    // Ждем ответа от сервера и сохранения токена
    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.token).to.exist;
    });

    // Переход на страницу админа
    cy.visit("http://localhost:5173/admin");

    // Перехватываем запрос создания товара
    cy.intercept("POST", "http://localhost:5000/products").as("createProduct");

    // Создание нового товара
    cy.get("button").contains("Добавить товар").click();
    cy.get('input[name="name"]').type("Новый товар");
    cy.get('select[name="type"]').select(1); // Выбираем первый тип товара
    cy.get('select[name="materialName"]').select(1); // Выбираем первый материал
    cy.get('input[name="price"]').type("1000");
    cy.get('input[type="file"]').selectFile("cypress/fixtures/test-image.jpg");
    cy.get("button").contains("Добавить").click();

    // Проверяем успешное создание товара
    cy.wait("@createProduct").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    // Проверяем, что товар появился в списке
    cy.contains("Новый товар").should("exist");
  });
});
