(function () {
    ("use strict");

    // HTML Root Element
    const rootHtml = document.documentElement;

    var setLocalDb = {
        lang: "en",
        dir: "ltl",
        dataSidebar: "open",
        dataTheme: "light"
    };
    window.localStorage.setItem("siteData", JSON.stringify(setLocalDb));
    const getLocalDb = JSON.parse(localStorage.getItem("siteData"));

    // Layout design
    const verticalMenuBtn = document.querySelector(".vertical-menu-btn");
    if (verticalMenuBtn != null) {
        const dashboardWrapper = document.querySelector(".dashboard-wrapper");
        // Create overlay
        const overlay = document.createElement('div');
        overlay.setAttribute('class', 'overlay-bg');

        function checkDeviceWidth() {
            const deviceWidth = window.innerWidth;
            if (deviceWidth <= 992) {
                setSidebarAttribute("close");
                verticalMenuBtn.addEventListener("click", toggleSidebar);
                dashboardWrapper.appendChild(overlay);
            } else {
                setSidebarAttribute("open");
                verticalMenuBtn.addEventListener("click", toggleSidebar);
                overlay.remove()

            }
        }

        function setSidebarAttribute(value) {
            rootHtml.setAttribute("data-sidebar", value);
        }

        function toggleSidebar() {
            const currentAttribute = rootHtml.getAttribute("data-sidebar");
            const newAttribute = currentAttribute === "open" ? "close" : "open";
            setSidebarAttribute(newAttribute);
            if (newAttribute === "open") {
                overlay.addEventListener("click", function () {
                    overlay.style.display = "none";
                    setSidebarAttribute("close");
                });
            }

            overlay.style.display = newAttribute === "open" ? "block" : "none";
        }

        window.addEventListener("resize", checkDeviceWidth);
        checkDeviceWidth();
    }

    // Sidebar Menu
    if (document.querySelectorAll(".sidebar-menu .collapse")) {
        var collapses = document.querySelectorAll(".sidebar-menu .collapse");
        Array.from(collapses).forEach(function (collapse) {
            var collapseInstance = new bootstrap.Collapse(collapse, {
                toggle: false,
            });
            // Hide sibling collapses on `show.bs.collapse`
            collapse.addEventListener("show.bs.collapse", function (e) {
                e.stopPropagation();
                var closestCollapse = collapse.parentElement.closest(".collapse");
                if (closestCollapse) {
                    var siblingCollapses = closestCollapse.querySelectorAll(".collapse");
                    Array.from(siblingCollapses).forEach(function (siblingCollapse) {
                        var siblingCollapseInstance = bootstrap.Collapse.getInstance(siblingCollapse);
                        if (siblingCollapseInstance === collapseInstance) {
                            return;
                        }
                        siblingCollapseInstance.hide();
                    });
                } else {
                    var getSiblings = function (elem) {
                        var siblings = [];
                        var sibling = elem.parentNode.firstChild;
                        while (sibling) {
                            if (sibling.nodeType === 1 && sibling !== elem) {
                                siblings.push(sibling);
                            }
                            sibling = sibling.nextSibling;
                        }
                        return siblings;
                    };
                    var siblings = getSiblings(collapse.parentElement);
                    Array.from(siblings).forEach(function (item) {
                        if (item.childNodes.length > 2)
                            item.firstElementChild.setAttribute("aria-expanded", "false");
                        var ids = item.querySelectorAll("*[id]");
                        Array.from(ids).forEach(function (item1) {
                            item1.classList.remove("show");
                            if (item1.childNodes.length > 2) {
                                var val = item1.querySelectorAll("ul li a");
                                Array.from(val).forEach(function (subitem) {
                                    if (subitem.hasAttribute("aria-expanded"))
                                        subitem.setAttribute("aria-expanded", "false");
                                });
                            }
                        });
                    });
                }
            });

            // Hide nested collapses on `hide.bs.collapse`
            collapse.addEventListener("hide.bs.collapse", function (e) {
                e.stopPropagation();
                var childCollapses = collapse.querySelectorAll(".collapse");
                Array.from(childCollapses).forEach(function (childCollapse) {
                    childCollapseInstance = bootstrap.Collapse.getInstance(childCollapse);
                    childCollapseInstance.hide();
                });
            });
        });
    }

    // RTL And LTL 
    const ltrToRtl = document.querySelector(".rtl-ltr-btn")
    if (ltrToRtl != null) {
        ltrToRtl.addEventListener("click", () => {
            const currentAttribute = rootHtml.getAttribute("dir");
            const newAttribute = currentAttribute === "rtl" ? "ltr" : "rtl";

            rootHtml.setAttribute("dir", newAttribute);
            localStorage.setItem("dirAttribute", newAttribute);
        });
    }
    document.addEventListener("DOMContentLoaded", () => {
        const storedAttribute = localStorage.getItem("dirAttribute");
        if (storedAttribute) {
            rootHtml.setAttribute("dir", storedAttribute);
        }
    });


    // Dark And Light mode
    const themeBtn = document.querySelector(".theme-btn");
    if (themeBtn != null) {
        const storedTheme = localStorage.getItem("theme");

        if (storedTheme) {
            themeBtn.innerHTML = storedTheme === "dark" ? `<i class="las la-moon"></i>` : `<i class="las la-sun"></i>`;
            rootHtml.setAttribute("color-scheme", storedTheme);
        } else {
            themeBtn.innerHTML = `<i class="las la-sun"></i>`;
            rootHtml.setAttribute("color-scheme", "light");
        }

        themeBtn.addEventListener("click", () => {
            // Toggle theme preference
            const currentTheme = themeBtn.innerHTML;
            const changeTheme = currentTheme === `<i class="las la-sun"></i>` ? `<i class="las la-moon"></i>` : `<i class="las la-sun"></i>`;
            themeBtn.innerHTML = changeTheme;

            // Toggle theme attributes
            const currentAttribute = rootHtml.getAttribute("color-scheme");
            const newAttribute = currentAttribute === "dark" ? "light" : "dark";
            rootHtml.setAttribute("color-scheme", newAttribute);

            localStorage.setItem("theme", newAttribute);
        });
    }


    // Full Screen Viewer With browser support
    let fullscreenBtn = document.querySelector(".fullscreen-btn");
    if (fullscreenBtn != null) {
        fullscreenBtn.innerHTML = `<i class="las la-expand"></i>`;
        fullscreenBtn.addEventListener("click", () => {
            if (fullscreenBtn.innerHTML == `<i class="las la-expand"></i>`) {
                if (rootHtml.requestFullscreen) {
                    rootHtml.requestFullscreen();
                }
                else if (rootHtml.msRequestFullscreen) {
                    rootHtml.msRequestFullscreen();
                }
                else if (rootHtml.mozRequestFullScreen) {
                    rootHtml.mozRequestFullScreen();
                }
                else if (rootHtml.webkitRequestFullscreen) {
                    rootHtml.webkitRequestFullscreen();
                }
                fullscreenBtn.innerHTML = `<i class="las la-compress"></i>`;
            }

            else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                else if (document.msexitFullscreen) {
                    document.msexitFullscreen();
                }
                else if (document.mozexitFullscreen) {
                    document.mozexitFullscreen();
                }
                else if (document.webkitexitFullscreen) {
                    document.webkitexitFullscreen();
                }
                fullscreenBtn.innerHTML = `<i class="las la-expand"></i>`;
            }
        });
    }


    // Ripple button effects==============
    Array.from(document.querySelectorAll('[anim="ripple"]'), el => {
        el.addEventListener('click', e => {
            e = e.touches ? e.touches[0] : e;
            const r = el.getBoundingClientRect(), d = Math.sqrt(Math.pow(r.width, 2) + Math.pow(r.height, 2)) * 2;
            el.style.cssText = `--s: 0; --o: 1;`; el.offsetTop;
            el.style.cssText = `--t: 1; --o: 0; --d: ${d}; --x:${e.clientX - r.left}; --y:${e.clientY - r.top};`
        })
    })

    //  Live Alerts
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
    }
    const alertTrigger = document.querySelectorAll('.liveAlertBtn')
    if (alertTrigger) {
        alertTrigger.forEach((item) => {
            item.addEventListener('click', () => {
                appendAlert('Nice, you triggered this alert message!', 'success')
            })
        })
    }

    // Live Bootstrap Notification 
    const toastTrigger = document.querySelectorAll('.liveToastBtn')
    const toastLiveExample = document.getElementById('liveToast')

    if (toastTrigger) {
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
        toastTrigger.forEach((itemTrigger) => {
            itemTrigger.addEventListener('click', () => {
                toastBootstrap.show()
            })
        })
    }


// password toggle

 // ✅ Your existing login script (leave this as it is)
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePassword.classList.remove('ri-eye-fill');
        togglePassword.classList.add('ri-eye-off-fill');
      } else {
        passwordInput.type = 'password';
        togglePassword.classList.remove('ri-eye-off-fill');
        togglePassword.classList.add('ri-eye-fill');
      }
    });
  }

  // ✅ New signup toggles (separate IDs)
  function setupPasswordToggle(toggleId, inputId) {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    if (toggle && input) {
      toggle.addEventListener('click', () => {
        if (input.type === 'password') {
          input.type = 'text';
          toggle.classList.remove('ri-eye-fill');
          toggle.classList.add('ri-eye-off-fill');
        } else {
          input.type = 'password';
          toggle.classList.remove('ri-eye-off-fill');
          toggle.classList.add('ri-eye-fill');
        }
      });
    }
  }

  setupPasswordToggle('toggleSignupPassword', 'signupPassword');
  setupPasswordToggle('toggleSignupConfirmPassword', 'signupConfirmPassword');




}())