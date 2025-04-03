describe("Тесты страницы каталога", () => {
  beforeEach(() => {
    cy.visit("/catalog");
    // Ждем загрузки товаров
    cy.wait(2000);
  });

  it("Проверка фильтрации товаров по цене", () => {
    // Проверяем наличие поля для максимальной цены в боковой панели
    cy.get('[data-testid="max-price-input"]').should("exist");

    // Устанавливаем максимальную цену
    cy.get('[data-testid="max-price-input"]').type("5000");

    // Ждем обновления результатов
    cy.wait(1000);

    // Проверяем, что товары отфильтрованы по цене
    cy.get('[data-testid="product-card"]').each(($item) => {
      cy.wrap($item)
        .find('[data-testid="product-price"]')
        .invoke("text")
        .then((price) => {
          const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ""));
          expect(numericPrice).to.be.at.most(5000);
        });
    });
  });

  it("Проверка поиска товаров", () => {
    // Проверяем наличие поля поиска
    cy.get('[data-testid="search-input"]').should("exist");

    // Проверяем, что есть хотя бы один товар
    cy.get('[data-testid="product-card"]').should("exist");

    // Получаем название первого товара
    cy.get('[data-testid="product-name"]')
      .first()
      .invoke("text")
      .then((productName) => {
        // Используем первое слово из названия для поиска
        const searchTerm = productName.split(" ")[0];

        // Вводим поисковый запрос
        cy.get('[data-testid="search-input"]').clear().type(searchTerm);

        // Ждем обновления результатов
        cy.wait(1000);

        // Проверяем, что результаты поиска отображаются
        cy.get('[data-testid="product-card"]').should("exist");

        // Проверяем, что каждый результат содержит искомое слово
        cy.get('[data-testid="product-card"]').each(($item) => {
          cy.wrap($item)
            .find('[data-testid="product-name"]')
            .invoke("text")
            .should("match", new RegExp(searchTerm, "i"));
        });
      });
  });

  it("Проверка сортировки товаров", () => {
    // Проверяем наличие селектора сортировки в боковой панели
    cy.get('[data-testid="sort-select"]').should("exist");

    // Сортируем по возрастанию цены
    cy.get('[data-testid="sort-select"]').select("asc");

    // Ждем обновления результатов
    cy.wait(1000);

    // Получаем все цены и проверяем сортировку
    cy.get('[data-testid="product-price"]').then(($prices) => {
      const prices = $prices
        .map((_, el) => parseFloat(el.textContent.replace(/[^0-9.]/g, "")))
        .get();

      // Проверяем, что цены отсортированы по возрастанию
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).to.be.at.least(prices[i - 1]);
      }
    });

    // Сортируем по убыванию цены
    cy.get('[data-testid="sort-select"]').select("desc");

    // Ждем обновления результатов
    cy.wait(1000);

    // Проверяем сортировку по убыванию
    cy.get('[data-testid="product-price"]').then(($prices) => {
      const prices = $prices
        .map((_, el) => parseFloat(el.textContent.replace(/[^0-9.]/g, "")))
        .get();

      // Проверяем, что цены отсортированы по убыванию
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).to.be.at.most(prices[i - 1]);
      }
    });
  });
});
