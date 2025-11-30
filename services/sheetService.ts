
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4XIGJiIE6RIwU8HfaXPk8CXZibwzbHz3kNAIh3kP-Z8luaFret_bNzNXHYccpyvbVyQ/exec';

export const submitToSheet = async (data: any) => {
  try {
    // We use no-cors mode because Google Apps Script Web Apps often have strict CORS policies 
    // that are hard to satisfy from a client-side fetch without a proxy.
    // 'no-cors' allows the request to go through (fire and forget), but we can't read the response.
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return true;
  } catch (error) {
    console.error("Error submitting to Google Sheet:", error);
    return false;
  }
};
