/**
 * GitHub Pages Deployment Fix Configuration
 * This file contains all the settings needed to fix GitHub Pages 404 errors
 */

export const GITHUB_PAGES_CONFIG = {
  // ============================================
  // REPOSITORY SETTINGS
  // ============================================
  repo: {
    owner: 'kyalokennedy142-del',
    name: 'mary-arctic-water-app',
    // Full URL: https://kyalokennedy142-del.github.io/mary-arctic-water-app/
  },

  // ============================================
  // VITE CONFIGURATION
  // ============================================
  vite: {
    // CRITICAL: Must match repo name with trailing slash
    base: '/mary-arctic-water-app/',
    
    // Build output directory
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false, // Reduce bundle size
    },
  },

  // ============================================
  // GITHUB PAGES SETTINGS
  // ============================================
  pages: {
    // Branch to deploy from
    branch: 'gh-pages',
    
    // Folder to deploy
    folder: 'dist',
    
    // Root URL for the site
    url: 'https://kyalokennedy142-del.github.io/mary-arctic-water-app/',
  },

  // ============================================
  // REACT ROUTER SETTINGS
  // ============================================
  router: {
    // For GitHub Pages, use HashRouter OR add basename to BrowserRouter
    // Option A: Use HashRouter (recommended for GitHub Pages)
    useHashRouter: true,
    
    // Option B: If using BrowserRouter, add basename
    basename: '/mary-arctic-water-app',
  },

  // ============================================
  // REQUIRED FILES FOR GITHUB PAGES
  // ============================================
  requiredFiles: {
    // Must exist in root of gh-pages branch
    'index.html': {
      path: 'dist/index.html',
      required: true,
      description: 'Main entry point - must exist',
    },
    'favicon.svg': {
      path: 'dist/favicon.svg',
      required: false,
      description: 'Site favicon',
    },
    'assets/': {
      path: 'dist/assets/',
      required: true,
      description: 'Compiled JS/CSS files',
    },
  },

  // ============================================
  // SPA ROUTING FIX (for React Router)
  // ============================================
  spaRouting: {
    // Create a 404.html that redirects to index.html
    '404.html': `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      // Single Page Apps for GitHub Pages
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&q=' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
    Redirecting to <a id="redirectLink"></a>...
  </body>
</html>`,

    // Or use _redirects file (Netlify-style, works on some hosts)
    '_redirects': '/*    /mary-arctic-water-app/index.html   200',
  },

  // ============================================
  // DEPLOYMENT SCRIPT HELPER
  // ============================================
  deploy: {
    // Pre-deploy: Always build first
    predeploy: 'npm run build',
    
    // Deploy command
    deploy: 'gh-pages -d dist -b gh-pages --dotfiles',
    
    // Force option for stubborn caches
    forceDeploy: 'gh-pages -d dist -b gh-pages --force --dotfiles',
  },

  // ============================================
  // TROUBLESHOOTING CHECKLIST
  // ============================================
  checklist: [
    '✅ vite.config.js has base: "/mary-arctic-water-app/" (with trailing slash)',
    '✅ package.json has homepage: "https://kyalokennedy142-del.github.io/mary-arctic-water-app"',
    '✅ npm run build creates dist/index.html',
    '✅ gh-pages branch exists and contains dist/ contents',
    '✅ GitHub Pages settings point to gh-pages branch → / (root)',
    '✅ Browser cache cleared (Ctrl+Shift+R)',
    '✅ Waited 1-2 minutes after deploy for GitHub to process',
    '✅ Using HashRouter OR BrowserRouter with basename',
  ],

  // ============================================
  // COMMON ERRORS & FIXES
  // ============================================
  errors: {
    '404 index.html': {
      cause: 'index.html not found in gh-pages branch root',
      fix: 'Run: npm run build && npm run deploy',
    },
    '404 assets/*.js': {
      cause: 'base path mismatch in vite.config.js',
      fix: 'Ensure base: "/mary-arctic-water-app/" matches repo name',
    },
    'Blank page, no errors': {
      cause: 'React Router not configured for subpath',
      fix: 'Use HashRouter OR add basename to BrowserRouter',
    },
    'CORS error': {
      cause: 'Supabase credentials missing or blocked',
      fix: 'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in .env.local',
    },
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate GitHub Pages configuration
 */
export const validateGitHubPagesConfig = () => {
  const errors = []
  const warnings = []

  // Check base path format
  if (!GITHUB_PAGES_CONFIG.vite.base?.endsWith('/')) {
    errors.push('vite.config.js base must end with trailing slash: "/mary-arctic-water-app/"')
  }

  // Check homepage URL
  if (!GITHUB_PAGES_CONFIG.repo.name) {
    errors.push('package.json homepage must be set')
  }

  // Check if using HashRouter or basename
  if (!GITHUB_PAGES_CONFIG.router.useHashRouter && !GITHUB_PAGES_CONFIG.router.basename) {
    warnings.push('Consider using HashRouter or adding basename for GitHub Pages routing')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Generate deployment commands
 */
export const getDeployCommands = () => {
  return [
    '# 1. Build the app',
    'npm run build',
    '',
    '# 2. Verify dist/index.html exists',
    'ls dist/',
    '',
    '# 3. Deploy to gh-pages branch',
    'npm run deploy',
    '',
    '# 4. If still getting 404, force redeploy',
    'npx gh-pages -d dist -b gh-pages --force --dotfiles',
  ].join('\n')
}

/**
 * Generate troubleshooting steps
 */
export const getTroubleshootingSteps = () => {
  return [
    '1. Open browser DevTools (F12) → Network tab',
    '2. Refresh the page',
    '3. Check which file is returning 404',
    '4. If index.html 404: Run npm run deploy again',
    '5. If assets/*.js 404: Check vite.config.js base path',
    '6. If blank page: Check React Router configuration',
    '7. Clear browser cache: Ctrl+Shift+Delete → Cached files',
    '8. Wait 2 minutes after deploy for GitHub to process',
  ].join('\n')
}

export default GITHUB_PAGES_CONFIG