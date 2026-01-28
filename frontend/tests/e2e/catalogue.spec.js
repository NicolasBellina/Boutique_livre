import { test, expect } from '@playwright/test';

/**
 * Tests E2E Catalogue
 * Parcours utilisateur: Voir les livres, rechercher, filtrer
 */
test.describe('Parcours Catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('devrait afficher les livres du catalogue', async ({ page }) => {
    // Attendre le chargement des livres
    await page.waitForSelector('.book-card');

    // Vérifier qu'il y a des livres
    const books = await page.locator('.book-card');
    const count = await books.count();
    expect(count).toBeGreaterThan(0);
  });

  test('devrait afficher les informations d\'un livre', async ({ page }) => {
    await page.waitForSelector('.book-card');

    const firstBook = page.locator('.book-card').first();

    // Vérifier les éléments visibles
    const title = firstBook.locator('.book-title');
    const author = firstBook.locator('.book-author');
    const price = firstBook.locator('.book-price');

    expect(await title.isVisible()).toBe(true);
    expect(await author.isVisible()).toBe(true);
    expect(await price.isVisible()).toBe(true);
  });

  test('devrait rechercher un livre par titre', async ({ page }) => {
    await page.waitForSelector('input[placeholder*="titre"]');

    // Entrer le titre de recherche
    await page.fill('input[placeholder*="titre"]', 'Harry');

    // Cliquer sur Rechercher
    await page.click('button:has-text("Rechercher")');

    // Attendre les résultats
    await page.waitForSelector('.book-card');

    // Vérifier qu'il y a des résultats
    const books = await page.locator('.book-card');
    expect(await books.count()).toBeGreaterThan(0);
  });

  test('devrait filtrer par "En stock uniquement"', async ({ page }) => {
    await page.waitForSelector('input[type="checkbox"]');

    // Cocher le filtre
    await page.check('input[type="checkbox"]');

    // Cliquer sur Rechercher
    await page.click('button:has-text("Rechercher")');

    // Attendre les résultats
    await page.waitForSelector('.book-card');

    // Vérifier que tous les livres ont du stock
    const stockElements = await page.locator('.book-stock');
    for (let i = 0; i < await stockElements.count(); i++) {
      const stock = await stockElements.nth(i).textContent();
      const quantity = parseInt(stock.match(/\d+/)[0]);
      expect(quantity).toBeGreaterThan(0);
    }
  });

  test('devrait afficher pagination', async ({ page }) => {
    await page.waitForSelector('.pagination');

    const pagination = page.locator('.pagination');
    expect(await pagination.isVisible()).toBe(true);
  });

  test('devrait naviguer en pagination', async ({ page }) => {
    await page.waitForSelector('.pagination');

    // Trouver le bouton Suivant
    const nextButton = page.locator('button:has-text("Suivant")');

    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Attendre le chargement
      await page.waitForSelector('.book-card');

      // Vérifier qu'on a les livres
      const books = await page.locator('.book-card');
      expect(await books.count()).toBeGreaterThan(0);
    }
  });

  test('devrait réinitialiser la recherche', async ({ page }) => {
    await page.fill('input[placeholder*="titre"]', 'Harry');
    await page.click('button:has-text("Rechercher")');
    await page.waitForSelector('.book-card');

    // Cliquer sur Réinitialiser
    await page.click('button:has-text("Réinitialiser")');

    // Attendre les résultats
    await page.waitForSelector('.book-card');

    // Le formulaire doit être vide
    const titleInput = page.locator('input[placeholder*="titre"]');
    expect(await titleInput.inputValue()).toBe('');
  });
});
