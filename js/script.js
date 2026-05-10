/* =========================================================
   SITTA Praktik - JavaScript DOM
   Fitur utama:
   1. Login dan validasi form.
   2. Modal Lupa Password/Daftar/feedback.
   3. Greeting berdasarkan waktu lokal.
   4. Tracking pengiriman berdasarkan Nomor DO.
   5. Tabel stok dinamis dan tambah/hapus/update stok.
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNavigation();
    setupModalEvents();
    setupLogoutButton();
    setupSharedUserInfo();

    var page = document.body.dataset.page;

    if (page === "login") {
      setupLoginPage();
    }

    if (page === "dashboard") {
      setupDashboardPage();
    }

    if (page === "tracking") {
      setupTrackingPage();
    }

    if (page === "stok") {
      setupStokPage();
    }
  });

  function setupMobileNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("show");
      var isOpen = menu.classList.contains("show");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupModalEvents() {
    document.querySelectorAll("[data-open-modal]").forEach(function (button) {
      button.addEventListener("click", function () {
        openModal(button.dataset.openModal);
      });
    });

    document.querySelectorAll("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", function () {
        closeModal(button.closest(".modal-backdrop"));
      });
    });

    document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
      backdrop.addEventListener("click", function (event) {
        if (event.target === backdrop) {
          closeModal(backdrop);
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.show").forEach(closeModal);
      }
    });
  }

  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) {
      return;
    }
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    var focusable = modal.querySelector("button, input, select, textarea, a");
    if (focusable) {
      focusable.focus();
    }
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  function showFeedback(title, message, type) {
    var modal = document.getElementById("modalFeedback");
    var titleEl = document.getElementById("feedbackTitle");
    var messageEl = document.getElementById("feedbackMessage");

    if (titleEl) {
      titleEl.textContent = title || "Informasi";
    }
    if (messageEl) {
      messageEl.textContent = message || "";
    }

    if (modal) {
      modal.dataset.type = type || "info";
      openModal("modalFeedback");
    } else {
      alert(message || title || "Informasi");
    }
  }

  function showToast(message, type) {
    var toast = document.getElementById("toast");
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.className = "toast show" + (type ? " " + type : "");
    window.setTimeout(function () {
      toast.className = "toast";
    }, 3200);
  }

  function setupLogoutButton() {
    var logout = document.querySelector("[data-logout]");
    if (!logout) {
      return;
    }

    logout.addEventListener("click", function () {
      localStorage.removeItem("sittaUser");
      showToast("Anda berhasil keluar dari mode demo.", "success");
      window.setTimeout(function () {
        window.location.href = "index.html";
      }, 500);
    });
  }

  function getCurrentUser() {
    var saved = localStorage.getItem("sittaUser");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        localStorage.removeItem("sittaUser");
      }
    }

    return {
      nama: "Pengguna Demo",
      email: "demo@ut.ac.id",
      role: "UPBJJ-UT",
      lokasi: "UT-Daerah"
    };
  }

  function setupSharedUserInfo() {
    var user = getCurrentUser();
    document.querySelectorAll("[data-user-name]").forEach(function (el) {
      el.textContent = user.nama;
    });
    document.querySelectorAll("[data-user-role]").forEach(function (el) {
      el.textContent = user.role + " - " + user.lokasi;
    });
  }

  function getGreeting() {
    var hour = new Date().getHours();
    if (hour >= 4 && hour < 11) {
      return "Selamat pagi";
    }
    if (hour >= 11 && hour < 15) {
      return "Selamat siang";
    }
    return "Selamat malam";
  }

  function formatDate(dateText) {
    if (!dateText) {
      return "-";
    }

    var date = new Date(dateText.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) {
      return dateText;
    }

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("id-ID").format(value);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupLoginPage() {
    var loginForm = document.getElementById("loginForm");
    var forgotForm = document.getElementById("forgotForm");
    var registerForm = document.getElementById("registerForm");
    var demoList = document.getElementById("demoList");
    var togglePassword = document.getElementById("togglePassword");
    var passwordInput = document.getElementById("password");

    if (demoList) {
      demoList.innerHTML = dataPengguna
        .slice(0, 2)
        .map(function (user) {
          return "<li><strong>" + user.email + "</strong> / " + user.password + "</li>";
        })
        .join("");
    }

    if (togglePassword && passwordInput) {
      togglePassword.addEventListener("click", function () {
        var isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePassword.textContent = isPassword ? "Sembunyikan" : "Lihat";
      });
    }

    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var email = document.getElementById("email").value.trim().toLowerCase();
        var password = document.getElementById("password").value.trim();

        if (!email || !password) {
          showFeedback("Form belum lengkap", "Email dan password wajib diisi.", "error");
          return;
        }

        var user = dataPengguna.find(function (item) {
          return item.email.toLowerCase() === email && item.password === password;
        });

        if (!user) {
          showFeedback("Login gagal", "email/password yang anda masukkan salah", "error");
          return;
        }

        localStorage.setItem("sittaUser", JSON.stringify({
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
          lokasi: user.lokasi
        }));

        showToast("Login berhasil. Mengarahkan ke dashboard...", "success");
        window.setTimeout(function () {
          window.location.href = "dashboard.html";
        }, 700);
      });
    }

    if (forgotForm) {
      forgotForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var email = document.getElementById("forgotEmail").value.trim().toLowerCase();
        var user = dataPengguna.find(function (item) {
          return item.email.toLowerCase() === email;
        });

        if (!email) {
          showFeedback("Email kosong", "Masukkan email UT terlebih dahulu.", "error");
          return;
        }

        if (!user) {
          showFeedback("Akun tidak ditemukan", "Email tersebut belum terdaftar pada data dummy SITTA.", "error");
          return;
        }

        showFeedback(
          "Reset password simulasi",
          "Akun atas nama " + user.nama + " ditemukan. Pada sistem nyata, tautan reset akan dikirim ke email.",
          "success"
        );
        forgotForm.reset();
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var name = document.getElementById("registerName").value.trim();
        var email = document.getElementById("registerEmail").value.trim().toLowerCase();
        var password = document.getElementById("registerPassword").value.trim();
        var location = document.getElementById("registerLocation").value.trim();

        if (!name || !email || !password || !location) {
          showFeedback("Form belum lengkap", "Semua field pendaftaran harus diisi.", "error");
          return;
        }

        if (!email.endsWith("@ut.ac.id")) {
          showFeedback("Email tidak valid", "Gunakan email berdomain @ut.ac.id.", "error");
          return;
        }

        var exists = dataPengguna.some(function (item) {
          return item.email.toLowerCase() === email;
        });

        if (exists) {
          showFeedback("Email sudah ada", "Gunakan email lain karena email ini sudah terdaftar.", "error");
          return;
        }

        dataPengguna.push({
          id: dataPengguna.length + 1,
          nama: name,
          email: email,
          password: password,
          role: "UPBJJ-UT",
          lokasi: location
        });

        showFeedback(
          "Pendaftaran berhasil",
          "Akun " + name + " berhasil ditambahkan pada data sementara browser. Silakan login dengan email dan password baru.",
          "success"
        );
        registerForm.reset();
      });
    }
  }

  function setupDashboardPage() {
    var greetingEl = document.getElementById("greetingText");
    var clockEl = document.getElementById("clockText");
    var user = getCurrentUser();

    if (greetingEl) {
      greetingEl.textContent = getGreeting() + ", " + user.nama + ".";
    }

    function updateClock() {
      if (!clockEl) {
        return;
      }
      clockEl.textContent = new Date().toLocaleString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }

    updateClock();
    window.setInterval(updateClock, 1000);

    var totalStock = dataBahanAjar.reduce(function (sum, item) {
      return sum + Number(item.stok || 0);
    }, 0);

    var lowStock = dataBahanAjar.filter(function (item) {
      return Number(item.stok) < 250;
    }).length;

    setText("summaryBahan", dataBahanAjar.length);
    setText("summaryStok", formatNumber(totalStock));
    setText("summaryDO", Object.keys(dataTracking).length);
    setText("summaryMinim", lowStock);

    renderMonitoringList();
    renderRekapTable();
    renderHistoryList();
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function renderMonitoringList() {
    var container = document.getElementById("monitoringList");
    if (!container) {
      return;
    }

    var html = Object.keys(dataTracking)
      .map(function (nomorDO) {
        var item = dataTracking[nomorDO];
        return "<article class=\"card menu-card\">" +
          "<span class=\"badge badge-warning\">DO " + escapeHTML(nomorDO) + "</span>" +
          "<h3>" + escapeHTML(item.nama) + "</h3>" +
          "<p>Status: <strong>" + escapeHTML(item.status) + "</strong></p>" +
          "<p>Ekspedisi: " + escapeHTML(item.ekspedisi) + " - Paket " + escapeHTML(item.paket) + "</p>" +
          "<a class=\"btn btn-outline btn-small\" href=\"tracking.html?do=" + encodeURIComponent(nomorDO) + "\">Lihat tracking</a>" +
        "</article>";
      })
      .join("");

    container.innerHTML = html;
  }

  function renderRekapTable() {
    var tbody = document.getElementById("rekapBody");
    if (!tbody) {
      return;
    }

    tbody.innerHTML = dataBahanAjar
      .map(function (item, index) {
        return "<tr>" +
          "<td>" + (index + 1) + "</td>" +
          "<td>" + escapeHTML(item.kodeBarang) + "</td>" +
          "<td>" + escapeHTML(item.namaBarang) + "</td>" +
          "<td>" + escapeHTML(item.jenisBarang) + "</td>" +
          "<td>" + escapeHTML(item.edisi) + "</td>" +
          "<td><strong>" + formatNumber(item.stok) + "</strong></td>" +
        "</tr>";
      })
      .join("");
  }

  function renderHistoryList() {
    var container = document.getElementById("historyList");
    if (!container) {
      return;
    }

    container.innerHTML = Object.keys(dataTracking)
      .map(function (nomorDO) {
        var item = dataTracking[nomorDO];
        return "<article class=\"card menu-card\">" +
          "<span class=\"badge badge-success\">" + escapeHTML(item.total) + "</span>" +
          "<h3>" + escapeHTML(item.nama) + "</h3>" +
          "<p>Nomor DO: " + escapeHTML(nomorDO) + "</p>" +
          "<p>Tanggal kirim: " + escapeHTML(item.tanggalKirim) + "</p>" +
        "</article>";
      })
      .join("");
  }

  function setupTrackingPage() {
    var form = document.getElementById("trackingForm");
    var input = document.getElementById("nomorDO");
    var list = document.getElementById("doOptions");

    if (list) {
      list.innerHTML = Object.keys(dataTracking)
        .map(function (nomorDO) {
          return "<option value=\"" + escapeHTML(nomorDO) + "\"></option>";
        })
        .join("");
    }

    var params = new URLSearchParams(window.location.search);
    var nomorDariUrl = params.get("do");
    if (nomorDariUrl && input) {
      input.value = nomorDariUrl;
      renderTracking(nomorDariUrl);
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        renderTracking(input.value.trim());
      });
    }
  }

  function renderTracking(nomorDO) {
    var result = document.getElementById("trackingResult");
    var empty = document.getElementById("trackingEmpty");

    if (!nomorDO) {
      showFeedback("Nomor DO kosong", "Masukkan Nomor Delivery Order terlebih dahulu.", "error");
      if (result) {
        result.classList.remove("show");
      }
      if (empty) {
        empty.style.display = "block";
      }
      return;
    }

    var data = dataTracking[nomorDO];
    if (!data) {
      showFeedback("Data tidak ditemukan", "Nomor Delivery Order " + nomorDO + " tidak ada pada data dummy.", "error");
      if (result) {
        result.classList.remove("show");
      }
      if (empty) {
        empty.style.display = "block";
      }
      return;
    }

    var progress = getTrackingProgress(data.status, data.perjalanan.length);

    setText("trackingNama", data.nama);
    setText("trackingDO", data.nomorDO);
    setText("trackingStatus", data.status);
    setText("trackingEkspedisi", data.ekspedisi);
    setText("trackingTanggal", data.tanggalKirim);
    setText("trackingPaket", data.paket);
    setText("trackingTotal", data.total);
    setText("trackingProgressText", progress + "%");

    var fill = document.getElementById("trackingProgressFill");
    if (fill) {
      fill.style.width = progress + "%";
    }

    var timeline = document.getElementById("trackingTimeline");
    if (timeline) {
      timeline.innerHTML = data.perjalanan
        .map(function (item) {
          return "<li>" +
            "<time>" + escapeHTML(formatDate(item.waktu)) + "</time>" +
            "<p>" + escapeHTML(item.keterangan) + "</p>" +
          "</li>";
        })
        .join("");
    }

    if (empty) {
      empty.style.display = "none";
    }
    if (result) {
      result.classList.add("show");
    }

    showToast("Data tracking DO " + nomorDO + " berhasil ditampilkan.", "success");
  }

  function getTrackingProgress(status, steps) {
    var normalized = String(status || "").toLowerCase();

    if (normalized.includes("selesai")) {
      return 100;
    }
    if (normalized.includes("dikirim")) {
      return Math.min(100, 70 + steps * 5);
    }
    if (normalized.includes("perjalanan")) {
      return Math.min(85, 45 + steps * 8);
    }
    return 30;
  }

  function setupStokPage() {
    var form = document.getElementById("stockForm");
    var searchInput = document.getElementById("searchStock");
    var tableBody = document.getElementById("stockBody");

    renderStock();

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        renderStock(searchInput.value.trim());
      });
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        addNewStock();
      });

      form.addEventListener("reset", function () {
        window.setTimeout(function () {
          showToast("Form tambah stok dikosongkan.", "success");
        }, 0);
      });
    }

    if (tableBody) {
      tableBody.addEventListener("click", function (event) {
        var button = event.target.closest("button[data-action]");
        if (!button) {
          return;
        }

        var index = Number(button.dataset.index);
        var action = button.dataset.action;
        updateStockByAction(index, action);
      });
    }
  }

  function addNewStock() {
    var kodeLokasi = document.getElementById("kodeLokasi").value.trim().toUpperCase();
    var kodeBarang = document.getElementById("kodeBarang").value.trim().toUpperCase();
    var namaBarang = document.getElementById("namaBarang").value.trim();
    var jenisBarang = document.getElementById("jenisBarang").value.trim();
    var edisi = document.getElementById("edisi").value.trim();
    var stok = Number(document.getElementById("stok").value);
    var cover = document.getElementById("cover").value.trim() || "img/pengantar_komunikasi.jpg";

    if (!kodeLokasi || !kodeBarang || !namaBarang || !jenisBarang || !edisi) {
      showFeedback("Form belum lengkap", "Semua field stok wajib diisi, kecuali URL/path cover.", "error");
      return;
    }

    if (Number.isNaN(stok) || stok < 0) {
      showFeedback("Stok tidak valid", "Stok harus berupa angka dan tidak boleh negatif.", "error");
      return;
    }

    var duplicate = dataBahanAjar.some(function (item) {
      return item.kodeBarang.toLowerCase() === kodeBarang.toLowerCase();
    });

    if (duplicate) {
      showFeedback("Kode barang duplikat", "Kode barang sudah ada di tabel. Gunakan kode lain.", "error");
      return;
    }

    dataBahanAjar.push({
      kodeLokasi: kodeLokasi,
      kodeBarang: kodeBarang,
      namaBarang: namaBarang,
      jenisBarang: jenisBarang,
      edisi: edisi,
      stok: stok,
      cover: cover
    });

    document.getElementById("stockForm").reset();
    renderStock();
    showToast("Baris stok baru berhasil ditambahkan dengan JavaScript DOM.", "success");
  }

  function updateStockByAction(index, action) {
    if (!dataBahanAjar[index]) {
      return;
    }

    if (action === "add") {
      dataBahanAjar[index].stok += 10;
      showToast("Stok " + dataBahanAjar[index].kodeBarang + " ditambah 10.", "success");
    }

    if (action === "subtract") {
      dataBahanAjar[index].stok = Math.max(0, dataBahanAjar[index].stok - 10);
      showToast("Stok " + dataBahanAjar[index].kodeBarang + " dikurangi 10.", "success");
    }

    if (action === "delete") {
      var deleted = dataBahanAjar[index].namaBarang;
      dataBahanAjar.splice(index, 1);
      showToast("Data " + deleted + " dihapus dari tabel sementara.", "success");
    }

    var searchInput = document.getElementById("searchStock");
    renderStock(searchInput ? searchInput.value.trim() : "");
  }

  function renderStock(keyword) {
    var filter = String(keyword || "").toLowerCase();
    var tableBody = document.getElementById("stockBody");
    var cardContainer = document.getElementById("stockCards");

    var filtered = dataBahanAjar
      .map(function (item, index) {
        return { item: item, index: index };
      })
      .filter(function (row) {
        var text = [
          row.item.kodeLokasi,
          row.item.kodeBarang,
          row.item.namaBarang,
          row.item.jenisBarang,
          row.item.edisi,
          row.item.stok
        ].join(" ").toLowerCase();
        return text.includes(filter);
      });

    if (tableBody) {
      tableBody.innerHTML = filtered
        .map(function (row, order) {
          var item = row.item;
          return "<tr>" +
            "<td>" + (order + 1) + "</td>" +
            "<td><img class=\"table-cover\" src=\"" + escapeHTML(item.cover) + "\" alt=\"Cover " + escapeHTML(item.namaBarang) + "\"></td>" +
            "<td>" + escapeHTML(item.kodeLokasi) + "</td>" +
            "<td><strong>" + escapeHTML(item.kodeBarang) + "</strong></td>" +
            "<td>" + escapeHTML(item.namaBarang) + "</td>" +
            "<td>" + escapeHTML(item.jenisBarang) + "</td>" +
            "<td>" + escapeHTML(item.edisi) + "</td>" +
            "<td><strong>" + formatNumber(item.stok) + "</strong></td>" +
            "<td>" + renderStockStatus(item.stok) + "</td>" +
            "<td><div class=\"table-actions\">" +
              "<button class=\"btn btn-outline btn-small\" type=\"button\" data-action=\"add\" data-index=\"" + row.index + "\">+10</button>" +
              "<button class=\"btn btn-outline btn-small\" type=\"button\" data-action=\"subtract\" data-index=\"" + row.index + "\">-10</button>" +
              "<button class=\"btn btn-danger btn-small\" type=\"button\" data-action=\"delete\" data-index=\"" + row.index + "\">Hapus</button>" +
            "</div></td>" +
          "</tr>";
        })
        .join("");
    }

    if (cardContainer) {
      cardContainer.innerHTML = filtered
        .map(function (row) {
          var item = row.item;
          return "<article class=\"card stock-card\">" +
            "<img src=\"" + escapeHTML(item.cover) + "\" alt=\"Cover " + escapeHTML(item.namaBarang) + "\">" +
            "<div class=\"card-body\">" +
              "<span class=\"badge\">" + escapeHTML(item.kodeBarang) + "</span>" +
              "<h3>" + escapeHTML(item.namaBarang) + "</h3>" +
              "<p>Lokasi: " + escapeHTML(item.kodeLokasi) + "</p>" +
              "<div class=\"stock-meta\">" +
                "<span class=\"badge badge-warning\">Edisi " + escapeHTML(item.edisi) + "</span>" +
                "<span class=\"badge badge-success\">Stok " + formatNumber(item.stok) + "</span>" +
              "</div>" +
            "</div>" +
          "</article>";
        })
        .join("");
    }

    updateStockSummary(filtered.length);
  }

  function renderStockStatus(stok) {
    if (stok < 200) {
      return "<span class=\"badge\" style=\"background: rgba(214, 69, 69, 0.12); color: #d64545;\">Menipis</span>";
    }
    if (stok < 300) {
      return "<span class=\"badge badge-warning\">Perlu dipantau</span>";
    }
    return "<span class=\"badge badge-success\">Aman</span>";
  }

  function updateStockSummary(filteredCount) {
    var totalStock = dataBahanAjar.reduce(function (sum, item) {
      return sum + Number(item.stok || 0);
    }, 0);

    var minimumStock = dataBahanAjar.reduce(function (min, item) {
      return Math.min(min, Number(item.stok || 0));
    }, dataBahanAjar.length ? Number(dataBahanAjar[0].stok) : 0);

    setText("stockTotalJenis", dataBahanAjar.length);
    setText("stockTotalEksemplar", formatNumber(totalStock));
    setText("stockTerendah", formatNumber(minimumStock));
    setText("stockFiltered", filteredCount);
  }
})();
