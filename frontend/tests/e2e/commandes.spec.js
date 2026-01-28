import { test, expect } from '@playwright/test';

/**
 * Tests E2E Commandes
 * Parcours utilisateur: Voir historique, voir détails, télécharger facture
 */
test.describe('Parcours Commandes', () => {
  test.beforeEach(async ({ page }) => {
    // Aller directement à la page des commandes
    await page.goto('http://localhost:5173/#/orders');

    // Attendre le chargement
    await page.waitForLoadState('networkidle');
  });

  test('devrait afficher la page des commandes', async ({ page }) => {
    // Vérifier le titre
    const title = page.locator('h2');
    await expect(title).toContainText('Mes Commandes');
  });

  test('devrait afficher les commandes', async ({ page }) => {
    // Attendre le chargement des commandes
    await page.waitForSelector('.order-card, .empty-state', { timeout: 5000 });

    // S'il y a des commandes
    const orderCards = page.locator('.order-card');
    const count = await orderCards.count();

    if (count > 0) {
      // Vérifier les éléments de la commande
      const firstOrder = orderCards.first();
      await expect(firstOrder.locator('h3')).toBeVisible();
      await expect(firstOrder.locator('.order-total')).toBeVisible();
    }
  });

  test('devrait afficher les détails d\'une commande au clic sur 👁️', async ({ page }) => {
    await page.waitForSelector('.order-card, .empty-state', { timeout: 5000 });

    const orderCards = page.locator('.order-card');
    const count = await orderCards.count();

    if (count > 0) {
      // Cliquer sur le bouton 👁️ (voir)
      const viewButton = page.locator('.btn-view').first();
      await viewButton.click();

      // Attendre le modal
      await page.waitForSelector('.modal-overlay');

      // Vérifier que le modal s'affiche
      const modal = page.locator('.modal-overlay');
      await expect(modal).toBeVisible();

      // Vérifier le contenu
      await expect(modal.locator('h2')).toContainText('Détails de la Commande');
    }
  });

  test('devrait afficher les informations du client dans le modal', async ({ page }) => {
    await page.waitForSelector('.order-card', { timeout: 5000 });

    const orderCards = page.locator('.order-card');
    const count = await orderCards.count();

    if (count > 0) {
      const viewButton = page.locator('.btn-view').first();
      await viewButton.click();

      await page.waitForSelector('.modal-overlay');

      // Vérifier les infos client
      const modal = page.locator('.modal-overlay');
      await expect(modal.locator('text=Informations Client')).toBeVisible();
      await expect(modal.locator('text=Nom')).toBeVisible();
      await expect(modal.locator('text=Email')).toBeVisible();
    }
  });

  test('devrait afficher les articles dans le modal', async ({ page }) => {
    await page.waitForSelector('.order-card', { timeout: 5000 });

    const orderCards = page.locator('.order-card');
    const count = await orderCards.count();

    if (count > 0) {
      const viewButton = page.locator('.btn-view').first();
      await viewButton.click();

      await page.waitForSelector('.modal-overlay');

      // Vérifier les articles
      const modal = page.locator('.modal-overlay');
      await expect(modal.locator('text=Articles Commandés')).toBeVisible();

      const tableRows = modal.locator('.table-row');
      expect(await tableRows.count()).toBeGreaterThan(0);
    }
  });

  test('devrait fermer le modal au clic sur Fermer', async ({ page }) => {
    await page.waitForSelector('.order-card', { timeout: 5000 });

    const orderCards = page.locator('.order-card');
    const count = await orderCards.count();

    if (count > 0) {
      const viewButton = page.locator('.btn-view').first();
      await viewButton.click();

      await page.waitForSelector('.modal-overlay');

      // Cliquer sur Fermer
      await page.click('button:has-text("Fermer")');

      // Vérifier que le modal s'est fermé
      const modal = page.locator('.modal-overlay');
      await expect(modal).not.toBeVisible();
    }
  });

  test('devrait fermer le modal au clic sur X', async ({ page }) => {
    await page.waitForSelector('.order-card', { timeout: 5000 });

    const orderCards = page.locator('.order-card');
    const count = await orderCards.count();

    if (count > 0) {
      const viewButton = page.locator('.btn-view').first();
      await viewButton.click();

      await page.waitForSelector('.modal-overlay');

      // Cliquer sur le X
      await page.click('.close-btn');

      // Vérifier que le modal s'est fermé
      const modal = page.locator('.modal-overlay');
      await expect(modal).not.toBeVisible();
    }
  });

  test('devrait télécharger la facture au clic sur 📄', async ({ page }) => {
    await page.waitForSelector('.order-card', { timeout: 5000 });

    const orderCards = page.locator('.order-card');
    const count = await orderCards.count();

    if (count > 0) {
      // Écouter le téléchargement
      const downloadPromise = page.waitForEvent('download');

      // Cliquer sur le bouton 📄
      const downloadButton = page.locator('.btn-download').first();
      await downloadButton.click();

      // Attendre le téléchargement
      const download = await downloadPromise;

      // Vérifier le nom du fichier
      expect(download.suggestedFilename()).toContain('facture');
      expect(download.suggestedFilename()).toContain('html');
    }
  });

  test('devrait montrer le message "Aucune commande" si vide', async ({ page }) => {
    // Ce test dépend de l'état initial de la BD
    // Mais on peut vérifier que le message existe ou pas

    const emptyMessage = page.locator('.empty-state');
    const orderCards = page.locator('.order-card');

    const hasCards = await orderCards.count() > 0;
    const isEmpty = await emptyMessage.count() > 0;

    // Au moins l'un des deux doit être vrai
    expect(hasCards || isEmpty).toBe(true);
  });
});
