// Textarea Expand with Text
const textareaEle = document.getElementById('messageTextarea');

textareaEle.addEventListener('input', () => {
  textareaEle.value = textareaEle.value.replace(/^\s/g,'');
  textareaEle.style.height = 'auto';
  textareaEle.style.height = `${textareaEle.scrollHeight + 2}px`;
});

// Submit the form
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const btn = document.getElementById('submitBtn');
  const alertWrapper = document.getElementById('contactAlertWrapper');
  const alertBox = alertWrapper.querySelector('.alert'); 
  const responseSpan = document.getElementById('contactFormResponse');
  const iconUse = alertBox.querySelector('svg use');
  const btnSpinner = btn.querySelector('.spinner-border');
  const btnText = btn.querySelector('.btn-text');
  const formData = new FormData(this);
  
  // Reset UI state
  btn.disabled = true;
  btnText.classList.add('visually-hidden');
  btnSpinner.classList.remove('visually-hidden');
  alertWrapper.classList.remove('alert-animation'); // Reset animation class

  fetch('https://vrfhbulqufibjfopxvyn.supabase.co/functions/v1/contact-handler', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    }),
  })
  .then((response) => {
    if (response.ok) {
      // Success State
      alertWrapper.classList.add('alert-animation');
      alertBox.classList.replace('alert-danger', 'alert-primary');
      iconUse.setAttribute('href', '#formSuccess');
      responseSpan.innerText = 'Message sent! We will get back to you soon.';
      this.reset();
      textareaEle.style.height = 'auto';
    } else {
      throw new Error('Form submission failed');
    }
  })
  .catch((error) => {
    // Error State
    alertBox.classList.replace('alert-primary', 'alert-danger');
    alertWrapper.classList.add('alert-animation');
    iconUse.setAttribute('href', '#formFail');
    responseSpan.innerText = 'Something went wrong. Please try again.';
  })
  .finally(() => {
    btn.disabled = false;
    btnSpinner.classList.add('visually-hidden');
    btnText.classList.remove('visually-hidden');
    // Scroll to the bottom of the form to show the alert (with small delay to ensure it has rendered)
    setTimeout(() => {
      alertWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  });
});