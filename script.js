document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("dynamic-form");
  const loader = document.getElementById("submit-loader");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwQmM7y1s9m31wYI-X6R-_FcShrQSXho77LYrIO1zIMeYXB97ndpOr2AwO9-gbIx_7Z/exec";

  fetch("questions.json")
    .then(response => response.json())
    .then(data => {

      document.getElementById("form-title").textContent = data.title;
      document.getElementById("form-subtitle").textContent = data.subtitle;

      data.sections.forEach(section => {

        const h2 = document.createElement("h2");
        h2.textContent = section.sectionTitle;
        form.appendChild(h2);

        section.questions.forEach(question => {

          const card = document.createElement("div");
          card.classList.add("question-card");

          const questionTitle = document.createElement("h3");
          questionTitle.textContent =
            question.label + (question.required ? " *" : "");
          card.appendChild(questionTitle);

          // TEXT INPUTS
          if (["text", "email", "tel", "url"].includes(question.type)) {
            const input = document.createElement("input");
            input.type = question.type;
            input.name = question.name;
            if (question.required) input.required = true;
            card.appendChild(input);
          }

          // TEXTAREA
          else if (question.type === "textarea") {
            const textarea = document.createElement("textarea");
            textarea.name = question.name;
            textarea.rows = 4;
            if (question.required) textarea.required = true;
            card.appendChild(textarea);
          }

          // RADIO / CHECKBOX
          else if (["radio", "checkbox"].includes(question.type)) {

            const optionsDiv = document.createElement("div");
            optionsDiv.classList.add("options");

            question.options.forEach(option => {

              const optionLabel = document.createElement("label");

              const input = document.createElement("input");
              input.type = question.type;
              input.name = question.name;
              input.value = option;

              if (question.required && question.type === "radio") {
                input.required = true;
              }

              const textSpan = document.createElement("span");
              textSpan.textContent = option;

              optionLabel.appendChild(input);
              optionLabel.appendChild(textSpan);

              optionsDiv.appendChild(optionLabel);
            });

            card.appendChild(optionsDiv);
          }

          form.appendChild(card);
        });
      });

      // CREATE SUBMIT BUTTON
      const button = document.createElement("button");
      button.type = "submit";
      button.classList.add("submit-btn");
      button.textContent = "Submit Application";
      form.appendChild(button);

      // NOW attach submit logic (after button exists)
      preventSamePreferences();
      attachSubmitHandler(form, button);
    });

  // ============================
  // SUBMIT HANDLER FUNCTION
  // ============================

  function preventSamePreferences() {
  const firstRadios = document.getElementsByName("first_preference");
  const secondRadios = document.getElementsByName("second_preference");

  function updateOptions() {
    let firstValue = null;
    let secondValue = null;

    firstRadios.forEach(radio => {
      if (radio.checked) firstValue = radio.value;
    });

    secondRadios.forEach(radio => {
      if (radio.checked) secondValue = radio.value;
    });

    // Enable everything first
    firstRadios.forEach(radio => radio.disabled = false);
    secondRadios.forEach(radio => radio.disabled = false);

    // Disable matching opposite option
    if (firstValue) {
      secondRadios.forEach(radio => {
        if (radio.value === firstValue) {
          radio.disabled = true;
        }
      });
    }

    if (secondValue) {
      firstRadios.forEach(radio => {
        if (radio.value === secondValue) {
          radio.disabled = true;
        }
      });
    }
  }

  firstRadios.forEach(radio => {
    radio.addEventListener("change", updateOptions);
  });

  secondRadios.forEach(radio => {
    radio.addEventListener("change", updateOptions);
  });
}
  function attachSubmitHandler(form, submitBtn) {

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const first = document.querySelector('input[name="first_preference"]:checked');
      const second = document.querySelector('input[name="second_preference"]:checked');

      if (first && second && first.value === second.value) {
        alert("First and Second preference cannot be the same.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Application";
        loader.classList.remove("active");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Transmitting...";
      loader.classList.add("active");

      try {
        const formData = new FormData(form);

        const response = await fetch(WEB_APP_URL, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Network response was not OK");
        }

        const result = await response.json();

        if (result.success) {
          submitBtn.textContent = "✓ Submitted";
          form.reset();
        } 
        else {

          // ✅ ADD THIS: duplicate registration alert
          if (result.status === 409) {
            alert("You have already registered with this Register Number or Email.");
          } else {
            alert("Something went wrong. Please try again.");
          }

          throw new Error("Server returned failure");
        }


      } catch (error) {
        console.error("Submission Error:", error);
        submitBtn.textContent = "Submission Failed";
      } finally {
        loader.classList.remove("active");

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Application";
        }, 2000);
      }
    });
  }

});
