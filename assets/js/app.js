(function () {
    ("use strict");

    // HTML Root Element
    const rootHtml = document.documentElement;

    // Layout design
    const verticalMenuBtn = document.querySelector(".vertical-menu-btn");
    if (verticalMenuBtn != null) {
        const dashboardWrapper = document.querySelector(".dashboard-wrapper");
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


    // Ripple button effects==============
    Array.from(document.querySelectorAll('[anim="ripple"]'), el => {
        el.addEventListener('click', e => {
            e = e.touches ? e.touches[0] : e;
            const r = el.getBoundingClientRect(),
                d = Math.sqrt(Math.pow(r.width, 2) + Math.pow(r.height, 2)) * 2;
            el.style.cssText = `--s: 0; --o: 1;`;
            el.offsetTop;
            el.style.cssText = `--t: 1; --o: 0; --d: ${d}; --x:${e.clientX - r.left}; --y:${e.clientY - r.top};`
        })
    })




    // password toggle

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

    // New signup toggles (separate IDs)
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

    setupPasswordToggle('toggleCurrentPassword', 'currentPassword');
    setupPasswordToggle('toggleNewPassword', 'newPassword');
    setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');


    const inputs = document.querySelectorAll(".otp-input");

    inputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
            const value = e.target.value.replace(/[^0-9]/g, "");
            e.target.value = value;

            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        input.addEventListener("paste", (e) => {
            e.preventDefault();
            const pasteData = (e.clipboardData || window.clipboardData).getData("text").replace(/[^0-9]/g, "");
            if (!pasteData) return;

            const chars = pasteData.split("");
            inputs.forEach((box, i) => {
                box.value = chars[i] || "";
            });

            const lastIndex = Math.min(chars.length, inputs.length) - 1;
            if (lastIndex >= 0) {
                inputs[lastIndex].focus();
            }
        });
    });



    // On input focus icon color change
    const inputWrappers = document.querySelectorAll(".input-wrapper");
    inputWrappers.forEach(wrapper => {
        const input = wrapper.querySelector("input");
        const icon = wrapper.querySelector("i:not(.toggle-eye)");

        if (input && icon) {
            input.addEventListener("focus", () => {
                icon.classList.add("text--primary");
            });

            input.addEventListener("blur", () => {
                icon.classList.remove("text--primary");
            });
        }
    });

    //   Opportunity chart
    var options = {
  series: [
    {
      name: 'Opportunities',
      data: [
        [0, 2.75],
        [6, 32.54],
        [12, 93.56],
        [18, 63.71],
        [24, 33.81]
      ]
    },
    {
      name: 'Leads',
      data: [
        [0, 10],
        [6, 40],
        [12, 70],
        [18, 90],
        [24, 10]
      ]
    }
  ],
  chart: {
    id: 'area-datetime',
    type: 'area',
    height: 250,
    toolbar: { show: false },
    zoom: { autoScaleYaxis: true }
  },
  stroke: {
    width: 2,
    colors: ['#C18544', '#86562B'] // one for each series
  },
  colors: ['#C18544', '#86562B'], // base colors for each series
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      gradientToColors: ['#86562B', '#C18544'], // matching each series
      opacityFrom: 0.7,
      opacityTo: 0.1,
      stops: [0, 100]
    }
  },
  dataLabels: { enabled: false },
  markers: { size: 0, style: 'hollow' },

  xaxis: {
    type: 'numeric',
    tickAmount: 4,
    min: 0,
    max: 24,
    tickPlacement: 'between',
    labels: {
      formatter: function (val) {
        return val.toFixed(2); // → 0.00, 6.00, etc.
      }
    }
  },
  yaxis: {
    min: 0,
    max: 150,
    tickAmount: 3,
    labels: {
      formatter: function (val) {
        return Math.round(val); // → 0, 50, 100, 150
      }
    }
  },
  tooltip: {
    x: {
      formatter: function (val) {
        return val.toFixed(2) + " hrs"; // custom tooltip (optional)
      }
    }
  }
};

const chartEl = document.querySelector("#opportunity-chart");
if (chartEl) {
  var opportunityChart = new ApexCharts(chartEl, options);
  opportunityChart.render();
}



    // application chart
    var options = {
        chart: {
            type: 'area',
            height: 210,
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        series: [{
            name: 'Applications',
            data: [12, 40, 28, 33, 21, 30]
        }],
        xaxis: {
            categories: ['Aug 24', 'Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29'],
            labels: {
                style: { colors: '#555', fontSize: '13px' }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            min: 0,
            max: 45,
            tickAmount: 4,
            labels: { style: { colors: '#777', fontSize: '13px' } }
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            colors: ['#7b3f00']
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.05,
                stops: [0, 100],
                colorStops: [
                    {
                        offset: 0,
                        color: '#ff8c00',
                        opacity: 0.2
                    },
                    {
                        offset: 100,
                        color: '#ffffff',
                        opacity: 0
                    }
                ]
            }
        },
        grid: {
            borderColor: '#e6e6e6',
            strokeDashArray: 2,
        },
        markers: {
            size: 5,
            colors: ['#fff'],
            strokeColors: '#7b3f00',
            strokeWidth: 3,
            hover: { size: 7 }
        },
        tooltip: {
            theme: 'light',
            style: { fontSize: '14px' },
            marker: { show: false },
            y: {
                formatter: function (val) { return val; }
            }
        },
        dataLabels: { enabled: false },
        legend: { show: false }
    };

    const chartE2 = document.querySelector("#applicationsChart");
    if (chartE2) {
        var applicationChart = new ApexCharts(chartE2, options);
        applicationChart.render();
    }


    // Opportunity Js
    document.addEventListener("DOMContentLoaded", () => {
  const priceSlider = document.getElementById('priceSlider');
  const minInput = document.getElementById('minPriceInput');
  const maxInput = document.getElementById('maxPriceInput');

  noUiSlider.create(priceSlider, {
    start: [100, 500],
    connect: true,
    range: {
      'min': 100,
      'max': 500
    },
    step: 1,
    tooltips: false,
  });

  priceSlider.noUiSlider.on('update', (values) => {
    const [min, max] = values.map(Number);
    minInput.value = Math.round(min);
    maxInput.value = Math.round(max);
  });

  minInput.addEventListener('change', () => {
    let minVal = parseInt(minInput.value);
    let maxVal = parseInt(maxInput.value);

    if (isNaN(minVal) || minVal < 100) minVal = 100;
    if (minVal >= maxVal) minVal = maxVal - 1;
    if (minVal > 500) minVal = 499;

    minInput.value = minVal;
    priceSlider.noUiSlider.set([minVal, null]);
  });

  maxInput.addEventListener('change', () => {
    let maxVal = parseInt(maxInput.value);
    let minVal = parseInt(minInput.value);

    if (isNaN(maxVal) || maxVal > 500) maxVal = 500;
    if (maxVal <= minVal) maxVal = minVal + 1;
    if (maxVal < 100) maxVal = 101;

    maxInput.value = maxVal;
    priceSlider.noUiSlider.set([null, maxVal]);
  });
});




    document.addEventListener('DOMContentLoaded', function () {
        const filterToggleBtn = document.getElementById('filterToggleBtn');
        const filterPanel = document.getElementById('filterPanel');
        const overlay = document.getElementById('overlay');

        if (filterToggleBtn) {
            filterToggleBtn.addEventListener('click', function () {
                filterPanel.classList.toggle('show');
                overlay.classList.toggle('show');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                filterPanel.classList.remove('show');
                overlay.classList.remove('show');
            });
        }
    });


    // step form


    // ======= MULTI-ENTRY HANDLER (FINAL STABLE VERSION) =======
(function () {
  function run() {
    const sections = (typeof formSections !== "undefined")
      ? formSections
      : document.querySelectorAll(".form-section");

    if (!sections || sections.length === 0) return;

    // Multi-step navigation
    const stepEls = document.querySelectorAll('.step');
    const sectionEls = document.querySelectorAll('.form-section');

    function nextStep() {
      const currentSection = document.querySelector('.form-section.active');
      const currentStepEl = document.querySelector('.step.active');
      if (!currentSection || !currentStepEl) return;

      const nextSection = currentSection.nextElementSibling;
      const nextStepEl = currentStepEl.nextElementSibling;

      if (nextSection && nextStepEl) {
        currentSection.classList.remove('active');
        currentStepEl.classList.remove('active');
        nextSection.classList.add('active');
        nextStepEl.classList.add('active');
      }
    }

    function prevStep() {
      const currentSection = document.querySelector('.form-section.active');
      const currentStepEl = document.querySelector('.step.active');
      if (!currentSection || !currentStepEl) return;

      const prevSection = currentSection.previousElementSibling;
      const prevStepEl = currentStepEl.previousElementSibling;

      if (prevSection && prevStepEl) {
        currentSection.classList.remove('active');
        currentStepEl.classList.remove('active');
        prevSection.classList.add('active');
        prevStepEl.classList.add('active');
      }
    }

    // Navigation button handlers
    document.querySelectorAll('.nextBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const btnText = btn.textContent.trim().toLowerCase();
        if (btnText === 'next') {
          nextStep();
        }
        // Cancel does nothing for now
      });
    });

    document.querySelectorAll('.prevBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        prevStep();
      });
    });

    sections.forEach(section => {
      // pick only buttons that:
      // - contain <i class="ri-add-line">
      // - or contain the words "add another"
      // and do NOT contain the word "next", "cancel", "back", or "update"
      const addBtns = Array.from(section.querySelectorAll("button")).filter(btn => {
        const hasAddIcon = !!btn.querySelector(".ri-add-line");
        const text = (btn.textContent || "").toLowerCase();
        const isAddBtn = hasAddIcon || text.includes("add another");
        const isNavBtn = /(next|cancel|back|update)/i.test(text);
        return isAddBtn && !isNavBtn;
      });

      addBtns.forEach(addBtn => {
        addBtn.addEventListener("click", (ev) => {
          ev.stopPropagation(); // don't block other handlers
          ev.preventDefault();

          // Collect all fields inside this step
          const rawFields = Array.from(section.querySelectorAll("input, select, textarea"))
            .filter(el => !["button", "submit", "reset"].includes(el.type));

          const entries = [];
          rawFields.forEach(el => {
            let value = "";
            if (el.tagName === "SELECT") {
              const opt = el.options[el.selectedIndex];
              value = opt ? opt.text.trim() : "";
              if (/^select/i.test(value)) value = "";
            } else value = el.value.trim();

            if (!value) return;
            const labelEl = el.closest(".col-12, .col-6, .col-lg-5, .col-lg-7")?.querySelector("label.form-label");
            const label = labelEl ? labelEl.textContent.trim() : "";
            entries.push({ label, value });
          });

          if (entries.length === 0) {
            alert("Please fill out the fields before adding.");
            return;
          }

          // Format summary nicely
          const start = entries.find(e => /start/i.test(e.label));
          const end = entries.find(e => /end/i.test(e.label));
          let summary = "";
          if (start && end) {
            const others = entries.filter(e => e !== start && e !== end).map(e => e.value);
            summary = others.concat(`${start.value} - ${end.value}`).join(", ");
          } else {
            summary = entries.map(e => e.value).join(", ");
          }

          // Create summary box
          const box = document.createElement("div");
          box.className = "input-data-box";
          box.innerHTML = `
            <p>${escapeHtml(summary)}</p>
            <button type="button"><i class="ri-close-large-line"></i></button>
          `;

          const deleteBtn = box.querySelector("button");
          let toRemove = box;

          const displayRow = section.querySelector(".row.mb-4, .row.g-3.mb-4");
          if (displayRow) {
            const colWrapper = document.createElement("div");
            const colClass = displayRow.classList.contains("g-3") ? "col-md-6 col-12" : "col-12";
            colWrapper.className = colClass;
            colWrapper.appendChild(box);
            toRemove = colWrapper;
            displayRow.appendChild(colWrapper);
          } else {
            // Insert before form fields
            const insertTarget = section.querySelector(".row.align-items-start");
            if (insertTarget && insertTarget.parentNode) {
              insertTarget.parentNode.insertBefore(box, insertTarget);
            } else {
              section.insertBefore(box, section.firstChild);
            }
          }

          // Delete handler
          deleteBtn.addEventListener("click", () => toRemove.remove());

          // Clear fields
          rawFields.forEach(el => {
            if (el.tagName === "SELECT") el.selectedIndex = 0;
            else el.value = "";
          });
        });
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]
    );
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", run);
  else run();
})();



 document.addEventListener('DOMContentLoaded', function () {
        const applyButtons = document.querySelectorAll('button[data-job-title]');
        const jobTitleElement = document.getElementById('job-title');

        applyButtons.forEach(button => {
            button.addEventListener('click', function () {
                    const jobTitle = this.getAttribute('data-job-title');
                    jobTitleElement.textContent = jobTitle || 'this post';
            });
        });
    });


    // business logo upload

    const fileInput = document.getElementById('logoUpload');
    const logoPreview = document.getElementById('logoPreview');

    if(fileInput) {
        fileInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
            logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo">`;
            }
            reader.readAsDataURL(file);
        }
        });
    }

    // add time date
document.addEventListener("DOMContentLoaded", () => {
  const addHourBtn = document.getElementById("addHour");
  if (!addHourBtn) return; // safety check

  addHourBtn.addEventListener("click", () => {
    const day = document.getElementById("daySelect").value;
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;
    const fullDay = document.getElementById("fullDay").checked;

    if (!day) {
      alert("Please select a day");
      return;
    }

    let timeText = fullDay ? "Full Day" : `${start || "??"} - ${end || "??"}`;

    const list = document.getElementById("businessHourList");
    const div = document.createElement("div");
    div.classList.add("list-item");

    div.innerHTML = `
      <div class="day-name">${day}</div>
      <div class="time-text">${timeText}</div>
      <button class="remove-btn">&times;</button>
    `;

    div.querySelector(".remove-btn").addEventListener("click", () => {
      div.remove();
    });

    list.appendChild(div);

    // reset inputs
    document.getElementById("daySelect").value = "";
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
    document.getElementById("fullDay").checked = false;
  });
});


// Social Profile inputs add
document.addEventListener("DOMContentLoaded", () => {
  const socialSelect = document.getElementById("socialSelect");
  if (!socialSelect) return; 

  socialSelect.addEventListener("change", () => {
    const platform = socialSelect.value;
    if (!platform) return;

    const list = document.getElementById("socialProfileList");
    const div = document.createElement("div");
    div.classList.add("list-item", "row", "align-items-center", "g-3");

    div.innerHTML = `
      <div class="col-lg-2 col-12 social-name">
        ${platform}
      </div>
      <div class="col-lg-10 col-12 d-flex align-items-center gap-2">
        <input type="text" placeholder="Enter ${platform} URL" class="form-control bg-transparent" />
        <button class="remove-btn">&times;</button>
      </div>
    `;

    div.querySelector(".remove-btn").addEventListener("click", () => {
      div.remove();
    });

    list.appendChild(div);

    socialSelect.value = "";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const membersBtn = document.querySelector(".chat-cover-area .i-btn"); 
  const chatInfo = document.querySelector(".chat-info");
  const closeBtn = document.querySelector(".chat-close-btn");

  if (membersBtn && chatInfo) {
    membersBtn.addEventListener("click", () => {
      chatInfo.classList.toggle("show-chat-info");
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        chatInfo.classList.remove("show-chat-info");
      });
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  new Swiper(".employ-tab-swiper", {
    slidesPerView: "auto",
    spaceBetween: 10,
    freeMode: true,
    navigation: {
      nextEl: ".employ-tab-next",
      prevEl: ".employ-tab-prev",
    },
    
  });
});


document.addEventListener("DOMContentLoaded", () => {
  new Swiper(".business-tab-swiper", {
    slidesPerView: "auto",
    spaceBetween: 10,
    freeMode: true,
    navigation: {
      nextEl: ".business-tab-next",
      prevEl: ".business-tab-prev",
    },
    
  });
});


document.addEventListener("DOMContentLoaded", () => {
  new Swiper(".category-slider", {
    slidesPerView: 1.2,
    spaceBetween: 12,
    navigation: {
      nextEl: ".category-button-next",
      prevEl: ".category-button-prev",
    },
    breakpoints: {
      480: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      991: { slidesPerView: 1 },
      1200: { slidesPerView: 2 },
      1440: { slidesPerView: 4},
      1500: { slidesPerView: 5},
    },
  });
});


document.addEventListener("DOMContentLoaded", () => {
  new Swiper(".candidate-category-slider", {
    slidesPerView: 1.2,
    spaceBetween: 12,
    navigation: {
      nextEl: ".category-button-next",
      prevEl: ".category-button-prev",
    },
    breakpoints: {
      480: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      991: { slidesPerView: 1 },
      1200: { slidesPerView: 2 },
      1440: { slidesPerView: 4},
      1500: { slidesPerView: 5},
    },
  });
});



var swiper = new Swiper(".event-tab-swiper", {
  slidesPerView: "auto",
  spaceBetween: 10,
  centeredSlides: false, 
      navigation: {
      nextEl: ".event-tab-next",
      prevEl: ".event-tab-prev",
    },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
});


 (function($){
    $(function(){
      var map = L.map('map', {
        center: [23.7806365, 90.2792371], 
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

   // Tile layer with beige filter
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        detectRetina: true,
        className: 'beige-map' // <- important
      }).addTo(map);

      function createPinIcon(){
        return L.divIcon({
          className: 'custom-div-icon', 
          html: '<div class="map-pin"></div>',
          iconSize: [26, 26],
          iconAnchor: [13, 26] 
        });
      }

      var marker1 = L.marker([23.772, 90.292], {icon:createPinIcon()}).addTo(map);
      var marker2 = L.marker([23.789, 90.315], {icon:createPinIcon()}).addTo(map);

      marker1.bindPopup("<strong>Location A</strong>").closePopup();
      marker2.bindPopup("<strong>Location B</strong>").closePopup();

      $('#btnZoomIn').on('click', function(e){
        e.preventDefault();
        map.zoomIn();
      });
      $('#btnZoomOut').on('click', function(e){
        e.preventDefault();
        map.zoomOut();
      });

      var mapBox = document.getElementById('mapBox');
      $('#btnFull').on('click', function(){
        if (!document.fullscreenElement) {
          mapBox.requestFullscreen?.();
          $('#mapBox').addClass('is-fullscreen');
        } else {
          document.exitFullscreen?.();
          $('#mapBox').removeClass('is-fullscreen');
        }
      });

      document.addEventListener('fullscreenchange', function(){
        setTimeout(function(){ map.invalidateSize(); }, 250);
      });

      $('#search').on('keydown', function(e){
        if (e.key === 'Enter') {
          e.preventDefault();
          doGeocode($(this).val());
        }
      });

      function doGeocode(query){
        if (!query || !query.trim()) return;
        var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query);
        fetch(url)
          .then(function(r){ return r.json(); })
          .then(function(results){
            if (!results || results.length === 0) {
              alert('No results found');
              return;
            }
            var first = results[0];
            var lat = parseFloat(first.lat), lon = parseFloat(first.lon);
            map.setView([lat, lon], 15, { animate: true });
            var m = L.marker([lat, lon], {icon: createPinIcon()}).addTo(map);
            m.bindPopup(first.display_name).openPopup();
          })
          .catch(function(err){
            console.error(err);
            alert('Search error');
          });
      }

      map.on('click', function(e){
        var m = L.marker(e.latlng, {icon:createPinIcon()}).addTo(map);
        m.bindPopup('Custom pin').openPopup();
      });

      $('#search').on('blur', function(){ $('#map').focus(); });

      setTimeout(function(){ map.invalidateSize(); }, 200);
    });
  })(jQuery);


//   rating

document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll("#reviewModal .star-rating i");
  let rating = 0;

  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      rating = index + 1;

      // update stars
      stars.forEach((s, i) => {
        if (i < rating) {
          s.classList.add("ri-star-fill", "active");
          s.classList.remove("ri-star-line");
        } else {
          s.classList.add("ri-star-line");
          s.classList.remove("ri-star-fill", "active");
        }
      });
    });
  });
});


  const select = document.getElementById('countryPhoneSelect');
  const flag = document.getElementById('flagIcon');

  select.addEventListener('change', function() {
    const selected = select.options[select.selectedIndex];
    const flagSrc = selected.getAttribute('data-flag');
    flag.src = flagSrc;
  });

  // country flag
    const countrySelect = document.getElementById('countrySelect');
  const countryFlag = document.getElementById('countryFlag');

  countrySelect.addEventListener('change', () => {
    const selected = countrySelect.options[countrySelect.selectedIndex];
    const flagSrc = selected.getAttribute('data-flag');
    countryFlag.src = flagSrc;
  });



}())