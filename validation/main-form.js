(function() {
    // Инициализация формы при загрузке DOM
    function initForm() {
        const form = document.querySelector('[data-form="main"]');
        if (!form) return;

        // Получаем элементы
        const nameField = form.querySelector('[data-filed="name-main"]');
        const phoneField = form.querySelector('[data-filed="phone-main"]');
        const nameError = form.querySelector('[data-form-error="error-main-name"]');
        const phoneError = form.querySelector('[data-form-error="error-main-phone"]');
        const socialFields = form.querySelectorAll('[data-filed="social-main"]');
        const buttonWrapper = form.querySelector('[data-wrapper-bttn="wrapper-main"]');
        const submitButton = form.querySelector('[data-bttn="btnn-form-main"]');

        // Проверяем наличие всех обязательных элементов
        if (!nameField || !phoneField || !nameError || !phoneError || !socialFields.length || !submitButton) {
            return;
        }

        // Состояния валидации
        let isNameValid = false;
        let isPhoneValid = false;
        let isSocialValid = false;
        let selectedCountryCode = null;
        let itiInstance = null;

        // Инициализация IntlTelInput
        itiInstance = window.intlTelInput(phoneField, {
            initialCountry: "auto",
            geoIpLookup: function(callback) {
                fetch("https://ipinfo.io/json")
                    .then(response => response.json())
                    .then(data => {
                        callback(data.country ? data.country.toLowerCase() : null);
                    })
                    .catch(() => {
                        callback(null);
                    });
            },
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.19/build/js/utils.js",
            autoPlaceholder: "polite",
            separateDialCode: false,
            nationalMode: false
        });

        // Показать ошибку
        function showError(element) {
            element.style.display = "block";
            element.style.opacity = "1";
            element.style.pointerEvents = "auto";
        }

        // Скрыть ошибку
        function hideError(element) {
            element.style.opacity = "0";
            element.style.pointerEvents = "none";
            setTimeout(() => {
                element.style.display = "none";
            }, 200);
        }

        // Валидация имени
        function validateName() {
            if (!isNameValid) {
                hideError(nameError);
                nameField.style.borderColor = "";
                nameField.style.color = "#010104";
                nameField.classList.remove("active");
                return false;
            }

            const isValid = nameField.value.trim().length > 0;
            if (isValid) {
                nameField.classList.add("active");
                hideError(nameError);
                nameField.style.borderColor = "";
                nameField.style.color = "#010104";
            } else {
                showError(nameError);
                nameField.style.borderColor = "#DB1A2A";
                nameField.style.color = "#010104";
                nameField.classList.remove("active");
            }
            return isValid;
        }

        // Валидация телефона
        function validatePhone() {
            if (!isPhoneValid) {
                hideError(phoneError);
                phoneField.style.borderColor = "";
                phoneField.style.color = "#010104";
                
                const itiContainer = phoneField.closest(".iti");
                const flagContainer = itiContainer?.querySelector(".iti__flag-container");
                
                itiContainer?.style.removeProperty("border-color");
                flagContainer?.style.removeProperty("border-color");
                return false;
            }

            const phoneValue = phoneField.value.trim();
            const onlyDigits = phoneValue.replace(/\D/g, "");
            const hasValidFormat = /^[\+\d\s\-()]+$/.test(phoneValue);
            const isValidNumber = itiInstance.isValidNumber();
            const minLength = onlyDigits.length >= 6;
            const isValid = hasValidFormat && isValidNumber && minLength;

            const itiContainer = phoneField.closest(".iti");
            const flagContainer = itiContainer?.querySelector(".iti__flag-container");

            if (isValid) {
                phoneField.classList.add("active");
                hideError(phoneError);
                phoneField.style.borderColor = "";
                phoneField.style.color = "#010104";
                
                itiContainer?.style.setProperty("border-color", "#20B20F", "important");
                itiContainer?.classList.add("active");
                flagContainer?.style.setProperty("border-color", "#20B20F", "important");
                flagContainer?.classList.add("active");
            } else {
                phoneField.classList.remove("active");
                showError(phoneError);
                phoneField.style.setProperty("border-color", "#DB1A2A", "important");
                phoneField.style.color = "#010104";
                
                itiContainer?.style.setProperty("border-color", "#DB1A2A", "important");
                itiContainer?.classList.remove("active");
                flagContainer?.style.setProperty("border-color", "#DB1A2A", "important");
                flagContainer?.classList.remove("active");
            }
            return isValid;
        }

        // Валидация соцсетей
        function validateSocial() {
            return Array.from(socialFields).some(field => field.checked);
        }

        // Обновление состояния кнопки
        function updateButtonState() {
            const isFormValid = validateName() && validatePhone() && validateSocial();
            submitButton.disabled = !isFormValid;
            submitButton.classList.toggle("active", isFormValid);
            submitButton.classList.toggle("passive", !isFormValid);
            
            if (buttonWrapper) {
                buttonWrapper.classList.toggle("active", isFormValid);
                buttonWrapper.classList.toggle("passive", !isFormValid);
            }
        }

        // Установка кода страны после инициализации
        setTimeout(() => {
            try {
                const countryData = itiInstance.getSelectedCountryData();
                if (countryData && countryData.dialCode) {
                    selectedCountryCode = countryData.dialCode;
                    const currentValue = phoneField.value.trim();
                    if (currentValue === "" || currentValue === "+") {
                        phoneField.value = `+${selectedCountryCode}`;
                        isPhoneValid = false;
                        validatePhone();
                        updateButtonState();
                    }
                }
            } catch (error) {
                selectedCountryCode = null;
            }
        }, 300);

        // Обработчики событий
        phoneField.addEventListener("blur", () => {
            const value = phoneField.value.trim();
            if (value === "" || value === "+") {
                selectedCountryCode = null;
            } else if (/^\+\d{1,4}$/.test(value)) {
                const match = value.match(/^\+(\d{1,4})$/);
                if (match) {
                    selectedCountryCode = match[1];
                }
            }
        });

        phoneField.addEventListener("input", () => {
            isPhoneValid = true;
            const match = phoneField.value.trim().match(/^\+(\d{1,4})/);
            if (match) {
                selectedCountryCode = match[1];
            }
            validatePhone();
            updateButtonState();
        });

        nameField.addEventListener("input", () => {
            isNameValid = true;
            validateName();
            updateButtonState();
        });

        socialFields.forEach(field => {
            field.addEventListener("change", () => {
                isSocialValid = true;
                updateButtonState();
            });
        });

        // Обработка отправки формы
        form.addEventListener("submit", (event) => {
            isNameValid = true;
            isPhoneValid = true;
            isSocialValid = true;
            
            const isFormValid = validateName() && validatePhone() && validateSocial();
            if (!isFormValid) {
                event.preventDefault();
                updateButtonState();
            }
        });

        // Инициальное состояние кнопки
        submitButton.disabled = true;
        submitButton.classList.add("passive");
        submitButton.classList.remove("active");

        // Автовыбор кода страны при клике вне поля
        document.addEventListener("click", (event) => {
            if (!event.target.closest('[data-filed="phone-main"]')) {
                try {
                    const value = phoneField.value.trim();
                    const countryData = itiInstance.getSelectedCountryData();
                    
                    if (countryData && countryData.dialCode) {
                        const countryCode = `+${countryData.dialCode}`;
                        if (value === "" || value === "+" || 
                            value === countryCode || 
                            (value.startsWith(countryCode) && 
                             value.replace(/\D/g, "").length <= countryCode.replace(/\D/g, "").length)) {
                            phoneField.value = countryCode;
                            selectedCountryCode = countryData.dialCode;
                            isPhoneValid = false;
                            validatePhone();
                            updateButtonState();
                        }
                    }
                } catch (error) {
                    // Игнорируем ошибки
                }
            }
        });
    }

    // Запуск при готовности DOM
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initForm, { once: true });
    } else {
        initForm();
    }
})();
