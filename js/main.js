(function () {
            var g = function (i) { var el = document.getElementById(i); return el ? el.value.trim() : ""; };
            var m = document.getElementById("fmsg");
            var bMail = document.getElementById("fs");
            var bWa = document.getElementById("fs_wa");

            var radios = document.querySelectorAll('input[name="order_type"]');
            var blockStandard = document.getElementById("block_standard");
            var blockCustomSet = document.getElementById("block_custom_set");
            var blockBudget = document.getElementById("block_budget");

            var selectCustomHamper = document.getElementById("fh_custom");
            var subProductsList = document.getElementById("sub_products_list");

            // Chuyển đổi giữa 3 mục: chỉ được chọn 1 trong 3
            radios.forEach(function (r) {
                r.addEventListener("change", function () {
                    var val = this.value;
                    blockStandard.style.display = (val === "standard") ? "block" : "none";
                    blockCustomSet.style.display = (val === "custom_set") ? "block" : "none";
                    blockBudget.style.display = (val === "budget") ? "block" : "none";
                });
            });

            // Khi chọn 1 set trong mục "Thiết kế theo yêu cầu" -> mở danh sách sản phẩm lẻ
            if (selectCustomHamper) {
                selectCustomHamper.addEventListener("change", function () {
                    if (this.value) {
                        subProductsList.style.display = "block";
                    } else {
                        subProductsList.style.display = "none";
                    }
                });
            }

            function validate() {
                var ph = g("fp");
                if (ph.replace(/\D/g, "").length < 9) {
                    m.style.color = "var(--red)";
                    m.textContent = "Vui lòng nhập số điện thoại hợp lệ để LisaFood tiện liên hệ.";
                    return false;
                }
                var activeType = document.querySelector('input[name="order_type"]:checked').value;
                if (activeType === "standard" && !g("fh")) {
                    m.style.color = "var(--red)";
                    m.textContent = "Vui lòng chọn một mẫu hamper quan tâm trong danh sách.";
                    return false;
                }
                if (activeType === "custom_set" && !g("fh_custom")) {
                    m.style.color = "var(--red)";
                    m.textContent = "Vui lòng chọn mẫu set quà bạn muốn thiết kế.";
                    return false;
                }
                if (activeType === "budget" && !g("f_budget")) {
                    m.style.color = "var(--red)";
                    m.textContent = "Vui lòng nhập mức ngân sách bạn mong muốn.";
                    return false;
                }
                return true;
            }

            function getSelectedProducts() {
                var checked = document.querySelectorAll('input[name="custom_prod"]:checked');
                var items = [];
                checked.forEach(function (c) { items.push(c.value); });
                return items.length > 0 ? items.join(", ") : "Chưa chọn (tư vấn theo mẫu)";
            }

            function buildFormDetails() {
                var activeType = document.querySelector('input[name="order_type"]:checked').value;
                var hType = "";
                var hDetail = "";

                if (activeType === "standard") {
                    hType = "Mẫu hamper có sẵn (kèm giá)";
                    hDetail = g("fh");
                } else if (activeType === "custom_set") {
                    hType = "Thiết kế mẫu hamper theo yêu cầu";
                    hDetail = "Set mẫu: " + g("fh_custom") + "\n• Sản phẩm lẻ phối thêm: " + getSelectedProducts();
                } else if (activeType === "budget") {
                    hType = "Ngân sách theo yêu cầu";
                    hDetail = "Mức ngân sách yêu cầu: " + g("f_budget");
                }

                return {
                    type: hType,
                    detail: hDetail,
                    text: "[YÊU CẦU BÁO GIÁ HAMPER TẾT 2027]\n" +
                        "• Họ tên: " + (g("fn") || "(Chưa điền)") + "\n" +
                        "• Số điện thoại: " + g("fp") + "\n" +
                        "• Công ty: " + (g("fc") || "(Cá nhân)") + "\n" +
                        "• Số lượng: " + (g("fq") || "1") + " set\n" +
                        "• Hình thức: " + hType + "\n" +
                        "• Chi tiết chọn: " + hDetail + "\n" +
                        "• Ghi chú thêm: " + (g("fm") || "(Không có)")
                };
            }

            if (bMail) {
                bMail.addEventListener("click", function () {
                    if (!validate()) return;
                    m.style.color = "var(--gold)";
                    m.textContent = "Đang gửi yêu cầu đến sale@lisafood.vn...";
                    bMail.disabled = true;

                    var info = buildFormDetails();

                    fetch("https://formsubmit.co/ajax/sale@lisafood.vn", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Accept": "application/json" },
                        body: JSON.stringify({
                            _subject: "[LisaFood Hamper] Yêu cầu báo giá từ " + (g("fn") || g("fp")),
                            "Họ và tên": g("fn"),
                            "Số điện thoại": g("fp"),
                            "Công ty": g("fc"),
                            "Số lượng": g("fq"),
                            "Hình thức lựa chọn": info.type,
                            "Chi tiết yêu cầu": info.detail,
                            "Ghi chú": g("fm")
                        })
                    })
                        .then(function (res) { return res.json(); })
                        .then(function (data) {
                            m.style.color = "#2e7d32";
                            m.textContent = "✓ Gửi yêu cầu thành công! Bộ phận kinh doanh LisaFood sẽ liên hệ lại sớm nhất.";
                            bMail.disabled = false;
                        })
                        .catch(function (err) {
                            var a = document.createElement("a");
                            a.href = "mailto:sale@lisafood.vn?subject=" + encodeURIComponent("Yêu cầu báo giá hamper Tết 2027") + "&body=" + encodeURIComponent(info.text);
                            document.body.appendChild(a); a.click(); a.remove();
                            m.style.color = "#2e7d32";
                            m.textContent = "Đã mở ứng dụng Email để hoàn tất gửi đến sale@lisafood.vn.";
                            bMail.disabled = false;
                        });
                });
            }

            if (bWa) {
                bWa.addEventListener("click", function () {
                    if (!validate()) return;
                    var info = buildFormDetails();
                    var waUrl = "https://api.whatsapp.com/send?phone=84907560668&text=" + encodeURIComponent(info.text);
                    m.style.color = "#25D366";
                    m.textContent = "Đang mở WhatsApp với nội dung soạn sẵn...";
                    window.open(waUrl, "_blank");
                });
            }
        })();

// --- QUẢN LÝ DANH SÁCH QUAN TÂM & DỰ TOÁN ---
        var inquiryList = [];

        function adjustQty(btn, delta) {
            var ctrl = btn.parentElement;
            var inp = ctrl.querySelector('.qty-val');
            var val = parseInt(inp.value, 10) || 1;
            val += delta;
            if (val < 1) val = 1;
            inp.value = val;
        }

        function addItemToList(title, priceNum, priceStr, btn) {
            var card = btn.closest('.hb') || btn.closest('.pc');
            var qtyInp = card ? card.querySelector('.qty-val') : null;
            var qty = qtyInp ? (parseInt(qtyInp.value, 10) || 1) : 1;

            var existing = inquiryList.find(function (item) { return item.title === title; });
            if (existing) {
                existing.qty += qty;
            } else {
                inquiryList.push({ title: title, price: priceNum, priceStr: priceStr, qty: qty });
            }

            if (btn) {
                var origText = btn.textContent;
                btn.textContent = "✓ Đã thêm";
                btn.classList.add("added");
                setTimeout(function () {
                    btn.textContent = origText;
                    btn.classList.remove("added");
                }, 1200);
            }

            updateCartUI();
        }

        function updateCartUI() {
            var totalCount = 0;
            var totalPrice = 0;
            var tbody = document.getElementById("cartItemsTbody");
            var badge = document.getElementById("cartCountBadge");
            var openBtn = document.getElementById("openModalBtn");
            var totalVal = document.getElementById("cartTotalVal");

            inquiryList.forEach(function (item) {
                totalCount += item.qty;
                totalPrice += item.price * item.qty;
            });

            if (badge) badge.textContent = totalCount;
            if (openBtn) openBtn.style.display = totalCount > 0 ? "flex" : "none";
            if (totalVal) totalVal.textContent = totalPrice.toLocaleString('vi-VN') + "đ";

            if (tbody) {
                tbody.innerHTML = "";
                if (inquiryList.length === 0) {
                    tbody.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px;">Chưa có mẫu quà nào trong danh sách. Quý khách vui lòng chọn thêm từ bộ sưu tập phía trên.</div>';
                    return;
                }

                inquiryList.forEach(function (item, idx) {
                    var row = document.createElement("div");
                    row.className = "inquiry-item-row";
                    row.innerHTML =
                        '<div class="inquiry-item-info">' +
                        '<div class="inquiry-item-title">' + item.title + '</div>' +
                        '<div class="inquiry-item-price">' + (item.price * item.qty).toLocaleString('vi-VN') + 'đ</div>' +
                        '</div>' +
                        '<div class="inquiry-item-actions">' +
                        '<div class="qty-ctrl" style="border-radius:6px;">' +
                        '<button type="button" class="qty-btn" style="width:22px;height:24px;font-size:13px;" onclick="changeModalItemQty(' + idx + ', -1)">-</button>' +
                        '<input type="text" class="qty-val" style="width:26px;font-size:12px;" value="' + item.qty + '" readonly>' +
                        '<button type="button" class="qty-btn" style="width:22px;height:24px;font-size:13px;" onclick="changeModalItemQty(' + idx + ', 1)">+</button>' +
                        '</div>' +
                        '<button type="button" class="inquiry-del-btn" title="Xóa món này" onclick="removeModalItem(' + idx + ')">&times;</button>' +
                        '</div>';
                    tbody.appendChild(row);
                });
            }
        }

        function changeModalItemQty(idx, delta) {
            if (inquiryList[idx]) {
                inquiryList[idx].qty += delta;
                if (inquiryList[idx].qty <= 0) {
                    inquiryList.splice(idx, 1);
                }
                updateCartUI();
            }
        }

        function removeModalItem(idx) {
            inquiryList.splice(idx, 1);
            updateCartUI();
        }

        function toggleListModal(show) {
            var modal = document.getElementById("listModal");
            if (!modal) return;
            if (show) {
                modal.classList.add("open");
                updateCartUI();
            } else {
                modal.classList.remove("open");
            }
        }

        function submitModalOrder(channel) {
            var msgEl = document.getElementById("m_msg");
            var name = (document.getElementById("m_name").value || "").trim();
            var phone = (document.getElementById("m_phone").value || "").trim();
            var note = (document.getElementById("m_note").value || "").trim();

            if (inquiryList.length === 0) {
                msgEl.style.color = "var(--red)";
                msgEl.textContent = "Danh sách hiện đang trống, vui lòng chọn ít nhất 1 mẫu quà.";
                return;
            }
            if (phone.replace(/\D/g, "").length < 9) {
                msgEl.style.color = "var(--red)";
                msgEl.textContent = "Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 số).";
                return;
            }

            var totalPrice = 0;
            var linesText = [];
            inquiryList.forEach(function (item) {
                var sub = item.price * item.qty;
                totalPrice += sub;
                linesText.push("• " + item.qty + "x " + item.title + " (" + sub.toLocaleString('vi-VN') + "đ)");
            });

            var summaryText = "[PHIẾU YÊU CẦU DỰ TOÁN QUÀ TẾT]\n" +
                "• Khách hàng: " + (name || "(Chưa điền)") + "\n" +
                "• Số điện thoại: " + phone + "\n" +
                "• Đơn vị / Ghi chú: " + (note || "Không có") + "\n" +
                "• Danh sách mẫu quà quan tâm:\n" + linesText.join("\n") + "\n" +
                "• TỔNG DỰ TOÁN THAM KHẢO: " + totalPrice.toLocaleString('vi-VN') + "đ";

            if (channel === 'whatsapp') {
                var waUrl = "https://api.whatsapp.com/send?phone=84907560668&text=" + encodeURIComponent(summaryText);
                msgEl.style.color = "#25D366";
                msgEl.textContent = "Đang kết nối WhatsApp với danh sách đã soạn sẵn...";
                window.open(waUrl, "_blank");
            } else if (channel === 'email') {
                msgEl.style.color = "var(--gold)";
                msgEl.textContent = "Đang gửi danh sách dự toán đến sale@lisafood.vn...";

                fetch("https://formsubmit.co/ajax/sale@lisafood.vn", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Accept": "application/json" },
                    body: JSON.stringify({
                        _subject: "[LisaFood Hamper] Yêu cầu dự toán từ " + (name || phone),
                        "Họ và tên": name,
                        "Số điện thoại": phone,
                        "Đơn vị / Ghi chú": note,
                        "Danh sách mẫu quan tâm": linesText.join(" | "),
                        "Tổng dự toán tham khảo": totalPrice.toLocaleString('vi-VN') + "đ"
                    })
                })
                    .then(function (res) { return res.json(); })
                    .then(function () {
                        msgEl.style.color = "#2e7d32";
                        msgEl.textContent = "✓ Gửi yêu cầu dự toán thành công! LisaFood sẽ liên hệ lại sớm nhất.";
                        inquiryList = [];
                        updateCartUI();
                        setTimeout(function () { toggleListModal(false); }, 2500);
                    })
                    .catch(function () {
                        var a = document.createElement("a");
                        a.href = "mailto:sale@lisafood.vn?subject=" + encodeURIComponent("Yêu cầu dự toán hamper Tết 2027") + "&body=" + encodeURIComponent(summaryText);
                        document.body.appendChild(a); a.click(); a.remove();
                        msgEl.style.color = "#2e7d32";
                        msgEl.textContent = "Đã mở ứng dụng Email để hoàn tất gửi đến sale@lisafood.vn.";
                    });
            }
        }

// --- ĐIỀU KHIỂN POPUP LIGHTBOX ALBUM SLIDER ---
        var currentAlbum = [];
        var currentAlbumIdx = 0;
        var currentAlbumTitle = "";

        function openAlbumLightbox(imgList, title) {
            var lb = document.getElementById("imgLightbox");
            if (!lb || imgList.length === 0) return;

            currentAlbum = imgList;
            currentAlbumIdx = 0;
            currentAlbumTitle = title;

            updateLightboxView();
            lb.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function updateLightboxView() {
            var img = document.getElementById("lightboxImg");
            var cap = document.getElementById("lightboxCap");
            var counter = document.getElementById("lbCounter");
            var prevBtn = document.getElementById("lbPrev");
            var nextBtn = document.getElementById("lbNext");

            if (img) img.src = currentAlbum[currentAlbumIdx];
            if (cap) cap.textContent = currentAlbumTitle;

            if (currentAlbum.length > 1) {
                if (counter) counter.textContent = (currentAlbumIdx + 1) + " / " + currentAlbum.length;
                if (prevBtn) prevBtn.style.display = "flex";
                if (nextBtn) nextBtn.style.display = "flex";
            } else {
                if (counter) counter.textContent = "";
                if (prevBtn) prevBtn.style.display = "none";
                if (nextBtn) nextBtn.style.display = "none";
            }
        }

        function navigateLightbox(dir) {
            if (currentAlbum.length <= 1) return;
            currentAlbumIdx += dir;
            if (currentAlbumIdx < 0) currentAlbumIdx = currentAlbum.length - 1;
            if (currentAlbumIdx >= currentAlbum.length) currentAlbumIdx = 0;
            updateLightboxView();
        }

        function closeLightbox(e) {
            if (e && e.target && (e.target.id === "lightboxImg" || e.target.classList.contains("lightbox-btn"))) {
                return;
            }
            var lb = document.getElementById("imgLightbox");
            if (lb) {
                lb.classList.remove("active");
                document.body.style.overflow = "";
            }
        }

        var existingMultiImages = {
            "images/hat-dieu-rang-muoi-250g.jpg": [
                "images/hat-dieu-rang-muoi-250g.jpg",
                "images/hat-dieu-rang-muoi-250g-2.png",
                "images/hat-dieu-rang-muoi-250g-3.png"
            ],
            "images/hat-macca-say-250g.jpg": [
                "images/hat-macca-say-250g.jpg",
                "images/hat-macca-say-250g-2.png",
                "images/hat-macca-say-250g-3.png"
            ],
            "images/hanh-nhan-rang-bo-250g.jpg": [
                "images/hanh-nhan-rang-bo-250g.jpg",
                "images/hanh-nhan-rang-bo-250g-2.png",
                "images/hanh-nhan-rang-bo-250g-3.png"
            ],
            "images/hat-dieu-rang-moc-boc-vo-250g.jpg": [
                "images/hat-dieu-rang-moc-boc-vo-250g.jpg",
                "images/hat-dieu-rang-moc-boc-vo-250g-2.png",
            ],
            "images/hat-dieu-rang-moc-vo-lua-250g.jpg": [
                "images/hat-dieu-rang-moc-vo-lua-250g.jpg",
                "images/hat-dieu-rang-moc-vo-lua-250g-2.png",
            ],
            "images/catalogue-tet-2027-lisafood.jpg": [
                "images/catalogue-tet-2027-lisafood.jpg",
            ],
            "images/hamper-sac-xuan-01-a-2.jpg": [
                "images/hamper-sac-xuan-01-a-2.jpg"
            ]
        };

        document.addEventListener("DOMContentLoaded", function () {
            var allCards = document.querySelectorAll(".hc, .pc, .heroimg");
            allCards.forEach(function (card) {
                var img = card.querySelector("img");
                if (!img) return;

                img.addEventListener("click", function (e) {
                    e.stopPropagation();
                    var title = "";
                    var h = card.querySelector("h3") || card.querySelector("b");
                    if (h) title = h.textContent.trim();
                    else if (img.alt) title = img.alt;

                    var src = img.getAttribute("src");
                    var album = existingMultiImages[src] || [src];
                    openAlbumLightbox(album, title);
                });
            });

            // Phím mũi tên
            document.addEventListener("keydown", function (e) {
                var lb = document.getElementById("imgLightbox");
                if (lb && lb.classList.contains("active")) {
                    if (e.key === "ArrowLeft") navigateLightbox(-1);
                    if (e.key === "ArrowRight") navigateLightbox(1);
                    if (e.key === "Escape") closeLightbox();
                }
            });

            // Vuốt cảm ứng trên mobile
            var touchStartX = 0, touchEndX = 0;
            var lb = document.getElementById("imgLightbox");
            if (lb) {
                lb.addEventListener("touchstart", function (e) {
                    touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });
                lb.addEventListener("touchend", function (e) {
                    touchEndX = e.changedTouches[0].screenX;
                    var diff = touchEndX - touchStartX;
                    if (Math.abs(diff) > 40) {
                        if (diff < 0) navigateLightbox(1);
                        else navigateLightbox(-1);
                    }
                }, { passive: true });
            }
        });

// --- LOGIC TÍNH TOÁN VỊ TRÍ CHUỘT SPOTLIGHT (CHÍNH XÁC TỪ SPOTLIGHTCARD.JSX) ---
        document.addEventListener("DOMContentLoaded", function () {
            var cards = document.querySelectorAll(".hc");
            cards.forEach(function (card) {
                card.addEventListener("mousemove", function (e) {
                    var rect = card.getBoundingClientRect();
                    var x = e.clientX - rect.left;
                    var y = e.clientY - rect.top;
                    var glow = card.querySelector(".spotlight-glow");
                    if (glow) {
                        glow.style.setProperty("--mouse-x", x + "px");
                        glow.style.setProperty("--mouse-y", y + "px");
                    }
                });
            });
        });

// --- HIỆU ỨNG NAVBAR CO GIÃN KHI CUỘN & MENU MOBILE ---
window.addEventListener("scroll", function() {
    var nb = document.getElementById("mainNavbar");
    if (!nb) return;
    if (window.scrollY > 30) {
        nb.classList.add("scrolled");
    } else {
        nb.classList.remove("scrolled");
    }
}, { passive: true });

function toggleMobileNavbar(forceState) {
    var menu = document.getElementById("mobileNavMenu");
    var btn = document.getElementById("burgerBtn");
    if (!menu) return;
    if (typeof forceState === "boolean") {
        if (forceState) {
            menu.classList.add("open");
            if (btn) btn.textContent = "✕";
        } else {
            menu.classList.remove("open");
            if (btn) btn.textContent = "☰";
        }
    } else {
        var isOpen = menu.classList.toggle("open");
        if (btn) btn.textContent = isOpen ? "✕" : "☰";
    }
}
