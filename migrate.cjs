const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const mapping = {
  'api/axios.js': 'shared/infrastructure/axios.js',
  'App.vue': 'app/App.vue',
  'application/saved.store.js': 'modules/events/application/saved.store.js',
  'assets/Group.png': 'shared/assets/Group.png',
  'assets/happi_logo.png': 'shared/assets/happi_logo.png',
  'assets/mascot.png': 'shared/assets/mascot.png',
  'components/EventCard.vue': 'modules/events/presentation/EventCard.vue',
  'components/Navbar.vue': 'shared/presentation/Navbar.vue',
  'i18n.js': 'app/i18n/i18n.js',
  'locales/en.json': 'shared/locales/en.json',
  'locales/es.json': 'shared/locales/es.json',
  'main.js': 'app/main.js',
  'metrics/infrastructure/metrics-api.js': 'modules/metrics/infrastructure/metrics-api.js',
  'metrics/presentation/entrepreneur-metrics.vue': 'modules/metrics/presentation/entrepreneur-metrics.vue',
  'organizer/pages/create-event.vue': 'modules/organizer/presentation/create-event.vue',
  'organizer/pages/events.vue': 'modules/organizer/presentation/events.vue',
  'organizer/presentation/components/LanguageSwitcher.vue': 'shared/presentation/LanguageSwitcher.vue',
  'organizer/presentation/components/organizer-header.vue': 'shared/presentation/organizer-header.vue',
  'pinia.js': 'app/store/pinia.js',
  'router/index.js': 'app/router/index.js',
  'router/organizer.routes.js': 'modules/organizer/router/organizer.routes.js',
  'router/user.routes.js': 'app/router/user.routes.js',
  'services/auth.js': 'modules/iam/infrastructure/auth.api.js',
  'shared/infrastructure/base-api.js': 'shared/infrastructure/base-api.js',
  'shared/infrastructure/base-endpoint.js': 'shared/infrastructure/base-endpoint.js',
  'stands/application/assign-stands.store.js': 'modules/stands/application/assign-stands.store.js',
  'stands/domain/assigned-stand.entity.js': 'modules/stands/domain/assigned-stand.entity.js',
  'stands/infrastructure/assign-stands-api.js': 'modules/stands/infrastructure/assign-stands-api.js',
  'stands/presentation/stands-routes.js': 'modules/stands/router/stands.routes.js',
  'stands/presentation/views/stand-form.vue': 'modules/stands/presentation/stand-form.vue',
  'stands/presentation/views/stands-list.vue': 'modules/stands/presentation/stands-list.vue',
  'style.css': 'shared/assets/style.css',
  'views/Events.vue': 'modules/events/presentation/Events.vue',
  'views/Home.vue': 'modules/events/presentation/Home.vue',
  'views/NotFound.vue': 'app/presentation/NotFound.vue',
  'views/Notifications.vue': 'modules/notifications/presentation/Notifications.vue',
  'views/Profile.vue': 'modules/iam/presentation/Profile.vue',
  'views/Publishment.vue': 'modules/events/presentation/Publishment.vue',
  'views/Saved.vue': 'modules/events/presentation/Saved.vue',
  'views/Search.vue': 'modules/events/presentation/Search.vue',
  'views/SignIn.vue': 'modules/iam/presentation/SignIn.vue',
  'views/SignUps.vue': 'modules/iam/presentation/SignUps.vue',
  'views/Tickets.vue': 'modules/tickets/presentation/Tickets.vue'
};

// Ensure all dirs exist
for (const newPath of Object.values(mapping)) {
  const dir = path.dirname(path.join(srcDir, newPath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Regex to find imports: import ... from '...' or src="..."
const importRegex = /(?:from\s+|import\s+)['"]([^'"]+)['"]/g;
const dynamicImportRegex = /import\(['"]([^'"]+)['"]\)/g;
const srcRegex = /(?:src|href)=['"]([^'"]+)['"]/g;

for (const [oldRelative, newRelative] of Object.entries(mapping)) {
  const oldPath = path.join(srcDir, oldRelative);
  if (!fs.existsSync(oldPath)) {
    console.warn("File not found:", oldPath);
    continue;
  }

  const newPath = path.join(srcDir, newRelative);

  if (oldPath.endsWith('.png') || oldPath.endsWith('.jpg') || oldPath.endsWith('.jpeg')) {
    if (oldPath !== newPath) {
      fs.copyFileSync(oldPath, newPath);
    }
    continue;
  }

  let content = fs.readFileSync(oldPath, 'utf8');

  const replacer = (match, p1) => {
    if (p1.startsWith('@') || p1.startsWith('http') || path.isAbsolute(p1)) {
      return match;
    }
    
    if (p1.startsWith('.')) {
      const absoluteTarget = path.resolve(path.dirname(oldPath), p1);
      let targetRelativeSrc = path.relative(srcDir, absoluteTarget).replace(/\\/g, '/');

      if (mapping[targetRelativeSrc]) {
        return match.replace(p1, `@/${mapping[targetRelativeSrc]}`);
      } else if (mapping[targetRelativeSrc + '.vue']) {
        return match.replace(p1, `@/${mapping[targetRelativeSrc + '.vue']}`);
      } else if (mapping[targetRelativeSrc + '.js']) {
        return match.replace(p1, `@/${mapping[targetRelativeSrc + '.js']}`);
      }
    }
    return match;
  };

  content = content.replace(importRegex, replacer);
  content = content.replace(dynamicImportRegex, replacer);
  content = content.replace(srcRegex, replacer);

  if (oldPath !== newPath) {
    fs.writeFileSync(newPath, content);
  } else {
    fs.writeFileSync(oldPath, content);
  }
}

// After all new files are written, delete old ones
for (const [oldRelative, newRelative] of Object.entries(mapping)) {
  const oldPath = path.join(srcDir, oldRelative);
  const newPath = path.join(srcDir, newRelative);
  if (oldPath !== newPath && fs.existsSync(oldPath)) {
    fs.unlinkSync(oldPath);
  }
}

console.log("Migration complete!");
