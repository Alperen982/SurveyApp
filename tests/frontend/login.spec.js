import { test, expect } from '@playwright/test';

test('kayıt ol, giriş yap, profil sayfasına ulaş', async ({ page }) => {
  // 1. REGISTER
  await page.goto('https://my-survey-app.vercel.app/register');

  const randomSuffix = Math.floor(Math.random() * 100000);
  const email = `testuser${randomSuffix}@example.com`;
  const password = '123456qQ@';
  const confirmPassword = '123456qQ@';


  await page.fill('input[placeholder="Geçerli bir mail giriniz."]', email);
 const passwordInputs = await page.$$('input[placeholder="Şifrenizi giriniz."]');
 await passwordInputs[0].fill(password);        // Şifre
 await passwordInputs[1].fill(confirmPassword); // Şifre Tekrar
  await page.click('button[type="submit"]');

  // Register sonrası otomatik yönlendirme varsa kontrol
  await expect(page).toHaveURL(/.*login/);

  // 2. LOGIN
  await page.fill('input[placeholder="Mail adresinizi giriniz."]', email);
  await page.fill('input[placeholder="Şifrenizi giriniz."]', password);
  await page.click('button[type="submit"]');

  // 3. DASHBOARD kontrolü
  await expect(page).toHaveURL(/.*Home/);

  // 4. Opsiyonel: dashboard'da bir elementin görünür olduğunu kontrol et
  await expect(page.locator('h1')).toContainText('Home');
});
