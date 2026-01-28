import { test, expect } from '@playwright/test';

/**
 * Tests E2E Événements
 * Parcours utilisateur: Créer, modifier, clôturer événement
 */
test.describe('Parcours Événements', () => {
  test.beforeEach(async ({ page }) => {
    // Aller à la page des événements
    await page.goto('http://localhost:5173/#/events');
    await page.waitForLoadState('networkidle');
  });

  test('devrait afficher la page des événements', async ({ page }) => {
    const title = page.locator('h2');
    await expect(title).toContainText('Événements');
  });

  test('devrait afficher le bouton créer un événement', async ({ page }) => {
    const createButton = page.locator('button:has-text("Créer un événement")');
    await expect(createButton).toBeVisible();
  });

  test('devrait ouvrir le formulaire au clic sur créer', async ({ page }) => {
    const createButton = page.locator('button:has-text("Créer un événement")');
    await createButton.click();

    // Attendre le modal
    await page.waitForSelector('.form-modal');

    const modal = page.locator('.form-modal');
    await expect(modal).toBeVisible();

    // Vérifier les champs
    await expect(modal.locator('label:has-text("Nom")')).toBeVisible();
    await expect(modal.locator('label:has-text("Date")')).toBeVisible();
  });

  test('devrait créer un événement', async ({ page }) => {
    // Ouvrir le formulaire
    await page.click('button:has-text("Créer un événement")');
    await page.waitForSelector('.form-modal');

    // Remplir le formulaire
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dateString = futureDate.toISOString().slice(0, 16);

    await page.fill('input[id="name"]', 'Test Event');
    await page.fill('input[id="date"]', dateString);
    await page.fill('input[id="location"]', 'Test Location');
    await page.fill('textarea[id="description"]', 'Test description');
    await page.fill('input[id="capacity"]', '50');

    // Cliquer sur Créer
    await page.click('button:has-text("Créer")');

    // Attendre la notification
    await page.waitForSelector('.notification.success');

    // Vérifier le message
    const notification = page.locator('.notification.success');
    await expect(notification).toContainText('créé');
  });

  test('devrait afficher la liste des événements', async ({ page }) => {
    // Attendre le chargement
    await page.waitForSelector('.event-card, .empty-state');

    const eventCards = page.locator('.event-card');
    const count = await eventCards.count();

    // Soit il y a des événements, soit le message vide
    if (count > 0) {
      const firstEvent = eventCards.first();
      await expect(firstEvent.locator('.event-title')).toBeVisible();
    }
  });

  test('devrait filtrer par statut', async ({ page }) => {
    // Cliquer sur le filtre "À venir"
    await page.click('button:has-text("À venir")');

    // Attendre le rechargement
    await page.waitForSelector('.event-card, .empty-state');

    // Vérifier que le bouton est actif
    const filterBtn = page.locator('button:has-text("À venir")');
    await expect(filterBtn).toHaveClass(/active/);
  });

  test('devrait afficher les détails d\'un événement', async ({ page }) => {
    await page.waitForSelector('.event-card');

    const eventCards = page.locator('.event-card');
    const count = await eventCards.count();

    if (count > 0) {
      const firstEvent = eventCards.first();

      // Vérifier les éléments visibles
      await expect(firstEvent.locator('.event-title')).toBeVisible();
      await expect(firstEvent.locator('.event-meta')).toBeVisible();
      await expect(firstEvent.locator('.event-description')).toBeVisible();
    }
  });

  test('devrait modifier un événement', async ({ page }) => {
    await page.waitForSelector('.event-card');

    const eventCards = page.locator('.event-card');
    const count = await eventCards.count();

    if (count > 0) {
      // Cliquer sur le bouton Modifier
      const editButton = page.locator('.btn-edit').first();
      await editButton.click();

      // Attendre le modal
      await page.waitForSelector('.form-modal');

      // Le formulaire doit être pré-rempli
      const modal = page.locator('.form-modal');
      await expect(modal).toBeVisible();
    }
  });

  test('devrait clôturer un événement', async ({ page }) => {
    await page.waitForSelector('.event-card');

    const eventCards = page.locator('.event-card');
    const count = await eventCards.count();

    if (count > 0) {
      // Cliquer sur le bouton Clôturer
      const closeButton = page.locator('.btn-close').first();

      if (await closeButton.isVisible()) {
        await closeButton.click();

        // Confirmer dans la boîte de dialogue
        page.once('dialog', dialog => {
          expect(dialog.message()).toContain('Êtes-vous sûr');
          dialog.accept();
        });

        // Attendre la notification
        await page.waitForSelector('.notification.success');

        const notification = page.locator('.notification.success');
        await expect(notification).toContainText('clôturé');
      }
    }
  });

  test('devrait supprimer un événement', async ({ page }) => {
    // Créer d'abord un événement
    await page.click('button:has-text("Créer un événement")');
    await page.waitForSelector('.form-modal');

    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dateString = futureDate.toISOString().slice(0, 16);

    await page.fill('input[id="name"]', 'Event to Delete');
    await page.fill('input[id="date"]', dateString);
    await page.fill('input[id="capacity"]', '30');

    await page.click('button:has-text("Créer")');
    await page.waitForSelector('.notification.success');

    // Maintenant supprimer
    const deleteButton = page.locator('.btn-delete').first();

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('sûr');
      dialog.accept();
    });

    await deleteButton.click();

    // Attendre la notification
    await page.waitForSelector('.notification.success');
  });

  test('devrait afficher les badges de statut', async ({ page }) => {
    await page.waitForSelector('.event-card');

    const eventCards = page.locator('.event-card');
    const count = await eventCards.count();

    if (count > 0) {
      const badge = page.locator('.event-badge').first();
      await expect(badge).toBeVisible();
    }
  });
});
