import { test, expect } from "@playwright/test";

const DEMO_USER = "demo";
const DEMO_PASSWORD = "proyectyzr2026";

test.describe("ProyectYZR - Acceso y dashboard", () => {
  test("un visitante sin sesión es enviado a iniciar sesión", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("credenciales incorrectas muestran un error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Usuario").fill(DEMO_USER);
    await page.getByLabel("Contraseña").fill("incorrecta");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.locator('p[role="alert"]')).toContainText("incorrectos");
    await expect(page).toHaveURL(/\/login/);
  });

  test("el login correcto abre la dashboard con gráficas y datos reales", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Usuario").fill(DEMO_USER);
    await page.getByLabel("Contraseña").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /Centro de control/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Proyectos por estado" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Avance de actividades" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Proyección de actividades" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Registro de proyectos" })).toBeVisible();
  });

  test("cerrar sesión devuelve a la pantalla de acceso", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Usuario").fill(DEMO_USER);
    await page.getByLabel("Contraseña").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("crear proyecto se abre en un modal flotante", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Usuario").fill(DEMO_USER);
    await page.getByLabel("Contraseña").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("button", { name: "Nuevo proyecto" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByPlaceholder("Nombre del proyecto")).toBeVisible();
    await expect(dialog.getByPlaceholder("Descripción breve")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Guardar proyecto" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("el menú Proyectos abre un directorio propio con iconos", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Usuario").fill(DEMO_USER);
    await page.getByLabel("Contraseña").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("link", { name: "Proyectos" }).click();
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.getByRole("heading", { level: 1, name: "Proyectos" })).toBeVisible();
    await expect(page.getByRole("main").getByText("Directorio", { exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Filtros de proyectos" })).toBeVisible();
    await expect(page.locator("nav[aria-label='Navegación principal'] svg")).toHaveCount(3);
    await expect(page.getByText("Centro de control")).toHaveCount(0);
  });

  test("los campos del formulario tienen fondo oscuro y texto visible", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Usuario").fill(DEMO_USER);
    await page.getByLabel("Contraseña").fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.getByRole("button", { name: "Nuevo proyecto" }).click();
    const nameInput = page.getByRole("dialog").getByPlaceholder("Nombre del proyecto");
    await expect(nameInput).toHaveCSS("background-color", "rgb(10, 16, 31)");
    await expect(nameInput).toHaveCSS("color", "rgb(248, 250, 252)");
    await expect(page.getByRole("dialog").locator("select option").first()).toHaveCSS(
      "background-color",
      "rgb(35, 40, 52)"
    );
  });
});
