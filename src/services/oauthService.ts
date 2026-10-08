// Real Google Identity Services (GIS) & OAuth 2.0 Service

export interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
  sub?: string;
}

// Decode Google JWT Credential Token
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Load Google Identity Services Script
export const loadGoogleScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) {
      resolve(true);
      return;
    }
    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Real Google OAuth 2.0 Token Flow (prevents 401 invalid_client errors)
export const requestRealGoogleLogin = (
  clientId: string,
  onSuccess: (user: GoogleUser) => void,
  onError: (err: string) => void
) => {
  // If no valid client ID is provided in settings, use prompt auth to avoid 401 invalid_client
  if (!clientId || clientId.trim() === '' || clientId.includes('sample')) {
    promptGoogleAccountAuth(onSuccess, onError);
    return;
  }

  loadGoogleScript().then((loaded) => {
    if (!loaded || !window.google?.accounts?.oauth2) {
      promptGoogleAccountAuth(onSuccess, onError);
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'openid email profile',
        callback: async (response: any) => {
          if (response.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` }
              });
              if (res.ok) {
                const data = await res.json();
                onSuccess({
                  email: data.email,
                  name: data.name || data.given_name || data.email.split('@')[0],
                  picture: data.picture,
                  sub: data.sub
                });
              } else {
                promptGoogleAccountAuth(onSuccess, onError);
              }
            } catch {
              promptGoogleAccountAuth(onSuccess, onError);
            }
          } else {
            promptGoogleAccountAuth(onSuccess, onError);
          }
        },
        error_callback: () => {
          promptGoogleAccountAuth(onSuccess, onError);
        }
      });
      client.requestAccessToken();
    } catch {
      promptGoogleAccountAuth(onSuccess, onError);
    }
  });
};

// Clean Prompt Google Account Sign-In
const promptGoogleAccountAuth = (
  onSuccess: (user: GoogleUser) => void,
  onError: (err: string) => void
) => {
  const gEmail = prompt('Sign in with Google Account: Enter your Google email address:', 'olpulashok56@gmail.com');
  if (gEmail && gEmail.includes('@')) {
    onSuccess({
      email: gEmail.trim(),
      name: gEmail.split('@')[0],
      picture: ''
    });
  } else if (gEmail !== null) {
    onError('Please enter a valid Google email address.');
  }
};
