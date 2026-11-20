
import { test, expect, Page } from '@playwright/test';

// SauceDemo хэрэглэгчийн мэдээлэл
const BASE_URL = 'https://www.saucedemo.com/';
const USERNAME = 'standard_user';
const PASSWORD = 'secret_sauce';

// Нэвтрэх үйлдлийг дахин ашиглах туслах функц
async function login(page: Page) {
  await page.goto(BASE_URL);

  await page.getByPlaceholder('Username').fill(USERNAME);
  await page.getByPlaceholder('Password').fill(PASSWORD);

  await page.getByRole('button', { name: 'Login' }).click();

  // Нэвтэрсний дараа Products гарчиг харагдахыг хүлээнэ
  await expect(
    page.getByText('Products', { exact: true })
  ).toBeVisible();
}

// Системээс гарах туслах функц

async function logout(page: Page) {
  // Burger menu нээх
  await page.getByRole('button', { name: 'Open Menu' }).click();

  // Logout button харагдахыг шалгах
  const logoutButton = page.getByRole('button', {
    name: 'Logout'
  });

  await expect(logoutButton).toBeVisible();

  // Logout хийх
  await logoutButton.click();

  // Login хуудас руу буцсаныг шалгах
  await expect(page).toHaveURL(BASE_URL);

  await expect(
    page.getByPlaceholder('Username')
  ).toBeVisible();
}

// ==========================================
// TEST 1: Амжилттай нэвтрэх
// ==========================================

test('Амжилттай нэвтрэх', async ({ page }) => {
  // Зөв хэрэглэгчээр нэвтрэх
  await login(page);

  // Inventory хуудас руу орсныг шалгах
  await expect(page).toHaveURL(/inventory\.html/);

  // Products гарчиг харагдаж байгаа эсэх
  await expect(
    page.getByText('Products', { exact: true })
  ).toBeVisible();

  // Системээс гарах
  await logout(page);
});

// ==========================================
// TEST 2: Буруу нууц үгээр нэвтрэх
// ==========================================

test('Буруу нууц үгээр нэвтрэхэд алдаа харуулах', async ({ page }) => {
  // Login хуудас нээх
  await page.goto(BASE_URL);

  // Хэрэглэгчийн нэр оруулах
  await page.getByPlaceholder('Username').fill(USERNAME);

  // Буруу нууц үг оруулах
  await page.getByPlaceholder('Password').fill('wrong_password');

  // Login товч дарах
  await page.getByRole('button', { name: 'Login' }).click();

  // Алдааны мессеж харагдаж байгаа эсэх
  await expect(
    page.locator('[data-test="error"]')
  ).toBeVisible();

  // Алдааны текстийг шалгах
  await expect(
    page.locator('[data-test="error"]')
  ).toContainText('Username and password do not match');

  // Login хуудас хэвээр байгаа эсэх
  await expect(page).toHaveURL(BASE_URL);
});

// ==========================================
// TEST 3: Бараа сагсанд нэмэх
// ==========================================

test('Бараа сагсанд нэмэх', async ({ page }) => {
  // Системд нэвтрэх
  await login(page);

  // Sauce Labs Backpack барааг олох
  const backpack = page.locator(
    '[data-test="add-to-cart-sauce-labs-backpack"]'
  );

  // Бараа нэмэх товч харагдаж байгаа эсэх
  await expect(backpack).toBeVisible();

  // Сагсанд нэмэх
  await backpack.click();

  // Remove товч гарч ирснийг шалгах
  await expect(
    page.locator('[data-test="remove-sauce-labs-backpack"]')
  ).toBeVisible();

  // Сагсны тоо 1 болсон эсэхийг шалгах
  await expect(
    page.locator('.shopping_cart_badge')
  ).toHaveText('1');

  // Сагсны icon дээр дарах
  await page.locator('.shopping_cart_link').click();

  // Cart хуудас нээгдсэнийг шалгах
  await expect(page).toHaveURL(/cart\.html/);

  // Сагсанд зөв бараа байгаа эсэхийг шалгах
  await expect(
    page.getByText('Sauce Labs Backpack', { exact: true })
  ).toBeVisible();

  // Системээс гарах
  await logout(page);
});
