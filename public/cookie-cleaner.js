// Clear oversized cookies to prevent 494 errors
(function() {
  const cookies = document.cookie.split(';');
  let totalSize = 0;
  
  cookies.forEach(cookie => {
    totalSize += cookie.length;
  });
  
  // If cookies are larger than 4KB, clear all NextAuth cookies
  if (totalSize > 4000) {
    console.warn('[Cookie Cleaner] Cookies too large (' + totalSize + ' bytes), clearing...');
    
    const cookieNames = [
      'next-auth.session-token',
      'next-auth.callback-url', 
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.callback-url',
      '__Secure-next-auth.csrf-token',
      '__Host-next-auth.csrf-token'
    ];
    
    cookieNames.forEach(name => {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
    });
    
    // Reload the page after clearing
    window.location.reload();
  }
})();
