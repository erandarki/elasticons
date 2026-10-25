/* ========================================================================== */
/* AUTH & PAYMENT LOGIC.                                                      */
/* ========================================================================== */

// 1. Setup Supabase
const SB_URL = 'https://vrfhbulqufibjfopxvyn.supabase.co';
const SB_KEY = 'sb_publishable_0nYL47hXBuSUbOGjVUy82w_v8oVE9AS';

const elasticonsDb = supabase.createClient(SB_URL, SB_KEY, {
    global: { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }
});

// 2. Global State (Shared with app.js)
window.isPaid = false;
let isChecking = false;

// 3. Auth DOM Elements
const authElements = {
  // Modal Elements
  continueBtn: document.getElementById('continue-btn'),
  authEmail: document.getElementById('auth-email'),
  // Navbar Elements
  loginBtn: document.getElementById('login-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  // The form
  authContainer: document.getElementById('auth-container'),
};

/**
 * Checks the user's session and queries the profiles table for 'is_paid'
 */
window.checkAccess = async () => {
    if (isChecking) return;
    isChecking = true;

    try {
        const { data: { session }, error: sessionError } = await elasticonsDb.auth.getSession();
        if (sessionError) throw sessionError;

        let currentPaidStatus = false;

        if (session) {
            // UI Toggle
            if (authElements.loginBtn) authElements.loginBtn.classList.add('d-none');
            if (authElements.logoutBtn) authElements.logoutBtn.classList.remove('d-none');

            // 1. Fetch profile data (including our new session column)
            const { data, error } = await elasticonsDb
                .from('profiles')
                .select('is_paid, access_expires_at, last_session_id')
                .eq('id', session.user.id)
                .maybeSingle();

            if (data) {
                // SINGLE SESSION LOGIC (Using Persistent Device ID)
                let deviceId = localStorage.getItem('elasticons_device_id');
                if (!deviceId) {
                    deviceId = crypto.randomUUID();
                    localStorage.setItem('elasticons_device_id', deviceId);
                }

                // If there's a stored session and it doesn't match this physical device...
                if (data.last_session_id && data.last_session_id !== deviceId) {
                    console.warn("Elasticons: Logged in from another device. Signing out.");
                    await elasticonsDb.auth.signOut();
                    return; // Stop execution
                }

                // If this is a fresh login or the session ID is missing, update the database
                if (!data.last_session_id) {
                    await elasticonsDb
                        .from('profiles')
                        .update({ last_session_id: deviceId })
                        .eq('id', session.user.id);
                }

                // If this is a fresh login or the session ID is missing, update it
                if (!data.last_session_id) {
                    await elasticonsDb
                        .from('profiles')
                        .update({ last_session_id: session.access_token })
                        .eq('id', session.user.id);
                }

                // 3. EXPIRATION LOGIC
                if (data.is_paid) {
                    const now = new Date();
                    const expiry = data.access_expires_at ? new Date(data.access_expires_at) : null;
                    currentPaidStatus = expiry && expiry > now;
                }
            }
        } else {
            // Logged out UI state
            if (authElements.loginBtn) authElements.loginBtn.classList.remove('d-none');
            if (authElements.logoutBtn) authElements.logoutBtn.classList.add('d-none');
        }

        // 4. PREVENT FLICKER
        // Only trigger heavy re-renders if the paid status actually CHANGED 
        // from what it was previously in the window global.
        if (window.isPaid !== currentPaidStatus) {
            window.isPaid = currentPaidStatus;
            if (typeof window.updateControlStates === 'function') window.updateControlStates();
            if (typeof window.loadAllIcons === 'function') window.loadAllIcons();
        } else if (!document.querySelector('.icon-wrapper')) { 
            // If the grid is empty (first load), we must render it
            if (typeof window.loadAllIcons === 'function') window.loadAllIcons();
        }

    } catch (err) {
        console.warn("Auth Check Note:", err.message);
        // Fallback: ensure icons load even if network fails
        if (typeof window.loadAllIcons === 'function') window.loadAllIcons();
    } finally {
        isChecking = false;
    }
};

/* -------------------------------------------------------------------------- */
/* Event Listeners                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Converts a string to Sentence case.
 * e.g., "invalid login credentials" -> "Invalid login credentials."
 */
function toSentenceCase(str) {
    if (!str) return '';
    // Capitalize first letter and lowercase the rest
    let formatted = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    // Add a period at the end if it's missing
    if (!formatted.endsWith('.')) {
        formatted += '.';
    }
    return formatted;
}

// Send Magic Link
if (authElements.authContainer) {
    authElements.authContainer.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const email = authElements.authEmail?.value;
      const wrapper = document.getElementById('loginAlertWrapper');
      const responseText = document.getElementById('loginFormResponse');
      const alertDiv = wrapper.querySelector('.alert');
      const spinner = authElements.continueBtn.querySelector('.spinner-border');
      const btnText = authElements.continueBtn.querySelector('.continue-text');

      // 1. HONEYPOT CHECK: If a bot fills out the hidden field, stop immediately!
      if (formData.get('confirm-login-entry')) {
          console.warn('Login spambot blocked.');
          e.target.reset();
          return; // Silently drop the request
      }

      // Reset state before starting
      wrapper.classList.remove('alert-animation');
      spinner.classList.remove('visually-hidden');
      btnText.classList.add('visually-hidden');
      authElements.continueBtn.disabled = true;

      const { error } = await elasticonsDb.auth.signInWithOtp({
          email: email,
          options: { emailRedirectTo: window.location.origin }
      });

      if (error) {
          // FAILED STATE
          responseText.textContent = toSentenceCase(error.message);
          alertDiv.classList.replace('alert-primary', 'alert-danger');
          spinner.classList.add('visually-hidden');
          btnText.classList.remove('visually-hidden');
          authElements.continueBtn.disabled = false;
      } else {
          // SUCCESS STATE
          responseText.textContent = `Great, check your inbox! We've sent a secure access link to ${email}. Please check your spam folder in case you didn't get the email.`;
          alertDiv.classList.replace('alert-danger', 'alert-primary');
          spinner.classList.add('visually-hidden');
          btnText.classList.remove('visually-hidden');
          authElements.continueBtn.disabled = false;
      }

      // Trigger the animation
      wrapper.classList.add('alert-animation');
    });
}

// Logout
if (authElements.logoutBtn) {
    authElements.logoutBtn.addEventListener('click', () => elasticonsDb.auth.signOut());
}

// Listen for Lemon Squeezy Payments
window.addEventListener('LemonSqueezy.Checkout.Success', (event) => {
    window.isPaid = true;
    
    // Force the UI to update and re-render the SVGs instantly
    if (typeof window.updateControlStates === 'function') window.updateControlStates();
    if (typeof window.loadAllIcons === 'function') window.loadAllIcons();
    
    // Hide the pricing modal automatically
    const modalEl = document.getElementById('pricesModal');
    if (modalEl) {
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
    }
});

// Listen for Magic Link Redirects
elasticonsDb.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        // ALWAYS check access, even if logged out, so free PNGs load
        window.checkAccess(); 
    }
    if (event === 'SIGNED_OUT') {
        window.isPaid = false;
        sessionStorage.removeItem('lastAuthCheck'); 
        location.reload();
    }
});