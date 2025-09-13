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
        series: [{
            name: 'Opportunities',
            data: [
                [1327359600000, 30.95],
                [1327446000000, 31.34],
                [1327532400000, 31.18],
                [1327618800000, 31.05],
                [1327878000000, 31.00],
                [1327964400000, 30.95],
                [1328050800000, 31.24],
                [1328137200000, 31.29],
                [1328223600000, 31.85],
                [1328482800000, 31.86],
                [1328569200000, 32.28],
                [1328655600000, 32.10],
                [1328742000000, 32.65],
                [1328828400000, 32.21],
                [1329087600000, 32.35],
                [1329174000000, 32.44],
                [1329260400000, 32.46],
                [1329346800000, 32.86],
                [1329433200000, 32.75],
                [1329778800000, 32.54],
                [1329865200000, 32.33],
                [1329951600000, 32.97],
                [1330038000000, 33.41],
                [1330297200000, 33.27],
                [1330383600000, 33.27],
                [1330470000000, 32.89],
                [1330556400000, 33.10],
                [1330642800000, 33.73],
                [1330902000000, 33.22],
                [1330988400000, 31.99],
                [1331074800000, 32.41],
                [1331161200000, 33.05],
                [1331247600000, 33.64],
                [1331506800000, 33.56],
                [1331593200000, 34.22],
                [1331679600000, 33.77],
                [1331766000000, 34.17],
                [1331852400000, 33.82],
                [1332111600000, 34.51],
                [1332198000000, 33.16],
                [1332284400000, 33.56],
                [1332370800000, 33.71],
                [1332457200000, 33.81],
                [1332712800000, 34.40],
                [1332799200000, 34.63],
                [1332885600000, 34.46],
                [1332972000000, 34.48],
                [1333058400000, 34.31],
                [1333317600000, 34.70],
                [1333404000000, 34.31],
                [1333490400000, 33.46],
                [1333576800000, 33.59],
                [1333922400000, 33.22],
                [1334008800000, 32.61],
                [1334095200000, 33.01],
                [1334181600000, 33.55],
                [1334268000000, 33.18],
                [1334527200000, 32.84],
                [1334613600000, 33.84],
                [1334700000000, 33.39],
                [1334786400000, 32.91],
                [1334872800000, 33.06],
                [1335132000000, 32.62],
                [1335218400000, 32.40],
                [1335304800000, 33.13],
                [1335391200000, 33.26],
                [1335477600000, 33.58],
                [1335736800000, 33.55],
                [1335823200000, 33.77],
                [1335909600000, 33.76],
                [1335996000000, 33.32],
                [1336082400000, 32.61],
                [1336341600000, 32.52],
                [1336428000000, 32.67],
                [1336514400000, 32.52],
                [1336600800000, 31.92],
                [1336687200000, 32.20],
                [1336946400000, 32.23],
                [1337032800000, 32.33],
                [1337119200000, 32.36],
                [1337205600000, 32.01],
                [1337292000000, 31.31],
                [1337551200000, 32.01],
                [1337637600000, 32.01],
                [1337724000000, 32.18],
                [1337810400000, 31.54],
                [1337896800000, 31.60],
                [1338242400000, 32.05],
                [1338328800000, 31.29],
                [1338415200000, 31.05],
                [1338501600000, 29.82],
                [1338760800000, 30.31],
                [1338847200000, 30.70],
                [1338933600000, 31.69],
                [1339020000000, 31.32],
                [1339106400000, 31.65],
                [1339365600000, 31.13],
                [1339452000000, 31.77],
                [1339538400000, 31.79],
                [1339624800000, 31.67],
                [1339711200000, 32.39],
                [1339970400000, 32.63],
                [1340056800000, 32.89],
                [1340143200000, 31.99],
                [1340229600000, 31.23],
                [1340316000000, 31.57],
                [1340575200000, 30.84],
                [1340661600000, 31.07],
                [1340748000000, 31.41],
                [1340834400000, 31.17],
                [1340920800000, 32.37],
                [1341180000000, 32.19],
                [1341266400000, 32.51],
                [1341439200000, 32.53],
                [1341525600000, 31.37],
                [1341784800000, 30.43],
                [1341871200000, 30.44],
                [1341957600000, 30.20],
                [1342044000000, 30.14],
                [1342130400000, 30.65],
                [1342389600000, 30.40],
                [1342476000000, 30.65],
                [1342562400000, 31.43],
                [1342648800000, 31.89],
                [1342735200000, 31.38],
                [1342994400000, 30.64],
                [1343080800000, 30.02],
                [1343167200000, 30.33],
                [1343253600000, 30.95],
                [1343340000000, 31.89],
                [1343599200000, 31.01],
                [1343685600000, 30.88],
                [1343772000000, 30.69],
                [1343858400000, 30.58],
                [1343944800000, 32.02],
                [1344204000000, 32.14],
                [1344290400000, 32.37],
                [1344376800000, 32.51],
                [1344463200000, 32.65],
                [1344549600000, 32.64],
                [1344808800000, 32.27],
                [1344895200000, 32.10],
                [1344981600000, 32.91],
                [1345068000000, 33.65],
                [1345154400000, 33.80],
                [1345413600000, 33.92],
                [1345500000000, 33.75],
                [1345586400000, 33.84],
                [1345672800000, 33.50],
                [1345759200000, 32.26],
                [1346018400000, 32.32],
                [1346104800000, 32.06],
                [1346191200000, 31.96],
                [1346277600000, 31.46],
                [1346364000000, 31.27],
                [1346709600000, 31.43],
                [1346796000000, 32.26],
                [1346882400000, 32.79],
                [1346968800000, 32.46],
                [1347228000000, 32.13],
                [1347314400000, 32.43],
                [1347400800000, 32.42],
                [1347487200000, 32.81],
                [1347573600000, 33.34],
                [1347832800000, 33.41],
                [1347919200000, 32.57],
                [1348005600000, 33.12],
                [1348092000000, 34.53],
                [1348178400000, 33.83],
                [1348437600000, 33.41],
                [1348524000000, 32.90],
                [1348610400000, 32.53],
                [1348696800000, 32.80],
                [1348783200000, 32.44],
                [1349042400000, 32.62],
                [1349128800000, 32.57],
                [1349215200000, 32.60],
                [1349301600000, 32.68],
                [1349388000000, 32.47],
                [1349647200000, 32.23],
                [1349733600000, 31.68],
                [1349820000000, 31.51],
                [1349906400000, 31.78],
                [1349992800000, 31.94],
                [1350252000000, 32.33],
                [1350338400000, 33.24],
                [1350424800000, 33.44],
                [1350511200000, 33.48],
                [1350597600000, 33.24],
                [1350856800000, 33.49],
                [1350943200000, 33.31],
                [1351029600000, 33.36],
                [1351116000000, 33.40],
                [1351202400000, 34.01],
                [1351638000000, 34.02],
                [1351724400000, 34.36],
                [1351810800000, 34.39],
                [1352070000000, 34.24],
                [1352156400000, 34.39],
                [1352242800000, 33.47],
                [1352329200000, 32.98],
                [1352415600000, 32.90],
                [1352674800000, 32.70],
                [1352761200000, 32.54],
                [1352847600000, 32.23],
                [1352934000000, 32.64],
                [1353020400000, 32.65],
                [1353279600000, 32.92],
                [1353366000000, 32.64],
                [1353452400000, 32.84],
                [1353625200000, 33.40],
                [1353884400000, 33.30],
                [1353970800000, 33.18],
                [1354057200000, 33.88],
                [1354143600000, 34.09],
                [1354230000000, 34.61],
                [1354489200000, 34.70],
                [1354575600000, 35.30],
                [1354662000000, 35.40],
                [1354748400000, 35.14],
                [1354834800000, 35.48],
                [1355094000000, 35.75],
                [1355180400000, 35.54],
                [1355266800000, 35.96],
                [1355353200000, 35.53],
                [1355439600000, 37.56],
                [1355698800000, 37.42],
                [1355785200000, 37.49],
                [1355871600000, 38.09],
                [1355958000000, 37.87],
                [1356044400000, 37.71],
                [1356303600000, 37.53],
                [1356476400000, 37.55],
                [1356562800000, 37.30],
                [1356649200000, 36.90],
                [1356908400000, 37.68],
                [1357081200000, 38.34],
                [1357167600000, 37.75],
                [1357254000000, 38.13],
                [1357513200000, 37.94],
                [1357599600000, 38.14],
                [1357686000000, 38.66],
                [1357772400000, 38.62],
                [1357858800000, 38.09],
                [1358118000000, 38.16],
                [1358204400000, 38.15],
                [1358290800000, 37.88],
                [1358377200000, 37.73],
                [1358463600000, 37.98],
                [1358809200000, 37.95],
                [1358895600000, 38.25],
                [1358982000000, 38.10],
                [1359068400000, 38.32],
                [1359327600000, 38.24],
                [1359414000000, 38.52],
                [1359500400000, 37.94],
                [1359586800000, 37.83],
                [1359673200000, 38.34],
                [1359932400000, 38.10],
                [1360018800000, 38.51],
                [1360105200000, 38.40],
                [1360191600000, 38.07],
                [1360278000000, 39.12],
                [1360537200000, 38.64],
                [1360623600000, 38.89],
                [1360710000000, 38.81],
                [1360796400000, 38.61],
                [1360882800000, 38.63],
                [1361228400000, 38.99],
                [1361314800000, 38.77],
                [1361401200000, 38.34],
                [1361487600000, 38.55],
                [1361746800000, 38.11],
                [1361833200000, 38.59],
                [1361919600000, 39.60],
            ]
        }],
        chart: {
            id: 'area-datetime',
            type: 'area',
            height: 250,
            toolbar: {
                show: false,
            },
            zoom: {
                autoScaleYaxis: true
            }
        },
        stroke: {
            width: 2,
            colors: ['#C18544']
        },
        colors: ['#C18544'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                gradientToColors: ['#86562B'],
                opacityFrom: 0.7,
                opacityTo: 0.1,
                stops: [0, 100]
            }
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 0,
            style: 'hollow',

        },
        xaxis: {
            type: 'datetime',
            min: new Date('01 Mar 2012').getTime(),
            tickAmount: 6
        },
        tooltip: {
            x: {
                format: 'dd MMM yyyy'
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
        const priceHistogramCanvas = document.getElementById('priceHistogram');
        if (!priceHistogramCanvas) return; // exit if canvas not found

        const ctx = priceHistogramCanvas.getContext('2d');
        if (!ctx) {
            console.error('Canvas context not supported');
            return;
        }

        // Initialize the slider
        const priceSlider = document.getElementById('priceSlider');
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

        // Generate data with a normal distribution
        function generateNormalData(count, mean, stdDev, minValue, maxValue) {
            const data = [];
            for (let i = 0; i < count; i++) {
                let value;
                do {
                    const u1 = Math.random();
                    const u2 = Math.random();
                    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                    value = mean + z * stdDev;
                } while (value < minValue || value > maxValue);
                data.push(value);
            }
            return data;
        }

        const binCount = 42;
        const minValue = 100;
        const maxValue = 500;
        const mean = 300;
        const stdDev = 80;

        const rawData = generateNormalData(1000, mean, stdDev, minValue, maxValue);
        const histogramData = Array(binCount).fill(0);
        const binWidth = (maxValue - minValue) / binCount;

        for (let i = 0; i < rawData.length; i++) {
            const value = rawData[i];
            const binIndex = Math.floor((value - minValue) / binWidth);
            histogramData[Math.min(binIndex, binCount - 1)]++;
        }

        // Draw Area Chart
        function drawAreaChart(minPrice, maxPrice) {
            ctx.clearRect(0, 0, priceHistogramCanvas.width, priceHistogramCanvas.height);

            const pointSpacing = priceHistogramCanvas.width / (binCount - 1);
            const maxY = Math.max(...histogramData);

            const minBinIndex = Math.max(0, Math.floor((minPrice - minValue) / binWidth));
            const maxBinIndex = Math.min(binCount - 1, Math.floor((maxPrice - minValue) / binWidth));

            // Background histogram
            ctx.beginPath();
            ctx.moveTo(0, priceHistogramCanvas.height);
            for (let i = 0; i < histogramData.length; i++) {
                const x = i * pointSpacing;
                const y = priceHistogramCanvas.height - (histogramData[i] / maxY) * priceHistogramCanvas.height;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(priceHistogramCanvas.width, priceHistogramCanvas.height);
            ctx.closePath();

            const bgGradient = ctx.createLinearGradient(0, 0, 0, priceHistogramCanvas.height);
            bgGradient.addColorStop(0, 'rgba(41, 44, 45, 0.3)');
            bgGradient.addColorStop(1, 'rgba(41, 44, 45, 0)');
            ctx.fillStyle = bgGradient;
            ctx.fill();

            // Selected range
            ctx.beginPath();
            ctx.moveTo(minBinIndex * pointSpacing, priceHistogramCanvas.height);
            for (let i = minBinIndex; i <= maxBinIndex; i++) {
                const x = i * pointSpacing;
                const y = priceHistogramCanvas.height - (histogramData[i] / maxY) * priceHistogramCanvas.height;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(maxBinIndex * pointSpacing, priceHistogramCanvas.height);
            ctx.closePath();

            const fgGradient = ctx.createLinearGradient(0, 0, 0, priceHistogramCanvas.height);
            fgGradient.addColorStop(0, '#86562B');
            fgGradient.addColorStop(1, '#86562B');
            ctx.fillStyle = fgGradient;
            ctx.fill();

            ctx.beginPath();
            for (let i = minBinIndex; i <= maxBinIndex; i++) {
                const x = i * pointSpacing;
                const y = priceHistogramCanvas.height - (histogramData[i] / maxY) * priceHistogramCanvas.height;
                if (i === minBinIndex) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = '#86562B';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        function updateChart() {
            const [minPrice, maxPrice] = priceSlider.noUiSlider.get().map(Number);
            document.getElementById('minPriceInput').value = Math.round(minPrice);
            document.getElementById('maxPriceInput').value = Math.round(maxPrice);
            drawAreaChart(minPrice, maxPrice);
        }

        priceSlider.noUiSlider.on('update', updateChart);

        document.getElementById('minPriceInput').addEventListener('change', function () {
            let minPrice = parseInt(this.value);
            const maxPrice = parseInt(document.getElementById('maxPriceInput').value);

            if (isNaN(minPrice) || minPrice < 100) minPrice = 100;
            if (minPrice >= maxPrice) minPrice = maxPrice - 1;
            if (minPrice > 500) minPrice = 499;

            this.value = minPrice;
            priceSlider.noUiSlider.set([minPrice, null]);
        });

        document.getElementById('maxPriceInput').addEventListener('change', function () {
            let maxPrice = parseInt(this.value);
            const minPrice = parseInt(document.getElementById('minPriceInput').value);

            if (isNaN(maxPrice) || maxPrice > 500) maxPrice = 500;
            if (maxPrice <= minPrice) maxPrice = minPrice + 1;
            if (maxPrice < 100) maxPrice = 101;

            this.value = maxPrice;
            priceSlider.noUiSlider.set([null, maxPrice]);
        });

        updateChart();
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
    let currentStep = 0;
    const formSections = document.querySelectorAll(".form-section");
    const steps = document.querySelectorAll(".step");

    function showStep(index) {
        formSections.forEach((section, i) => {
            section.classList.toggle("active", i === index);
            if (steps[i]) {
                steps[i].classList.toggle("active", i <= index);
                steps[i].classList.toggle("completed", i < index);
            }
        });
        currentStep = index;
    }

    function nextStep() {
        if (currentStep < formSections.length - 1) {
            showStep(currentStep + 1);
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        }
    }

    document.querySelectorAll(".nextBtn").forEach(btn => {
        btn.addEventListener("click", nextStep);
    });

    document.querySelectorAll(".prevBtn").forEach(btn => {
        btn.addEventListener("click", prevStep);
    });

    // document.getElementById("multiStepForm").addEventListener("submit", (e) => {
    //     e.preventDefault();
    //     alert("Form submitted!");
    // });

    showStep(currentStep);


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

}())