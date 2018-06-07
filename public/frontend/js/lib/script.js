//misc functions
function watermarkEnter(obj, wm) {
    if (obj.value == wm) {
        obj.value = '';
        obj.style.color = '';
        obj.select();
    }
}

function watermarkLeave(obj, wm) {
    if (obj.value == '') {
        obj.value = wm;
    }
}

function trackUserLocation(location) {
    if (location == null) {
        return;
    }
}

function Get_Cookie(check_name) {
    var a_all_cookies = document.cookie.split(';');
    var a_temp_cookie = '';
    var cookie_name = '';
    var cookie_value = '';
    var b_cookie_found = false;
    var i = '';
    for (i = 0; i < a_all_cookies.length; i++) {
        a_temp_cookie = a_all_cookies[i].split('=');
        cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
        if (cookie_name == check_name) {
            b_cookie_found = true;
            if (a_temp_cookie.length > 1) {
                cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
            }
            return cookie_value;
            break;
        }
        a_temp_cookie = null;
        cookie_name = '';
    }
    if (!b_cookie_found) {
        return null;
    }
}

function Set_Cookie(name, value, expires, path, domain, secure) {
    var today = new Date();
    today.setTime(today.getTime());
    if (expires) {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date(today.getTime() + (expires));
    document.cookie = name + "=" + escape(value) +
            ((expires) ? ";expires=" + expires_date.toGMTString() : "") +
            ((path) ? ";path=" + path : "") +
            ((domain) ? ";domain=" + domain : "") +
            ((secure) ? ";secure" : "");
}

function Delete_Cookie(name, path, domain) {
    if (Get_Cookie(name))
        document.cookie = name + "=" +
                ((path) ? ";path=" + path : "") +
                ((domain) ? ";domain=" + domain : "") + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}
/* page exit prompt */
var exitThisPagePrompt = 'Are you sure you want to leave this page?';
var alreadySetExitPrompt = false;
var requireExitPrompt = false;
var contentDidChange = false;

function goodbye(e) {
    if (!requireExitPrompt) {
        return;
    }
    if (!contentDidChange) {
        return;
    }
    return exitThisPagePrompt;
}

function hookupGoodbyePrompt(message) {
    contentDidChange = true;
    if ((!alreadySetExitPrompt) && (requireExitPrompt)) {
        exitThisPagePrompt = message;
        alreadySetExitPrompt = true;
        window.onbeforeunload = goodbye;
    }
}

function unHookGoodbyePrompt() {
    requireExitPrompt = false;
}

;
/*! Lazy Load 1.9.7 - MIT license - Copyright 2010-2015 Mika Tuupola */
!function (t, e, o, r) {
    var n = t(e);
    t.fn.lazyload = function (o) {
        var i, a = this,
                f = {
                    threshold: 0,
                    failure_limit: 0,
                    event: "scroll.lazyload",
                    effect: "show",
                    container: e,
                    data_attribute: "original",
                    data_srcset: "srcset",
                    skip_invisible: !1,
                    appear: null,
                    load: null,
                    placeholder: "data:image/gif;base64,R0lGODdhAQABAPAAAMPDwwAAACwAAAAAAQABAAACAkQBADs="
                };

        function l() {
            var e = 0;
            a.each(function () {
                var o = t(this);
                if (!f.skip_invisible || o.is(":visible"))
                    if (t.abovethetop(this, f) || t.leftofbegin(this, f))
                        ;
                    else if (t.belowthefold(this, f) || t.rightoffold(this, f)) {
                        if (++e > f.failure_limit)
                            return !1
                    } else
                        o.trigger("appear"), e = 0
            })
        }
        return o && (r !== o.failurelimit && (o.failure_limit = o.failurelimit, delete o.failurelimit), r !== o.effectspeed && (o.effect_speed = o.effectspeed, delete o.effectspeed), t.extend(f, o)), i = f.container === r || f.container === e ? n : t(f.container), 0 === f.event.indexOf("scroll") && i.off(f.event).on(f.event, function () {
            return l()
        }), this.each(function () {
            var e = this,
                    o = t(e);
            e.loaded = !1, o.attr("src") !== r && !1 !== o.attr("src") || o.is("img") && o.attr("src", f.placeholder), o.one("appear", function () {
                if (!this.loaded) {
                    if (f.appear) {
                        var r = a.length;
                        f.appear.call(e, r, f)
                    }
                    t("<img />").one("load", function () {
                        var r = o.attr("data-" + f.data_attribute),
                                n = o.attr("data-" + f.data_srcset);
                        r != o.attr("src") && (o.hide(), o.is("img") && (o.attr("src", r), null != n && o.attr("srcset", n)), o.is("video") && o.attr("poster", r), o[f.effect](f.effect_speed)), e.loaded = !0;
                        var i = t.grep(a, function (t) {
                            return !t.loaded
                        });
                        if (a = t(i), f.load) {
                            var l = a.length;
                            f.load.call(e, l, f)
                        }
                    }).attr({
                        src: o.attr("data-" + f.data_attribute),
                        srcset: o.attr("data-" + f.data_srcset) || ""
                    }).error(function () {
                        var t = o.attr("data-" + f.data_attribute);
                        t.search("bp.blogspot.com") > 0 && t.search("focus-opensocial.googleusercontent") <= 0 && (t = "https://images2-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&gadget=a&no_expand=1&resize_h=0&rewriteMime=image%2F*&url=" + encodeURIComponent(t), o.attr("src", t))
                    })
                }
            }), 0 !== f.event.indexOf("scroll") && o.off(f.event).on(f.event, function () {
                e.loaded || o.trigger("appear")
            })
        }), n.off("resize.lazyload").bind("resize.lazyload", function () {
            l()
        }), /(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion) && n.on("pageshow", function (e) {
            e.originalEvent && e.originalEvent.persisted && a.each(function () {
                t(this).trigger("appear")
            })
        }), t(function () {
            l()
        }), this
    }, t.belowthefold = function (o, i) {
        return (i.container === r || i.container === e ? (e.innerHeight ? e.innerHeight : n.height()) + n.scrollTop() : t(i.container).offset().top + t(i.container).height()) <= t(o).offset().top - i.threshold
    }, t.rightoffold = function (o, i) {
        return (i.container === r || i.container === e ? n.width() + n.scrollLeft() : t(i.container).offset().left + t(i.container).width()) <= t(o).offset().left - i.threshold
    }, t.abovethetop = function (o, i) {
        return (i.container === r || i.container === e ? n.scrollTop() : t(i.container).offset().top) >= t(o).offset().top + i.threshold + t(o).height()
    }, t.leftofbegin = function (o, i) {
        return (i.container === r || i.container === e ? n.scrollLeft() : t(i.container).offset().left) >= t(o).offset().left + i.threshold + t(o).width()
    }, t.inviewport = function (e, o) {
        return !(t.rightoffold(e, o) || t.leftofbegin(e, o) || t.belowthefold(e, o) || t.abovethetop(e, o))
    }, t.extend(t.expr[":"], {
        "below-the-fold": function (e) {
            return t.belowthefold(e, {
                threshold: 0
            })
        },
        "above-the-top": function (e) {
            return !t.belowthefold(e, {
                threshold: 0
            })
        },
        "right-of-screen": function (e) {
            return t.rightoffold(e, {
                threshold: 0
            })
        },
        "left-of-screen": function (e) {
            return !t.rightoffold(e, {
                threshold: 0
            })
        },
        "in-viewport": function (e) {
            return t.inviewport(e, {
                threshold: 0
            })
        },
        "above-the-fold": function (e) {
            return !t.belowthefold(e, {
                threshold: 0
            })
        },
        "right-of-fold": function (e) {
            return t.rightoffold(e, {
                threshold: 0
            })
        },
        "left-of-fold": function (e) {
            return !t.rightoffold(e, {
                threshold: 0
            })
        }
    })
}(jQuery, window, document);
/*
 * ScrollToFixed
 * https://github.com/bigspotteddog/ScrollToFixed
 *
 * Copyright (c) 2011 Joseph Cava-Lynch
 * MIT license
 */
(function (a) {
    a.isScrollToFixed = function (b) {
        return !!a(b).data("ScrollToFixed")
    };
    a.ScrollToFixed = function (d, i) {
        var m = this;
        m.$el = a(d);
        m.el = d;
        m.$el.data("ScrollToFixed", m);
        var c = false;
        var H = m.$el;
        var I;
        var F;
        var k;
        var e;
        var z;
        var E = 0;
        var r = 0;
        var j = -1;
        var f = -1;
        var u = null;
        var A;
        var g;

        function v() {
            H.trigger("preUnfixed.ScrollToFixed");
            l();
            H.trigger("unfixed.ScrollToFixed");
            f = -1;
            E = H.offset().top;
            r = H.offset().left;
            if (m.options.offsets) {
                r += (H.offset().left - H.position().left)
            }
            if (j == -1) {
                j = r
            }
            I = H.css("position");
            c = true;
            if (m.options.bottom != -1) {
                H.trigger("preFixed.ScrollToFixed");
                x();
                H.trigger("fixed.ScrollToFixed")
            }
        }

        function o() {
            var J = m.options.limit;
            if (!J) {
                return 0
            }
            if (typeof (J) === "function") {
                return J.apply(H)
            }
            return J
        }

        function q() {
            return I === "fixed"
        }

        function y() {
            return I === "absolute"
        }

        function h() {
            return !(q() || y())
        }

        function x() {
            if (!q()) {
                var J = H[0].getBoundingClientRect();
                u.css({
                    display: H.css("display"),
                    width: J.width,
                    height: J.height,
                    "float": H.css("float")
                });
                cssOptions = {
                    "z-index": m.options.zIndex,
                    position: "fixed",
                    top: m.options.bottom == -1 ? t() : "",
                    bottom: m.options.bottom == -1 ? "" : m.options.bottom,
                    "margin-left": "0px"
                };
                if (!m.options.dontSetWidth) {
                    cssOptions.width = H.css("width")
                }
                H.css(cssOptions);
                H.addClass(m.options.baseClassName);
                if (m.options.className) {
                    H.addClass(m.options.className)
                }
                I = "fixed"
            }
        }

        function b() {
            var K = o();
            var J = r;
            if (m.options.removeOffsets) {
                J = "";
                K = K - E
            }
            cssOptions = {
                position: "absolute",
                top: K,
                left: J,
                "margin-left": "0px",
                bottom: ""
            };
            if (!m.options.dontSetWidth) {
                cssOptions.width = H.css("width")
            }
            H.css(cssOptions);
            I = "absolute"
        }

        function l() {
            if (!h()) {
                f = -1;
                u.css("display", "none");
                H.css({
                    "z-index": z,
                    width: "",
                    position: F,
                    left: "",
                    top: e,
                    "margin-left": ""
                });
                H.removeClass("scroll-to-fixed-fixed");
                if (m.options.className) {
                    H.removeClass(m.options.className)
                }
                I = null
            }
        }

        function w(J) {
            if (J != f) {
                H.css("left", r - J);
                f = J
            }
        }

        function t() {
            var J = m.options.marginTop;
            if (!J) {
                return 0
            }
            if (typeof (J) === "function") {
                return J.apply(H)
            }
            return J
        }

        function B() {
            if (!a.isScrollToFixed(H) || H.is(":hidden")) {
                return
            }
            var M = c;
            var L = h();
            if (!c) {
                v()
            } else {
                if (h()) {
                    E = H.offset().top;
                    r = H.offset().left
                }
            }
            var J = a(window).scrollLeft();
            var N = a(window).scrollTop();
            var K = o();
            if (m.options.minWidth && a(window).width() < m.options.minWidth) {
                if (!h() || !M) {
                    p();
                    H.trigger("preUnfixed.ScrollToFixed");
                    l();
                    H.trigger("unfixed.ScrollToFixed")
                }
            } else {
                if (m.options.maxWidth && a(window).width() > m.options.maxWidth) {
                    if (!h() || !M) {
                        p();
                        H.trigger("preUnfixed.ScrollToFixed");
                        l();
                        H.trigger("unfixed.ScrollToFixed")
                    }
                } else {
                    if (m.options.bottom == -1) {
                        if (K > 0 && N >= K - t()) {
                            if (!L && (!y() || !M)) {
                                p();
                                H.trigger("preAbsolute.ScrollToFixed");
                                b();
                                H.trigger("unfixed.ScrollToFixed")
                            }
                        } else {
                            if (N >= E - t()) {
                                if (!q() || !M) {
                                    p();
                                    H.trigger("preFixed.ScrollToFixed");
                                    x();
                                    f = -1;
                                    H.trigger("fixed.ScrollToFixed")
                                }
                                w(J)
                            } else {
                                if (!h() || !M) {
                                    p();
                                    H.trigger("preUnfixed.ScrollToFixed");
                                    l();
                                    H.trigger("unfixed.ScrollToFixed")
                                }
                            }
                        }
                    } else {
                        if (K > 0) {
                            if (N + a(window).height() - H.outerHeight(true) >= K - (t() || -n())) {
                                if (q()) {
                                    p();
                                    H.trigger("preUnfixed.ScrollToFixed");
                                    if (F === "absolute") {
                                        b()
                                    } else {
                                        l()
                                    }
                                    H.trigger("unfixed.ScrollToFixed")
                                }
                            } else {
                                if (!q()) {
                                    p();
                                    H.trigger("preFixed.ScrollToFixed");
                                    x()
                                }
                                w(J);
                                H.trigger("fixed.ScrollToFixed")
                            }
                        } else {
                            w(J)
                        }
                    }
                }
            }
        }

        function n() {
            if (!m.options.bottom) {
                return 0
            }
            return m.options.bottom
        }

        function p() {
            var J = H.css("position");
            if (J == "absolute") {
                H.trigger("postAbsolute.ScrollToFixed")
            } else {
                if (J == "fixed") {
                    H.trigger("postFixed.ScrollToFixed")
                } else {
                    H.trigger("postUnfixed.ScrollToFixed")
                }
            }
        }
        var D = function (J) {
            if (H.is(":visible")) {
                c = false;
                B()
            }
        };
        var G = function (J) {
            (!!window.requestAnimationFrame) ? requestAnimationFrame(B) : B()
        };
        var C = function () {
            var K = document.body;
            if (document.createElement && K && K.appendChild && K.removeChild) {
                var M = document.createElement("div");
                if (!M.getBoundingClientRect) {
                    return null
                }
                M.innerHTML = "x";
                M.style.cssText = "position:fixed;top:100px;";
                K.appendChild(M);
                var N = K.style.height,
                        O = K.scrollTop;
                K.style.height = "3000px";
                K.scrollTop = 500;
                var J = M.getBoundingClientRect().top;
                K.style.height = N;
                var L = (J === 100);
                K.removeChild(M);
                K.scrollTop = O;
                return L
            }
            return null
        };
        var s = function (J) {
            J = J || window.event;
            if (J.preventDefault) {
                J.preventDefault()
            }
            J.returnValue = false
        };
        m.init = function () {
            m.options = a.extend({}, a.ScrollToFixed.defaultOptions, i);
            z = H.css("z-index");
            m.$el.css("z-index", m.options.zIndex);
            u = a("<div />");
            I = H.css("position");
            F = H.css("position");
            k = H.css("float");
            e = H.css("top");
            if (h()) {
                m.$el.after(u)
            }
            a(window).bind("resize.ScrollToFixed", D);
            a(window).bind("scroll.ScrollToFixed", G);
            if ("ontouchmove" in window) {
                a(window).bind("touchmove.ScrollToFixed", B)
            }
            if (m.options.preFixed) {
                H.bind("preFixed.ScrollToFixed", m.options.preFixed)
            }
            if (m.options.postFixed) {
                H.bind("postFixed.ScrollToFixed", m.options.postFixed)
            }
            if (m.options.preUnfixed) {
                H.bind("preUnfixed.ScrollToFixed", m.options.preUnfixed)
            }
            if (m.options.postUnfixed) {
                H.bind("postUnfixed.ScrollToFixed", m.options.postUnfixed)
            }
            if (m.options.preAbsolute) {
                H.bind("preAbsolute.ScrollToFixed", m.options.preAbsolute)
            }
            if (m.options.postAbsolute) {
                H.bind("postAbsolute.ScrollToFixed", m.options.postAbsolute)
            }
            if (m.options.fixed) {
                H.bind("fixed.ScrollToFixed", m.options.fixed)
            }
            if (m.options.unfixed) {
                H.bind("unfixed.ScrollToFixed", m.options.unfixed)
            }
            if (m.options.spacerClass) {
                u.addClass(m.options.spacerClass)
            }
            H.bind("resize.ScrollToFixed", function () {
                u.height(H.height())
            });
            H.bind("scroll.ScrollToFixed", function () {
                H.trigger("preUnfixed.ScrollToFixed");
                l();
                H.trigger("unfixed.ScrollToFixed");
                B()
            });
            H.bind("detach.ScrollToFixed", function (J) {
                s(J);
                H.trigger("preUnfixed.ScrollToFixed");
                l();
                H.trigger("unfixed.ScrollToFixed");
                a(window).unbind("resize.ScrollToFixed", D);
                a(window).unbind("scroll.ScrollToFixed", G);
                H.unbind(".ScrollToFixed");
                u.remove();
                m.$el.removeData("ScrollToFixed")
            });
            D()
        };
        m.init()
    };
    a.ScrollToFixed.defaultOptions = {
        marginTop: 0,
        limit: 0,
        bottom: -1,
        zIndex: 1000,
        baseClassName: "scroll-to-fixed-fixed"
    };
    a.fn.scrollToFixed = function (b) {
        return this.each(function () {
            (new a.ScrollToFixed(this, b))
        })
    }
})(jQuery);

;

function HideMenuToolbar() {
    $("#toolbar").fadeOut();
    $("#toolbarbut").fadeIn("slow");
}

function ShowMenuToolbar() {
    $("#toolbar").fadeIn();
    $("#toolbarbut").fadeOut("slow");
}

$(document).ready(function () {
    $("span.downarr a").click(function () {
        HideMenuToolbar();
        Set_Cookie('openstate', 'closed', 1, '/')
    });
    $("span.showbar a").click(function () {
        ShowMenuToolbar();
        Set_Cookie('openstate', 'open', 1, '/')
    });
    $("span.downarr a, span.showbar a").click(function () {
        return false;
    });
    var openState = Get_Cookie('openstate');
    if (openState != null) {
        if (openState == 'closed') {
            HideMenuToolbar();
        }
        if (openState == 'open') {
            ShowMenuToolbar();
        }
    }

    // hide #back-to-top first
    $("#back-to-top").hide();
    $(function () {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('#back-to-top').fadeIn();
            } else {
                $('#back-to-top').fadeOut();
            }
        });
        // scroll body to 0px on click
        $('#back-to-top').click(function () {
            $('body,html').animate({
                scrollTop: 0
            }, 800);
            return false;
        });
    });

    // Global parameters
    var wWidth = window.innerWidth;



    
    var isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    var isMobileDevice = isMobile.any();

    $(".navbar-nav>li,.nav-account>li").hover(
            function () {
                if ($(this).parent().hasClass('main-menu'))
                    $(".navbar-nav > li.active").removeClass('active').addClass('curr');
                $(this).addClass("open");
            },
            function () {
                if ($(this).parent().hasClass('main-menu'))
                    $(".navbar-nav > li.curr").removeClass('curr').addClass('active');
                $(this).removeClass("open");
            }
    );
    if (isMobileDevice) {
        $(".main-menu>li.dropdown>a,.nav-account>li.dropdown>a").click(function () {

            if ($(this).parent().hasClass('open')) {
                $("li.dropdown.open").removeClass('open');
            } else {
                $("li.dropdown.open").removeClass('open');
                $(this).parent().addClass('open');
            }

            return false;
        })
    }

    $('.megamenu ul li a').hover(
            function () {
                $('.megamenu p').addClass('separator').text($(this).attr('data-title'));
            },
            function () {
                $('.megamenu p').removeClass('separator').text('');
            }
    );

    $('.navbar-toggle').click(function () {
        if (!$('body').hasClass('menu-open')) {
            $('body').addClass('menu-open');
            $(this).find('.fa').removeClass('fa-bars').addClass('fa-times');
        } else {
            $('body').removeClass('menu-open');
            $(this).find('.fa').removeClass('fa-times').addClass('fa-bars');
        }
    });

    $('.search-button-icon').click(function () {
        $('.navbar-toggle').trigger('click');
        $('.navbar-collapse .searchinput').focus();
    });

    $('.navbar-collapse .searchinput').focus(function () {
        window.scrollTo(0, 0);
    })

    if (isMobileDevice) {
        $('.facebook-like .tip').addClass('hidden');
    }

    try {
        if (top.location.hostname != self.location.hostname)
            throw 1;
    } catch (e) {
        top.location.href = self.location.href;
    }

    if ($('.items-slide').length) {
        //,.comic-detail .detail-info .col-image img,.new-comments li p img,.journalItems .journalitem .summary img
        $('img.lazyOwl').error(function () {
            var imgSrc = $(this).attr("src");
            if (imgSrc.search("bp.blogspot.com") > 0 && imgSrc.search("focus-opensocial.googleusercontent") <= 0) {
                imgSrc = proxyServer + encodeURIComponent(imgSrc);
                $(this).attr("src", imgSrc);
            }
        });

        var owl = $(".items-slide .owl-carousel");
        owl.owlCarousel({
            lazyLoad: true,
            autoPlay: 5000,
            stopOnHover: true,
            slideSpeed: 300,
            paginationSpeed: 800,
            itemsCustom: [
                [0, 1],
                [360, 2],
                [480, 3],
                [768, 4],
                [992, 5]
            ]
        });
        $(".items-slide .next").click(function () {
            owl.trigger('owl.next');
            return false;
        })
        $(".items-slide .prev").click(function () {
            owl.trigger('owl.prev');
            return false;
        })
    }

    // lazyload
    initLazyload();

    if (!isMobileDevice)
        loadTooltip();

    function loadTooltip() {
        // http://www.alessioatzeni.com/blog/simple-tooltip-with-jquery-only-text/
        $('.jtip').hover(function () {
            // Hover over code
            var tipContents = $($(this).data('jtip'));
            if (!tipContents.length)
                return false;

            tipContents.find('.box_img img').attr('src', tipContents.find('.box_img img').attr('data-original'));
            $('<div id="cluetip"></div>').html(tipContents.html()).appendTo('body').fadeIn("300");
        }, function () {
            // Hover out code
            $('#cluetip').remove();
        }).mousemove(function (e) {
            var mousex = e.pageX + 20; //Get X coordinates
            var mousey = e.pageY + 10; //Get Y coordinates
            $('#cluetip').css({
                top: mousey,
                left: mousex
            })
        });
    }


    //scrollToFixed
    var elementScrollToFixed;
    var elementShowOnUp;
    if (!$('body').hasClass('chapter-detail')) {
        if (wWidth >= 768) {
            elementScrollToFixed = $('.main-nav');
            elementShowOnUp = $('.main-nav');
        } else
            elementScrollToFixed = $('.header');
    } else {
        elementScrollToFixed = $('.chapter-nav');
        elementShowOnUp = $('.chapter-nav');
    }

    elementScrollToFixed.scrollToFixed({
        preFixed: function () {
            $('.floatads').addClass('scroll-to-fixed-fixed');
        },
        preUnfixed: function () {
            $('.floatads').removeClass('scroll-to-fixed-fixed');
        }
    });
    


    //User page
    $('.user-sidebar .fa').click(function () {
        if ($(this).hasClass('fa-angle-down')) {
            $('.user-sidelink').addClass('hidden');
            $(this).removeClass('active').removeClass('fa-angle-down').addClass('fa-angle-up');
        } else {
            $('.user-sidelink').removeClass('hidden');
            $(this).addClass('active').removeClass('fa-angle-up').addClass('fa-angle-down');
        }
    });
    if (wWidth < 768)
        $('.user-sidebar .fa').trigger('click');

    $('.list-chapter .view-more').click(function () {
        $('.list-chapter ul li.less').addClass('active');
        $(this).remove();
        return false;
    });

    if ($('.dropdown-genres').length)
        $('.dropdown-genres').insertAfter($('.comic-filter h1'));

    $('.nav-tabs li a').click(function (e) {
        $('.nav-tabs li').removeClass('active');
        $(this).parent().addClass('active');
        $('.tab-content .tab-pane').removeClass('in active');
        $($(this).attr('href')).addClass('in active');

        return false;
    });

    

   
});


function initLazyload() {
    $("img.lazy").lazyload({
        effect: "fadeIn",
        effectspeed: 300,
        failure_limit: 999,
        threshold: 50
    });
}
