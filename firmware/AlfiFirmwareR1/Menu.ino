void lcdMenuCallback() {
  // "             "
  // static auto menuUtama = menu.createMenu(3, "Bayar", "Daftar Akun", "Check RFID");
  static auto menuUtama = menu.createMenu(2, "Bayar", "Daftar Akun");

  menu.onSelect(
    menuUtama, "Bayar", []() {
      uuidRFID = "";
      paymentRFIDState = 0;
      isPaymentRFIDValid = 0;
      menu.setState(menuUtama, "Bayar", 0);
    },
    [](int state) {
      if (state == 0) {
        auto menuBayar = menu.createMenu(2, " Silakan Tap ", "  RFID Anda  ");
        menu.showMenu(menuBayar, true);
        menu.freeMenu(menuBayar);
        if (!uuidRFID.isEmpty()) {
          menu.setState(menuUtama, "Bayar", 1);
          paymentRFIDState = 1;
          isPaymentRFIDValid = 0;
        }
      } else if (state == 1) {
        //
      } else if (state == 2) {
        //
      }
    });

  menu.onSelect(
    menuUtama, "Daftar Akun", []() {
      uuidRFID = "";
      checkRFIDMasterState = 0;
      isRFIDMasterValid = 0;
      registerRFIDState = 0;
      isRegisterRFIDValid = 0;
      menu.setState(menuUtama, "Daftar Akun", 0);
    },
    [](int state) {
      static uint32_t registerSuccessTimer;
      if (millis() - registerSuccessTimer >= 2000 && (state == 3 || state == 4)) {
        registerSuccessTimer = millis();
        if (state == 3) menu.setState(menuUtama, "Daftar Akun", 4);
        if (state == 4) menu.setState(menuUtama, "Daftar Akun", 3);
      }

      if (!buttonOkStr.isEmpty()) {
        uuidRFID = "";
        menu.setState(menuUtama, "Daftar Akun", 0);
        menu.clearMenu(menuUtama, menu.end());
      }

      if (state == 0) {
        auto menuDaftar = menu.createMenu(2, " Silakan Tap ", " Master RFID ");
        menu.showMenu(menuDaftar, true);
        menu.freeMenu(menuDaftar);
        if (!uuidRFID.isEmpty()) {
          menu.setState(menuUtama, "Daftar Akun", 1);
          checkRFIDMasterState = 1;
          isRFIDMasterValid = 0;
        }
      } else if (state == 1) {
        auto menuDaftar = menu.createMenu(2, " Pengecekan  ", "    RFID     ");
        menu.showMenu(menuDaftar, true);
        menu.wait(2000);
        menu.freeMenu(menuDaftar);
        while (checkRFIDMasterState) {
          ledRed.toggleDelay(100);
        }
        ledRed.on();
        if (isRFIDMasterValid) {
          auto menuDaftar1 = menu.createMenu(2, " RFID Master ", "  Terdaftar  ");
          menu.showMenu(menuDaftar1, true);
          menu.wait(2000);
          menu.freeMenu(menuDaftar1);
          menu.setState(menuUtama, "Daftar Akun", 2);
          uuidRFID = "";
        } else {
          auto menuDaftar2 = menu.createMenu(2, " RFID Master ", "Tdk Terdaftar");
          menu.showMenu(menuDaftar2, true);
          menu.wait(2000);
          menu.freeMenu(menuDaftar2);
          menu.clearMenu(menuUtama, menu.end());
        }
      } else if (state == 2) {
        auto menuDaftar = menu.createMenu(2, " Silakan Tap ", "  RFID Anda  ");
        menu.showMenu(menuDaftar, true);
        menu.freeMenu(menuDaftar);
        if (!uuidRFID.isEmpty()) {
          registerRFIDState = 1;
          while (registerRFIDState) {
            auto menuDaftar1 = menu.createMenu(2, "   Memuat    ", "Mohon Tunggu ");
            menu.showMenu(menuDaftar1, true);
            menu.freeMenu(menuDaftar1);
            ledRed.toggleDelay(100);
          }
          if (isRegisterRFIDValid) {
            auto menuDaftar2 = menu.createMenu(2, "  Register   ", "  Berhasil   ");
            menu.showMenu(menuDaftar2, true);
            menu.wait(2000);
            menu.freeMenu(menuDaftar2);
            auto menuDaftar3 = menu.createMenu(2, "  Register   ", "  Berhasil   ");
            menu.showMenu(menuDaftar3, true);
            menu.wait(2000);
            menu.freeMenu(menuDaftar3);
            menu.setState(menuUtama, "Daftar Akun", 3);
          } else {
            auto menuDaftar4 = menu.createMenu(2, "  Register   ", "    Gagal    ");
            menu.showMenu(menuDaftar4, true);
            menu.wait(2000);
            menu.freeMenu(menuDaftar4);
            menu.clearMenu(menuUtama, menu.end());
          }
        }
      } else if (state == 3) {
        auto menuDaftar = menu.createMenu(2, "Email   :    ", "user000@gmail");
        menu.formatMenu(menuDaftar, 1, "%s", registerEmail.c_str());
        menu.showMenu(menuDaftar, true);
        menu.freeMenu(menuDaftar);
      } else if (state == 4) {
        auto menuDaftar = menu.createMenu(2, "Password:    ", "   user000   ");
        menu.formatMenu(menuDaftar, 1, "%s", registerPassword.c_str());
        menu.showMenu(menuDaftar, true);
        menu.freeMenu(menuDaftar);
      }
    });
  menu.showMenu(menuUtama);
}