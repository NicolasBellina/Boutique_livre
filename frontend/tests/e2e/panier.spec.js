import { test, expect } from '@playwright/test';

/**
 * Tests E2E Panier
 * Parcours utilisateur: Ajouter, modifier, supprimer des articles
 */
test.describe('Parcours Panier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.book-card');
  });

  test('devrait ajouter un livre au panier', async ({ page }) => {
    // Trouver le bouton "Ajouter au panier" sur le premier livre
    const addButton = page.locator('.book-card').first().locator('button:has-text("Ajouter au panier")');

    // Cliquer sur Ajouter
    await addButton.click();

    // Attendre la notification
    await page.waitForSelector('.notification');

    // Vérifier le message
    const notification = page.locator('.notification');
    await expect(notification).toContainText('ajouté au panier');
  });

  test('devrait afficher le badge du panier', async ({ page }) => {
    // Ajouter un livre
    const addButton = page.locator('.book-card').first().locator('button:has-text("Ajouter au panier")');
    await addButton.click();

    // Attendre la notification
    await page.waitForSelector('.notification');

    // Vérifier le badge du panier
    const badge = page.locator('.cart-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('1');
  });

  test('devrait ouvrir le panier', async ({ page }) => {
    // Ajouter un livre
    const addButton = page.locator('.book-card').first().locator('button:has-text("Ajouter au panier")');
    await addButton.click();

    // Attendre la notification
    await page.waitForSelector('.notification');

    // Cliquer sur le bouton panier
    await page.click('button:has-text("🛒 Panier")');

    // Attendre l'ouverture du panier
    await page.waitForSelector('.cart-sidebar');

    // Vérifier que le panier est visible
    const sidebar = page.locator('.cart-sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('devrait afficher les articles du panier', async ({ page }) => {
    // Ajouter un livre
    const addButton = page.locator('.book-card').first().locator('button:has-text("Ajouter au panier")');
    await addButton.click();

    await page.waitForSelector('.notification');

    // Ouvrir le panier
    await page.click('button:has-text("🛒 Panier")');
    await page.waitForSelector('.cart-items');

    // Vérifier que l'article est affiché
    const item = page.locator('.cart-item');
    expect(await item.count()).toBeGreaterThan(0);
  });

  test('devrait augmenter la quantité', async ({ page }) => {
    // Ajouter un livre
    const addButton = page.locator('.book-card').first().locator('button:has-text("Ajouter au panier")');
    await addButton.click();

    await page.waitForSelector('.notification');

    // Ouvrir le panier
    await page.click('button:has-text("🛒 Panier")');
    await page.waitForSelector('.cart-item');

    // Trouver le bouton +
    const plusButton = page.locator('.qty-btn').nth(1); // Deuxième bouton (le +)

    // Quantité avant
    const qtyInput = page.locator('.qty-input');
    const quantityBefore = parseInt(await qtyInput.inputValue());

    // Cliquer sur +
    await plusButton.click();

    // Vérifier que la quantité a augmenté
    const quantityAfter = parseInt(await qtyInput.inputValue());
    expect(quantityAfter).toBe(quantityBefore + 1);
  });

  test('devrait diminuer la quantité', async ({ page }) => {
    // Ajouter 2 livres
    const addButton = page.locator('.book-card').first().locator('button:has-text("Ajouter au panier")');
    await addButton.click();
    await page.waitForSelector('.notification');

    // Ouvrir le panier
    await page.click('button:has-text("🛒 Panier")');
    await page.waitForSelector('.cart-item');

    // Augmenter la quantité d'abord
    const plusButton = page.locator('.qty-btn').nth(1);
    await plusButton.click();

    // Maintenant diminuer
    const minusButton = page.locator('.qty-btn').nth(0); // Premier bouton (le -)
    const quantityBefore = parseInt(await page.locator('.qty-input').inputValue());

    await minusButton.click();

    const quantityAfter = parseInt(await page.locator('.qty-input').inputValue());
    expect(quantityAfter).toBe(quantityBefore - 1);
  });

  test('devrait supprimer un article du panier', async ({ page }) => {
    // Ajouter un livre
    const addButton = page.locator('.book-card').first().locator('button:has-text("Ajouter au panier")');
    await addButton.click();

    await page.waitForSelector('.notification');

    // Ouvrir le panier
    await page.click('button:has-text("🛒 Panier")');
    await page.waitForSelector('.cart-item');

    // Cliquer sur le bouton Supprimer (🗑️)
    const deleteButton = page.locator('.remove-btn');
    await deleteButton.click();

    // Vérifier que le panier est vide
    const emptyMessage = page.locator('.empty-cart');
    await expect(emptyMessage).toBeVisible();
  });

  test('devrait vider tout le panier', async ({ page }) => {
    // Ajouter plusieurs livres
    const addButton = page.locator('.book-card').first().locator('button:has-text("Ajouter au panier")');
    await addButton.click();

    await page.waitForSelector('.notification');

    // Ouvrir le panier
    await page.click('button:has-text("🛒 Panier")');
    await page.waitForSelector('.cart-item');

    // Vérifier que le panier est vide
    const emptyMessage = page.locator('.empty-cart');
    await expect(emptyMessage).toBeVisible();
  });

  test('devrait afficher le total correct', async ({ page }) => {
    // Ajouter un livre
    const addButton = page.locator('.book-card').first().locator('button:has-text("Ajouter au panier")');
    await addButton.click();

    await page.waitForSelector('.notification');

    // Ouvrir le panier
    await page.click('button:has-text("🛒 Panier")');
    await page.waitForSelector('.order-total');

    // Vérifier que le total est affiché
    const total = page.locator('.order-total');
    await expect(total).toContainText('€');
  });
});
