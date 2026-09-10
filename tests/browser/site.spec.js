import { test, expect } from '@playwright/test';

async function fillApplicant(page) {
  await page.getByLabel('نام و نام خانوادگی *').fill('کاربر آزمایشی');
  await page.getByLabel('شماره موبایل *').fill('۰۹۱۲۳۴۵۶۷۸۹');
  await page.locator('input[name="consent"]').check();
}

test('public pages load with working images and fit the viewport', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/services', '/services/physical', '/courses', '/courses/police-assistant', '/store', '/store/alarm', '/articles', '/articles/security-plan', '/news', '/about', '/director', '/activities', '/resume', '/privacy', '/terms', '/licenses', '/gallery', '/regulations', '/contact', '/consultation', '/careers', '/faq', '/track', '/verify', '/admin']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(async () => {
      for (const img of document.images) { img.loading = 'eager'; await img.decode().catch(() => {}); }
      await document.fonts.ready;
    });
    expect(await page.locator('img').evaluateAll(images => images.filter(img => !img.naturalWidth).map(img => img.src)), path).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
    if (path === '/') await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('cart checkout keeps its tracking code and tracking returns the order', async ({ page }) => {
  await page.goto('/store');
  await page.getByRole('button', { name: 'افزودن آژیر هشدار شخصی به سبد' }).click();
  await page.getByRole('link', { name: 'سبد خرید', exact: true }).click();
  await page.getByRole('button', { name: 'افزایش تعداد' }).click();
  await page.getByRole('button', { name: 'ادامه و ثبت سفارش' }).click();
  await fillApplicant(page);
  await page.getByLabel('نشانی تحویل *').fill('نشانی آزمایشی برای تحویل سفارش');
  await page.getByRole('button', { name: 'ثبت درخواست سفارش', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'درخواست شما ثبت شد' })).toBeVisible();
  const code = await page.locator('.success-panel code').innerText();
  await page.locator('.success-panel').getByRole('link', { name: 'پیگیری درخواست' }).click();
  await page.getByLabel('کد پیگیری').fill(code);
  await page.getByLabel('شماره موبایل').fill('۰۹۱۲۳۴۵۶۷۸۹');
  await page.getByRole('button', { name: 'بررسی و نمایش نتیجه' }).click();
  await expect(page.getByText('وضعیت: جدید')).toBeVisible();
});

test('course and career forms submit from the page', async ({ page }) => {
  for (const [path, button] of [['/courses/police-assistant', 'ثبت پیش‌ثبت‌نام'], ['/careers', 'ارسال درخواست']]) {
    await page.goto(path);
    await fillApplicant(page);
    await page.getByRole('button', { name: button, exact: true }).click();
    await expect(page.getByRole('heading', { name: 'درخواست شما ثبت شد' })).toBeVisible();
  }
});

test('admin can publish a page, issue a certificate and verify it publicly', async ({ page }, testInfo) => {
  await page.goto('/admin');
  await page.getByLabel('نام کاربری').fill('admin');
  await page.getByLabel('رمز عبور', { exact: true }).fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'ورود به پنل مدیریت' }).click();
  await expect(page.getByRole('heading', { name: 'پیشخوان', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'صفحات سایت', exact: true }).click();
  await page.getByRole('button', { name: 'افزودن مورد جدید' }).click();
  const title = 'صفحه آزمایشی ' + testInfo.project.name;
  await page.getByLabel('عنوان *', { exact: true }).fill(title);
  await page.getByLabel('شناسه انگلیسی (در نشانی صفحه) *').fill('browser-' + testInfo.project.name);
  await page.getByLabel('متن محتوا').fill('محتوای آزمایشی برای بررسی انتشار');
  await page.getByLabel('انتشار در وب‌سایت').check();
  await page.getByRole('button', { name: 'ذخیره محتوا' }).click();
  await expect(page.getByText('تغییرات ذخیره شد.')).toBeVisible();
  await page.goto('/pages/browser-' + testInfo.project.name);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  await page.goto('/admin');
  await page.getByRole('button', { name: 'گواهینامه‌ها', exact: true }).click();
  await page.getByLabel('نام و نام خانوادگی', { exact: true }).fill('کاربر آزمایشی');
  await page.getByLabel('عنوان دوره و درجه گواهی').fill('دوره آزمایشی');
  await page.getByLabel('تاریخ صدور').fill('2026-09-11');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'صدور گواهی', exact: true }).click();
  await expect(page.getByText(/گواهی ثبت شد:/)).toBeVisible();
  const code = (await page.getByText(/گواهی ثبت شد:/).innerText()).match(/MVC-[A-F0-9]+/)[0];
  await page.getByRole('button', { name: 'خروج از حساب' }).click();
  await expect(page.getByRole('heading', { name: 'ورود به مدیریت موثق' })).toBeVisible();
  await page.goto('/verify');
  await page.getByLabel('کد گواهی').fill(code);
  await page.getByLabel('نام و نام خانوادگی').fill('کاربر آزمایشی');
  await page.getByRole('button', { name: 'بررسی و نمایش نتیجه' }).click();
  await expect(page.getByText('گواهی معتبر در سامانه موثق')).toBeVisible();
});
