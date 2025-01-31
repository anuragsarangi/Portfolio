(function() {
  function validEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
  }

  function validateHuman(honeypot) {
    if (honeypot) {  // If the hidden form is filled up (spam prevention)
      console.log("Robot Detected!");
      return true;
    } else {
      console.log("Welcome Human!");
    }
  }

  // Get all data in form and return an object
  function getFormData(form) {
    var elements = form.elements;

    var fields = Object.keys(elements).filter(function(k) {
          return (elements[k].name !== "honeypot");
    }).map(function(k) {
      if (elements[k].name !== undefined) {
        return elements[k].name;
      } else if (elements[k].length > 0) {
        return elements[k].item(0).name;
      }
    }).filter(function(item, pos, self) {
      return self.indexOf(item) == pos && item;
    });

    var formData = {};
    fields.forEach(function(name) {
      var element = elements[name];

      // Singular form elements just have one value
      formData[name] = element.value;

      // When element has multiple items, get their values
      if (element.length) {
        var data = [];
        for (var i = 0; i < element.length; i++) {
          var item = element.item(i);
          if (item.checked || item.selected) {
            data.push(item.value);
          }
        }
        formData[name] = data.join(', ');
      }
    });

    // Add form-specific values into the data
    formData.formDataNameOrder = JSON.stringify(fields);
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // Default sheet name
    formData.formGoogleSendEmail = form.dataset.email || ""; // No email by default

    console.log(formData);
    return formData;
  }

  function handleFormSubmit(event) {  // Handles form submit without jQuery
    event.preventDefault();  // We are submitting via xhr below
    var form = event.target;
    var formData = getFormData(form);  // Get the values submitted in the form

    if (formData.email && !validEmail(formData.email)) {   // If email is not valid, show error
      var invalidEmail = form.querySelector(".email-invalid");
      if (invalidEmail) {
        invalidEmail.style.display = "block";
        return false;  // Stop form submission if email is invalid
      }
    } else {
      disableAllButtons(form);
      var url = form.action;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {  // Request is done
          if (xhr.status === 200) {
            console.log("Form submission successful!");
            console.log("Raw Response:", xhr.responseText); // Log the raw response to understand its structure

            // Check if the response content is what I expected
            try {
              let responseData = JSON.parse(xhr.responseText); // Try parsing the response
              console.log("Parsed Response:", responseData);  // Log the parsed response

              // If responseData is still stringified, parse it again
              if (typeof responseData === 'string') {
                try {
                  responseData = JSON.parse(responseData); // Parse again if needed
                  console.log("Double Parsed Response:", responseData);  // Log the double-parsed response
                } catch (e) {
                  console.error("Error parsing the response data twice:", e);
                }
              }

              // Handle the result
              if (responseData.result === "success") {
                console.log("Server confirmed success. Hiding form and showing thank you message.");
                
                // Select the form elements container (Ensure this matches your HTML structure)
                var formElements = form.querySelector(".contact");
                if (formElements) {
                  formElements.style.display = "none"; // Hide the form elements
                  console.log("Form elements hidden.");
                } else {
                  console.log("Form elements container not found.");
                }

                // Select the thank you message (Ensure this matches your HTML structure)
                var thankYouMessage = form.querySelector(".thankyou_msg"); // Updated to new class name
                if (thankYouMessage) {
                  setTimeout(function() {
                    thankYouMessage.style.display = "block"; // Show the thank you message
                    console.log("Thank you message displayed.");
                  }, 200);  // Delay of 200ms
                } else {
                  console.log("Thank you message not found.");
                }
              } else {
                console.error("Form submission failed (server sent an error)", responseData.message);
              }
            } catch (e) {
              console.error("Form submission failed (unexpected response format):", e);
            }

          } else {
            console.error("Form submission failed with status:", xhr.status, xhr.statusText);
          }
        } else {
          console.log("Request still in progress: readyState", xhr.readyState);
        }
      };

      // URL encode form data for sending as post data
      var encoded = Object.keys(formData).map(function(k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(formData[k]);
      }).join('&');

      xhr.send(encoded);
    }
  }

  function loaded() {
    console.log("Contact form submission handler loaded successfully.");
    // Bind to the submit event of our form
    var forms = document.querySelectorAll("#gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit, false);
    }
  }

  document.addEventListener("DOMContentLoaded", loaded, false);

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }
})();
