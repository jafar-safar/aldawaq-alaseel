$(document).ready(function () {
    $("#order-form-section").hide();
});

function getFieldErrorElement(fieldId) {
    var $field = $("#" + fieldId);
    var $error = $field.closest(".form-group").find(".error-msg").first();

    if (!$error.length) {
        $error = $field.siblings(".error-msg").first();
    }

    return $error;
}

function setFieldError(fieldId, shouldShow) {
    var $error = getFieldErrorElement(fieldId);

    if ($error.length) {
        if (shouldShow) {
            $error.show();
        } else {
            $error.hide();
        }
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getDetailsTrigger(mealId) {
    var $trigger = $("#toggle-" + mealId)
        .add("#show-details-" + mealId)
        .add("[data-meal-id='" + mealId + "']")
        .add("[data-toggle-details='" + mealId + "']");

    if ($trigger.length) {
        return $trigger;
    }

    return $("[onclick]").filter(function () {
        var onclickValue = this.getAttribute("onclick") || "";
        return onclickValue.indexOf("toggleDetails('" + mealId + "')") !== -1 || onclickValue.indexOf('toggleDetails("' + mealId + '")') !== -1;
    });
}

function updateTriggerAppearance($trigger, isActive) {
    if (!$trigger.length) {
        return;
    }

    var activeBackground = "#F5A623";
    var inactiveBackground = "#8B2500";
    var backgroundColor = isActive ? activeBackground : inactiveBackground;

    $trigger.toggleClass("is-active", isActive).css({
        backgroundColor: backgroundColor,
        color: "#ffffff",
        borderColor: backgroundColor,
        accentColor: backgroundColor
    });
}

function toggleDetails(mealId) {
    var $detailsRow = $("#details-" + mealId);
    var $trigger = getDetailsTrigger(mealId);

    $detailsRow.slideToggle(function () {
        updateTriggerAppearance($trigger, $detailsRow.is(":visible"));
    });
}

function showOrderForm() {
    var $selectedMeals = $(".meal-checkbox:checked");

    if (!$selectedMeals.length) {
        alert("الرجاء اختيار وجبة واحدة على الأقل");
        return false;
    }

    $("#order-form-section").slideDown();

    var $formSection = $("#order-form-section");
    if ($formSection.length) {
        $("html, body").animate({
            scrollTop: $formSection.offset().top
        }, 600);
    }

    return true;
}

function validateArabicName(value) {
    if (!value) {
        return false;
    }

    return /^[\u0600-\u06FF\s]+$/.test(value);
}

function validateNationalID(value) {
    if (!/^\d{11}$/.test(value)) {
        return false;
    }

    var prefix = parseInt(value.substring(0, 2), 10);
    return prefix >= 1 && prefix <= 14;
}

function validateBirthDate(value) {
    if (!value) {
        return true;
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) {
        return false;
    }

    var year = parseInt(value.substring(0, 4), 10);
    var currentYear = new Date().getFullYear();

    return year >= 1900 && year <= currentYear - 10;
}

function validateMobile(value) {
    if (!value) {
        return true;
    }

    return /^(094|093|091|096|098|099|092|095|097|088)\d{7}$/.test(value);
}

function validateEmail(value) {
    if (!value) {
        return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function submitOrder() {
    var fullName = $("#fullName").val().trim();
    var nationalID = $("#nationalID").val().trim();
    var birthDate = $("#birthDate").val().trim();
    var mobile = $("#mobile").val().trim();
    var email = $("#email").val().trim();

    var isValid = true;

    if (fullName && !validateArabicName(fullName)) {
        setFieldError("fullName", true);
        isValid = false;
    } else {
        setFieldError("fullName", false);
    }

    if (!nationalID || !validateNationalID(nationalID)) {
        setFieldError("nationalID", true);
        isValid = false;
    } else {
        setFieldError("nationalID", false);
    }

    if (birthDate && !validateBirthDate(birthDate)) {
        setFieldError("birthDate", true);
        isValid = false;
    } else {
        setFieldError("birthDate", false);
    }

    if (mobile && !validateMobile(mobile)) {
        setFieldError("mobile", true);
        isValid = false;
    } else {
        setFieldError("mobile", false);
    }

    if (email && !validateEmail(email)) {
        setFieldError("email", true);
        isValid = false;
    } else {
        setFieldError("email", false);
    }

    if (!isValid) {
        return false;
    }

    var $selectedMeals = $(".meal-checkbox:checked");

    if (!$selectedMeals.length) {
        alert("الرجاء اختيار وجبة واحدة على الأقل");
        return false;
    }

    var total = 0;
    var mealsHtml = "";

    $selectedMeals.each(function () {
        var $meal = $(this);
        var mealName = escapeHtml($meal.data("name") || "");
        var mealPrice = parseFloat($meal.data("price")) || 0;
        var mealCode = escapeHtml($meal.data("code") || "");

        total += mealPrice;

        mealsHtml += '<div class="selected-meal">' +
            '<div><strong>كود الوجبة:</strong> ' + mealCode + '</div>' +
            '<div><strong>اسم الوجبة:</strong> ' + mealName + '</div>' +
            '<div><strong>السعر:</strong> ' + mealPrice.toFixed(2) + '</div>' +
        '</div>';
    });

    var taxAmount = total * 0.05;
    var finalTotal = total * 0.95;

    var popupHtml = '' +
        mealsHtml +
        '<hr>' +
        '<div><strong>المجموع قبل الضريبة:</strong> ' + total.toFixed(2) + '</div>' +
        '<div><strong>قيمة الضريبة (5%):</strong> ' + taxAmount.toFixed(2) + '</div>' +
        '<div class="total-price"><strong>المجموع النهائي:</strong> ' + finalTotal.toFixed(2) + '</div>';

    $("#popup-content").html(popupHtml);
    $("#popup-overlay").fadeIn();

    return true;
}

function closePopup() {
    $("#popup-overlay").fadeOut();
}