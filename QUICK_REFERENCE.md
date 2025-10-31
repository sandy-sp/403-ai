# 🚀 Quick Reference - 403 AI

## 📚 Documentation

| What | Where |
|------|-------|
| **Project Overview** | [README.md](README.md) |
| **Doc Index** | [DOCUMENTATION.md](DOCUMENTATION.md) |
| **All Docs** | [docs/](docs/) |

## 🎯 Common Tasks

### Deploy to Production

```bash
npm run deploy:setup    # Automated setup
vercel --prod          # Deploy
```

### Check Deployment Readiness

```bash
npm run deploy:pre-check
```

### Validate Database

```bash
npm run deploy:check-db
```

### Development

```bash
npm install            # Install dependencies
npm run dev           # Start dev server
npm run build         # Build for production
npm run type-check    # Check TypeScript
```

## 📖 Key Documents

| Document | Purpose | Time |
|----------|---------|------|
| [Quick Deploy](docs/deployment/QUICK_DEPLOY.md) | Deploy in 5 min | 5 min |
| [Setup Guide](docs/guides/SETUP.md) | Dev setup | 10 min |
| [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md) | Full deployment | 30 min |
| [Audit Report](docs/reports/AUDIT_REPORT.md) | Code quality | 1 hour |

## 🔧 Scripts

```bash
npm run deploy:setup        # Full automated setup
npm run deploy:check-db     # Database validation
npm run deploy:pre-check    # Pre-deployment checks
npm run deploy:vercel-env   # Vercel env setup
```

## 📁 Structure

```
403-ai/
├── README.md              # Start here
├── DOCUMENTATION.md       # Doc index
├── docs/                  # All documentation
│   ├── deployment/       # Deployment guides
│   ├── guides/          # How-to guides
│   ├── reports/         # Audit reports
│   └── archive/         # Old docs
└── scripts/              # Automation scripts
```

## 🆘 Help

- **Can't find a doc?** → Check [DOCUMENTATION.md](DOCUMENTATION.md)
- **Need to deploy?** → See [docs/deployment/QUICK_DEPLOY.md](docs/deployment/QUICK_DEPLOY.md)
- **Setting up dev?** → See [docs/guides/SETUP.md](docs/guides/SETUP.md)
- **Technical review?** → See [docs/reports/AUDIT_REPORT.md](docs/reports/AUDIT_REPORT.md)

---

**Last Updated:** October 31, 2025  
**Status:** ✅ Production Ready
