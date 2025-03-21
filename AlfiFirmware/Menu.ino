void lcdMenuCallback() {
  static auto menuMain = menu.createMenu(menu.begin(2), "Testing LCD", "I2C 16 x 2");
  menu.showMenu(menuMain);
}